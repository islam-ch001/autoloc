const jwt = require('jsonwebtoken');

// En mode desktop, le secret est généré au premier lancement et stocké localement
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const crypto = require('crypto');

function getSecret() {
  const dir = app ? app.getPath('userData') : __dirname;
  const file = path.join(dir, '.jwt_secret');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
  const secret = crypto.randomBytes(64).toString('hex');
  fs.writeFileSync(file, secret, 'utf8');
  return secret;
}
const JWT_SECRET = getSecret();

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '90d' });
}

module.exports = { requireAuth, signToken };
