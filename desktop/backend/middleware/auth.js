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

const pool = require('../db/pool');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query('SELECT blocked, blocked_reason, is_super_admin FROM users WHERE id = $1', [payload.id]);
    if (!rows.length) return res.status(401).json({ error: 'Compte introuvable' });
    if (rows[0].blocked) return res.status(403).json({ error: rows[0].blocked_reason || 'Compte bloqué', blocked: true });
    req.user = { ...payload, isSuperAdmin: !!rows[0].is_super_admin };
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '90d' });
}

function requireSuperAdmin(req, res, next) {
  if (!req.user?.isSuperAdmin) return res.status(403).json({ error: 'Reserve au super administrateur' });
  next();
}

module.exports = { requireAuth, requireSuperAdmin, signToken };
