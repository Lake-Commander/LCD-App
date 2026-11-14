import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Canvas,
  Image as SkiaImage,
  Paint,
  Group,
  BlendMode,
  SkImage,
  Rect,
} from '@shopify/react-native-skia';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CompositeCanvasProps {
  localFrame: SkImage | null;
  localMask: SkImage | null;
  cameraPosition?: 'front' | 'back';
  backgroundColor?: string;
}

export const CompositeCanvas: React.FC<CompositeCanvasProps> = ({
  localFrame,
  localMask,
  cameraPosition = 'front',
  backgroundColor = '#10101a',
}) => {
  // Compute transform metrics to preserve aspect ratio (cover mode)
  const layout = useMemo(() => {
    if (!localFrame) return null;

    const imgWidth = localFrame.width();
    const imgHeight = localFrame.height();

    // Calculate scale ratio to cover portrait screen
    const scale = Math.max(SCREEN_WIDTH / imgWidth, SCREEN_HEIGHT / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Center image on screen
    const offsetX = (SCREEN_WIDTH - scaledWidth) / 2;
    const offsetY = (SCREEN_HEIGHT - scaledHeight) / 2;

    return {
      x: offsetX,
      y: offsetY,
      width: scaledWidth,
      height: scaledHeight,
    };
  }, [localFrame]);

  // Mirror front camera horizontally to match live viewfinder intuition
  const groupTransforms = useMemo(() => {
    if (cameraPosition === 'front') {
      return [
        { translateX: SCREEN_WIDTH },
        { scaleX: -1 },
      ];
    }
    return [];
  }, [cameraPosition]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Canvas style={styles.canvas}>
        {/* Layer 1: Background Canvas */}
        <Rect
          x={0}
          y={0}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          color={backgroundColor}
        />

        {/* Layer 2: Proportionally Transformed Cutout */}
        {localFrame && layout && (
          <Group transform={groupTransforms}>
            {/* Base Photo Subject */}
            <SkiaImage
              image={localFrame}
              x={layout.x}
              y={layout.y}
              width={layout.width}
              height={layout.height}
              fit="contain"
            />

            {/* Segmented Alpha Mask */}
            {localMask && (
              <SkiaImage
                image={localMask}
                x={layout.x}
                y={layout.y}
                width={layout.width}
                height={layout.height}
                fit="contain"
              >
                <Paint blendMode={BlendMode.DstIn} />
              </SkiaImage>
            )}
          </Group>
        )}
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});