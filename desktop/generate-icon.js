/**
 * Genere desktop/icon.ico depuis assets/icon-only.png
 * (taille originale 4167x4167 → resize en 16, 24, 32, 48, 64, 128, 256)
 */

const path = require('path');
const fs = require('fs');
const pngToIcoMod = require('png-to-ico');
const pngToIco = pngToIcoMod.default || pngToIcoMod;
const sharp = require('sharp');

const SOURCE = path.join(__dirname, '..', 'assets', 'icon-only.png');
const OUT_ICO = path.join(__dirname, 'icon.ico');
const TEMP_DIR = path.join(__dirname, '.icon-temp');
const SIZES = [16, 24, 32, 48, 64, 128, 256];

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`❌ Source introuvable : ${SOURCE}`);
    process.exit(1);
  }

  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  console.log(`📥 Source : ${SOURCE}`);
  console.log(`🔧 Generation des PNG aux tailles : ${SIZES.join(', ')}`);

  const tempPngPaths = [];
  for (const size of SIZES) {
    const out = path.join(TEMP_DIR, `icon-${size}.png`);
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 99, g: 102, b: 241, alpha: 1 } })
      .png()
      .toFile(out);
    tempPngPaths.push(out);
    console.log(`  ✓ ${size}x${size}`);
  }

  console.log(`📦 Conversion en .ico ...`);
  const icoBuffer = await pngToIco(tempPngPaths);
  fs.writeFileSync(OUT_ICO, icoBuffer);

  // Nettoyage
  for (const p of tempPngPaths) fs.unlinkSync(p);
  fs.rmdirSync(TEMP_DIR);

  console.log(`✅ Cree : ${OUT_ICO} (${(icoBuffer.length / 1024).toFixed(1)} KB)`);
}

main().catch(err => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});
