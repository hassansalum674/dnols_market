/** Compress image to WebP, max 500kb */
export async function compressToWebP(
  file: File,
  maxKb = 500,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  let { width, height } = bitmap;

  const maxDim = 1200;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.85;
  let dataUrl = canvas.toDataURL("image/webp", quality);

  while (dataUrl.length > maxKb * 1024 * 1.37 && quality > 0.3) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/webp", quality);
  }

  return dataUrl;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
