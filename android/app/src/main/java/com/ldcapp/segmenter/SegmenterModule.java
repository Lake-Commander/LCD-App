package com.ldcapp.segmenter;

import android.content.res.AssetFileDescriptor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import com.google.android.gms.tflite.client.TfLiteInitializationOptions;
import com.google.android.gms.tflite.java.TfLite;
import org.tensorflow.lite.InterpreterApi;
import org.tensorflow.lite.InterpreterApi.Options.TfLiteRuntime;

import java.io.FileInputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;

public class SegmenterModule extends ReactContextBaseJavaModule {
    private InterpreterApi tfliteInterpreter;
    private final int MODEL_WIDTH = 256;
    private final int MODEL_HEIGHT = 256;
    private final int CHANNELS = 3;

    private final ByteBuffer inputBuffer;
    private final ByteBuffer outputBuffer;
    private final int[] intValues;

    public SegmenterModule(ReactApplicationContext reactContext) {
        super(reactContext);
        inputBuffer = ByteBuffer.allocateDirect(4 * MODEL_WIDTH * MODEL_HEIGHT * CHANNELS);
        inputBuffer.order(ByteOrder.nativeOrder());

        outputBuffer = ByteBuffer.allocateDirect(4 * MODEL_WIDTH * MODEL_HEIGHT * 1);
        outputBuffer.order(ByteOrder.nativeOrder());

        intValues = new int[MODEL_WIDTH * MODEL_HEIGHT];
        initInterpreter();
    }

    @NonNull
    @Override
    public String getName() {
        return "SegmenterModule";
    }

    private void initInterpreter() {
        try {
            TfLiteInitializationOptions initOptions = TfLiteInitializationOptions.builder()
                .setEnableGpuDelegateSupport(true)
                .build();

            TfLite.initialize(getReactApplicationContext(), initOptions)
                .addOnSuccessListener(unused -> {
                    try {
                        MappedByteBuffer modelBuffer = loadModelFile("selfie_segmenter.tflite");
                        InterpreterApi.Options options = new InterpreterApi.Options()
                            .setRuntime(TfLiteRuntime.FROM_SYSTEM_ONLY)
                            .setNumThreads(4);

                        tfliteInterpreter = InterpreterApi.create(modelBuffer, options);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                })
                .addOnFailureListener(e -> {
                    try {
                        MappedByteBuffer modelBuffer = loadModelFile("selfie_segmenter.tflite");
                        InterpreterApi.Options options = new InterpreterApi.Options()
                            .setNumThreads(4);
                        tfliteInterpreter = InterpreterApi.create(modelBuffer, options);
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private MappedByteBuffer loadModelFile(String modelName) throws Exception {
        AssetFileDescriptor fileDescriptor = getReactApplicationContext().getAssets().openFd(modelName);
        FileInputStream inputStream = new FileInputStream(fileDescriptor.getFileDescriptor());
        FileChannel fileChannel = inputStream.getChannel();
        long startOffset = fileDescriptor.getStartOffset();
        long declaredLength = fileDescriptor.getDeclaredLength();
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength);
    }

    @ReactMethod
    public void isModelLoaded(Promise promise) {
        promise.resolve(tfliteInterpreter != null);
    }

    @ReactMethod
    public void segmentBitmapBase64(String base64Data, Promise promise) {
        if (tfliteInterpreter == null) {
            promise.reject("E_NOT_LOADED", "TFLite Interpreter is not loaded yet.");
            return;
        }

        try {
            byte[] decodedBytes = Base64.decode(base64Data, Base64.DEFAULT);
            Bitmap originalBitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
            if (originalBitmap == null) {
                promise.reject("E_DECODE", "Failed to decode input image.");
                return;
            }

            processAndRunInference(originalBitmap, promise);
        } catch (Exception e) {
            promise.reject("E_SEGMENT", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void segmentPhotoFile(String filePath, Promise promise) {
        if (tfliteInterpreter == null) {
            promise.reject("E_NOT_LOADED", "TFLite Interpreter is not loaded yet.");
            return;
        }

        try {
            String cleanPath = filePath.replace("file://", "");
            Bitmap originalBitmap = BitmapFactory.decodeFile(cleanPath);
            if (originalBitmap == null) {
                promise.reject("E_DECODE", "Failed to decode image from path: " + cleanPath);
                return;
            }

            // Read EXIF orientation metadata
            ExifInterface exif = new ExifInterface(cleanPath);
            int orientation = exif.getAttributeInt(
                ExifInterface.TAG_ORIENTATION, 
                ExifInterface.ORIENTATION_NORMAL
            );

            Matrix matrix = new Matrix();
            switch (orientation) {
                case ExifInterface.ORIENTATION_ROTATE_90:
                    matrix.postRotate(90);
                    break;
                case ExifInterface.ORIENTATION_ROTATE_180:
                    matrix.postRotate(180);
                    break;
                case ExifInterface.ORIENTATION_ROTATE_270:
                    matrix.postRotate(270);
                    break;
                default:
                    break;
            }

            Bitmap rotatedBitmap = Bitmap.createBitmap(
                originalBitmap, 0, 0, 
                originalBitmap.getWidth(), originalBitmap.getHeight(), 
                matrix, true
            );

            processAndRunInference(rotatedBitmap, promise);
        } catch (Exception e) {
            promise.reject("E_SEGMENT", e.getMessage(), e);
        }
    }

    private synchronized void processAndRunInference(Bitmap originalBitmap, Promise promise) {
        Bitmap scaledBitmap = Bitmap.createScaledBitmap(originalBitmap, MODEL_WIDTH, MODEL_HEIGHT, true);

        inputBuffer.rewind();
        scaledBitmap.getPixels(intValues, 0, MODEL_WIDTH, 0, 0, MODEL_WIDTH, MODEL_HEIGHT);

        int pixelIndex = 0;
        for (int i = 0; i < MODEL_HEIGHT; ++i) {
            for (int j = 0; j < MODEL_WIDTH; ++j) {
                final int val = intValues[pixelIndex++];
                inputBuffer.putFloat(((val >> 16) & 0xFF) / 255.0f);
                inputBuffer.putFloat(((val >> 8) & 0xFF) / 255.0f);
                inputBuffer.putFloat((val & 0xFF) / 255.0f);
            }
        }

        outputBuffer.rewind();
        tfliteInterpreter.run(inputBuffer, outputBuffer);

        outputBuffer.rewind();
        byte[] maskBytes = new byte[MODEL_WIDTH * MODEL_HEIGHT];
        for (int i = 0; i < MODEL_WIDTH * MODEL_HEIGHT; i++) {
            float confidence = outputBuffer.getFloat();
            maskBytes[i] = (byte) (confidence > 0.5f ? 255 : 0);
        }

        String maskBase64 = Base64.encodeToString(maskBytes, Base64.NO_WRAP);
        WritableMap result = Arguments.createMap();
        result.putString("mask", maskBase64);
        result.putInt("width", MODEL_WIDTH);
        result.putInt("height", MODEL_HEIGHT);

        promise.resolve(result);
    }
}