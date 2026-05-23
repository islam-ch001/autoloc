const crypto = require('crypto');
const os = require('os');

// ⚠️ SECRET — A NE PAS PARTAGER. Stocke dans une variable d'env serait mieux,
// mais comme c'est une app desktop on l'embed (obfusqué).
// Si quelqu'un extrait le secret, il peut generer ses propres cles.
// Pour une protection plus forte, utilisez activation serveur.
const LICENSE_SECRET = process.env.AUTOLOC_LICENSE_SECRET || 'autoloc-2026-DZ-private-secret-k7xQ9mPnVrJ3sBzL';

// ─── Empreinte matérielle (machine ID) ──────────────────────
// Combine plusieurs caractéristiques système pour identifier de manière unique le PC.
// Si l'utilisateur change de PC, l'empreinte change → la cle ne fonctionne plus.
function getMachineId() {
  const parts = [];

  // 1. Nom du PC
  parts.push(os.hostname() || '');

  // 2. Plateforme + arch
  parts.push(os.platform());
  parts.push(os.arch());

  // 3. Premier MAC physique trouvé (interface non-virtuelle)
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
        parts.push(iface.mac);
        break;
      }
    }
    if (parts.length >= 4) break;
  }

  // 4. CPU model (stable sur la durée de vie du PC)
  const cpus = os.cpus();
  if (cpus.length > 0) parts.push(cpus[0].model || '');

  const raw = parts.join('|');
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

// ─── Génération d'une clé ──────────────────────────────────
// Format : XXXX-XXXX-XXXX-XXXX-XXXX (20 caractères + 4 tirets)
// Composée de 16 caractères aléatoires + 4 caractères de checksum HMAC.
function generateKey() {
  // 16 chars de base aléatoires (lettres/chiffres lisibles, sans 0/O/1/I)
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let base = '';
  const randBytes = crypto.randomBytes(16);
  for (let i = 0; i < 16; i++) {
    base += ALPHABET[randBytes[i] % ALPHABET.length];
  }
  // Checksum HMAC sur le base
  const checksum = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(base)
    .digest('hex')
    .toUpperCase()
    .slice(0, 4);
  const full = base + checksum;  // 20 chars
  // Formatage avec tirets : XXXX-XXXX-XXXX-XXXX-XXXX
  return full.match(/.{1,4}/g).join('-');
}

// ─── Validation d'une clé ──────────────────────────────────
// Verifie que le format + checksum est valide (cle generee par notre secret).
function validateKey(key) {
  if (!key || typeof key !== 'string') return false;
  const clean = key.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length !== 20) return false;
  const base = clean.slice(0, 16);
  const checksum = clean.slice(16);
  const expected = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(base)
    .digest('hex')
    .toUpperCase()
    .slice(0, 4);
  return checksum === expected;
}

// ─── Helper : formate une clé brute en format affiché ──────
function formatKey(rawKey) {
  const clean = String(rawKey).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean.match(/.{1,4}/g)?.join('-') || rawKey;
}

module.exports = {
  getMachineId,
  generateKey,
  validateKey,
  formatKey,
};
