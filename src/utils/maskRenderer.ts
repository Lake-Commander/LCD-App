import { Skia, AlphaType, ColorType } from '@shopify/react-native-skia';

/**
 * Converts a base64 grayscale/binary mask into a Skia Alpha-8 SkImage.
 * @param maskBase64 Raw byte buffer as base64 string (values 0 or 255)
 * @param width Mask pixel width (256)
 * @param height Mask pixel height (256)
 */
export function createSkiaMask(maskBase64: string, width = 256, height = 256) {
  try {
    const rawBinary = atob(maskBase64);
    const pixelBytes = new Uint8Array(width * height * 4);

    // Populate RGBA pixels where Alpha is driven by the segmentation mask
    for (let i = 0; i < width * height; i++) {
      const alphaVal = rawBinary.charCodeAt(i);
      const idx = i * 4;
      pixelBytes[idx] = 255;       // R
      pixelBytes[idx + 1] = 255;   // G
      pixelBytes[idx + 2] = 255;   // B
      pixelBytes[idx + 3] = alphaVal; // A (Transparent when 0, Opaque when 255)
    }

    const data = Skia.Data.fromBytes(pixelBytes);
    return Skia.Image.MakeImage(
      {
        width,
        height,
        alphaType: AlphaType.Premul,
        colorType: ColorType.RGBA_8888,
      },
      data,
      width * 4
    );
  } catch (err) {
    console.error('Error creating Skia mask:', err);
    return null;
  }
}