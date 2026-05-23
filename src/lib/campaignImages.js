/** Bild für Kampagnen — Komprimierung & Validierung */

const MAX_BYTES = 320_000;
const MAX_DIM = 960;

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

export function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Bitte eine Bilddatei wählen (JPG, PNG, WebP)."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("Bild maximal 8 MB — bitte ein kleineres Foto wählen."));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(1, MAX_DIM / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.82;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > MAX_BYTES && quality > 0.45) {
        quality -= 0.08;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      if (dataUrl.length > MAX_BYTES) {
        reject(new Error("Bild zu groß — bitte ein kleineres Foto verwenden."));
        return;
      }
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bild konnte nicht geladen werden."));
    };
    img.src = url;
  });
}
