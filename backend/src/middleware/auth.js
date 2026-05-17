const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Vérifier que l'utilisateur n'est pas bloqué (peut changer après émission du token)
    const { rows } = await pool.query('SELECT blocked, blocked_reason FROM users WHERE id = $1', [payload.id]);
    if (!rows.length) return res.status(401).json({ error: 'Compte introuvable' });
    if (rows[0].blocked) return res.status(403).json({ error: rows[0].blocked_reason || 'Compte bloqué', blocked: true });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

module.exports = { requireAuth, signToken };
