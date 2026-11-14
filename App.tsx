import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  NativeModules,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { Skia, SkImage } from '@shopify/react-native-skia';
import { CompositeCanvas } from './src/components/CompositeCanvas';
import { createSkiaMask } from './src/utils/maskRenderer';

const { SegmenterModule } = NativeModules;

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [localFrame, setLocalFrame] = useState<SkImage | null>(null);
  const [localMask, setLocalMask] = useState<SkImage | null>(null);

  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice(cameraPosition);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!hasPermission) {
          await requestPermission();
        }
        if (SegmenterModule) {
          const loaded = await SegmenterModule.isModelLoaded();
          if (isMounted) setModelLoaded(loaded);
        }
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        if (isMounted) setPermissionChecked(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [hasPermission, requestPermission]);

  const toggleCamera = useCallback(() => {
    setCameraPosition((prev) => (prev === 'front' ? 'back' : 'front'));
  }, []);

  const captureAndSegment = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);

      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
      });

      const normalizedPath = photo.path.startsWith('file://')
        ? photo.path
        : `file://${photo.path}`;

      // 1. Load photo into Skia directly from local disk
      const skData = await Skia.Data.fromURI(normalizedPath);
      const skImg = Skia.Image.MakeImageFromEncoded(skData);
      setLocalFrame(skImg);

      // 2. Pass local file path straight to native TFLite module
      if (SegmenterModule) {
        const result = await SegmenterModule.segmentPhotoFile(photo.path);
        const mask = createSkiaMask(result.mask, result.width, result.height);
        setLocalMask(mask);
      }
    } catch (err) {
      console.error('Capture failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCutout = () => {
    setLocalFrame(null);
    setLocalMask(null);
  };

  if (!permissionChecked) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text style={styles.text}>Initializing LDC Hardware...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Camera permission was denied.</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Sensor unavailable ({cameraPosition})...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Live viewfinder */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Skia Composite Layer */}
      {localFrame && (
        <CompositeCanvas localFrame={localFrame} localMask={localMask} />
      )}

      {/* HUD Info */}
      <View style={styles.overlay}>
        <Text style={styles.hudText}>LDC Engine: Active</Text>
        <Text style={styles.subHudText}>Sensor: {cameraPosition.toUpperCase()}</Text>
        <Text style={[styles.subHudText, { color: modelLoaded ? '#00ffcc' : '#ffaa00' }]}>
          TFLite Model: {modelLoaded ? 'Ready' : 'Standby'}
        </Text>
      </View>

      {/* Shutter / Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.actionButton} onPress={toggleCamera}>
          <Text style={styles.btnText}>Flip 🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.btnDisabled]}
          onPress={captureAndSegment}
          disabled={isProcessing}
        >
          <Text style={styles.captureText}>
            {isProcessing ? 'Segmenting...' : 'Cutout ✂️'}
          </Text>
        </TouchableOpacity>

        {localFrame && (
          <TouchableOpacity style={styles.actionButton} onPress={clearCutout}>
            <Text style={styles.btnText}>Clear ✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  text: { color: '#fff', marginTop: 12, fontSize: 14 },
  errorText: { color: '#ff4d4d', fontSize: 14 },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00ffcc',
  },
  hudText: { color: '#00ffcc', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  subHudText: { color: '#aaa', fontSize: 11, marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderColor: '#00ffcc',
    borderWidth: 1.2,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  captureButton: {
    backgroundColor: '#00ffcc',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
  },
  btnDisabled: { backgroundColor: '#555' },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  captureText: { color: '#000', fontSize: 15, fontWeight: 'bold' },
});