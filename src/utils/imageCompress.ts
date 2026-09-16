/**
 * Client-side image compression utility.
 * Resizes large smartphone camera photos to a max dimension of 1024px
 * and compresses with JPEG quality 0.75-0.80 to minimize mobile data usage
 * for farmers on 2G/3G rural networks.
 */
export async function compressImageClientSide(
  file: File,
  maxDimension: number = 1024,
  quality: number = 0.8
): Promise<{ compressedDataUrl: string; originalSizeBytes: number; compressedSizeBytes: number; compressionRatio: number }> {
  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Clean white background for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Approximate bytes from base64
        const head = 'data:image/jpeg;base64,';
        const base64Length = compressedDataUrl.length - head.length;
        const compressedSizeBytes = Math.round((base64Length * 3) / 4);

        const compressionRatio = Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100);

        resolve({
          compressedDataUrl,
          originalSizeBytes,
          compressedSizeBytes,
          compressionRatio: Math.max(0, compressionRatio)
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
