const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// JWT seul + blocage (sans check abonnement) — pour les routes auth (/me, /settings)
async function requireAuthOnly(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT blocked, blocked_reason, is_super_admin FROM users WHERE id = $1',
      [payload.id]
    );
    if (!rows.length) return res.status(401).json({ error: 'Compte introuvable' });
    if (rows[0].blocked) return res.status(403).json({ error: rows[0].blocked_reason || 'Compte bloqué', blocked: true });
    req.user = { ...payload, isSuperAdmin: rows[0].is_super_admin };
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT blocked, blocked_reason, is_super_admin, subscription_status, subscription_end FROM users WHERE id = $1',
      [payload.id]
    );
    if (!rows.length) return res.status(401).json({ error: 'Compte introuvable' });
    const u = rows[0];
    if (u.blocked) return res.status(403).json({ error: u.blocked_reason || 'Compte bloqué', blocked: true });

    // Vérification abonnement (super-admin bypassé) — accepte 'active' ET 'trial' valides
    if (!u.is_super_admin) {
      const exp = u.subscription_end ? new Date(u.subscription_end) : null;
      const validStatus = u.subscription_status === 'active' || u.subscription_status === 'trial';
      const isActive = validStatus && exp && exp >= new Date();
      if (!isActive) {
        return res.status(402).json({
          error: 'Abonnement requis ou expiré',
          subscription_required: true,
          subscription_status: u.subscription_status,
          subscription_end: u.subscription_end,
        });
      }
    }

    req.user = { ...payload, isSuperAdmin: u.is_super_admin };
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function requireSuperAdmin(req, res, next) {
  if (!req.user?.isSuperAdmin) return res.status(403).json({ error: 'Réservé au super administrateur' });
  next();
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

module.exports = { requireAuth, requireAuthOnly, requireSuperAdmin, signToken };
