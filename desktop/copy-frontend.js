// Copie le build Vite (../dist) vers desktop/frontend
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'dist');
const dst = path.join(__dirname, 'frontend');

if (!fs.existsSync(src)) {
  console.error('❌ ../dist introuvable. Lancez d\'abord `npm run build` dans le projet web.');
  process.exit(1);
}

// Nettoyer
if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true, force: true });
fs.mkdirSync(dst, { recursive: true });

function copyDir(srcDir, dstDir) {
  fs.mkdirSync(dstDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(dstDir, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
copyDir(src, dst);
console.log(`✅ Frontend copié : ${src} → ${dst}`);
