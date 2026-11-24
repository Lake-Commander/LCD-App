import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  type CameraRef,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';
import { Skia, SkImage } from '@shopify/react-native-skia';
import { CompositeCanvas } from '../components/CompositeCanvas';
import { createSkiaMask } from '../utils/maskRenderer';

const { SegmenterModule } = NativeModules;

export function CameraStudioScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localFrame, setLocalFrame] = useState<SkImage | null>(null);
  const [localMask, setLocalMask] = useState<SkImage | null>(null);
  const cameraRef = useRef<CameraRef>(null);
  const photoOutput = usePhotoOutput();
  const device = useCameraDevice(cameraPosition);

  useEffect(() => {
    let isMounted = true;
    async function initialize() {
      try {
        if (!hasPermission) await requestPermission();
        if (SegmenterModule) {
          const loaded = await SegmenterModule.isModelLoaded();
          if (isMounted) setModelLoaded(loaded);
        }
      } catch (error) {
        console.warn('Camera initialization failed:', error);
      } finally {
        if (isMounted) setPermissionChecked(true);
      }
    }
    initialize();
    return () => {
      isMounted = false;
    };
  }, [hasPermission, requestPermission]);

  const captureAndSegment = useCallback(async () => {
    if (!cameraRef.current || isProcessing) return;
    try {
      setIsProcessing(true);
      const photo = await photoOutput.capturePhoto({ flashMode: 'off' }, {});
      const path = await photo.saveToTemporaryFileAsync();
      const data = await Skia.Data.fromURI(path);
      setLocalFrame(Skia.Image.MakeImageFromEncoded(data));

      if (SegmenterModule) {
        const result = await SegmenterModule.segmentPhotoFile(path);
        setLocalMask(createSkiaMask(result.mask, result.width, result.height));
      }
      photo.dispose();
    } catch (error) {
      console.error('Capture failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, photoOutput]);

  if (!permissionChecked) {
    return <StatusView message="Initializing LDC camera..." loading />;
  }
  if (!hasPermission) {
    return <StatusView message="Camera permission was denied. Enable it in system settings." error />;
  }
  if (!device) {
    return <StatusView message={`Camera unavailable (${cameraPosition}).`} />;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        outputs={[photoOutput]}
      />
      {localFrame && <CompositeCanvas localFrame={localFrame} localMask={localMask} />}

      <View style={styles.overlay}>
        <Text style={styles.hudText}>LDC CAMERA STUDIO</Text>
        <Text style={styles.subHudText}>Sensor: {cameraPosition.toUpperCase()}</Text>
        <Text style={[styles.subHudText, modelLoaded ? styles.ready : styles.waiting]}>
          Segmentation: {modelLoaded ? 'Ready' : 'Standby'}
        </Text>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setCameraPosition(
          (previous) => (previous === 'front' ? 'back' : 'front'),
        )}>
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.disabled]}
          onPress={captureAndSegment}
          disabled={isProcessing}
        >
          <Text style={styles.captureText}>{isProcessing ? 'Working...' : 'Cutout'}</Text>
        </TouchableOpacity>
        {localFrame && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setLocalFrame(null);
              setLocalMask(null);
            }}
          >
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function StatusView({ message, loading = false, error = false }: {
  message: string;
  loading?: boolean;
  error?: boolean;
}) {
  return (
    <View style={styles.center}>
      {loading && <ActivityIndicator size="large" color="#00ffcc" />}
      <Text style={error ? styles.errorText : styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 24 },
  text: { color: '#fff', marginTop: 12, fontSize: 14, textAlign: 'center' },
  errorText: { color: '#ff7777', fontSize: 14, textAlign: 'center' },
  overlay: { position: 'absolute', top: 24, left: 16, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#00ffcc' },
  hudText: { color: '#00ffcc', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  subHudText: { color: '#aaa', fontSize: 11, marginTop: 4 },
  ready: { color: '#00ffcc' },
  waiting: { color: '#ffaa00' },
  bottomBar: { position: 'absolute', bottom: 28, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  actionButton: { backgroundColor: 'rgba(0,0,0,0.75)', borderColor: '#00ffcc', borderWidth: 1, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 24 },
  captureButton: { backgroundColor: '#00ffcc', paddingHorizontal: 28, paddingVertical: 15, borderRadius: 30 },
  disabled: { backgroundColor: '#666' },
  buttonText: { color: '#fff', fontWeight: '600' },
  captureText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});
