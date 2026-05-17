// Lit un fichier image, le redimensionne et le compresse en data URL JPEG.
// Stocké directement en base de données comme TEXT → 100% offline.
export function readAndResizeImage(file, opts = {}) {
  const { maxWidth = 800, maxHeight = 500, quality = 0.82 } = opts;
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Aucun fichier'));
    if (!file.type.startsWith('image/')) return reject(new Error('Le fichier doit être une image'));
    if (file.size > 15 * 1024 * 1024) return reject(new Error('Image trop grande (max 15 Mo)'));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image illisible'));
      img.onload = () => {
        // Calcul des dimensions cibles (en gardant le ratio)
        let w = img.width;
        let h = img.height;
        const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        // JPEG pour taille réduite
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
