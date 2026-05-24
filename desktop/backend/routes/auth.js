const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAuth, signToken } = require('../middleware/auth');

// AUTO-LOGIN desktop : single-user offline, pas de mot de passe requis
// Cree un utilisateur local par defaut s'il n'existe pas, retourne un token
router.post('/desktop-auto-login', async (_req, res) => {
  try {
    const LOCAL_EMAIL = 'local@autoloc.app';
    const { rows: existing } = await pool.query('SELECT id, email, name, role, is_super_admin, subscription_status, subscription_end, subscription_plan, settings FROM users WHERE email = $1', [LOCAL_EMAIL]);

    let user;
    if (existing.length) {
      user = existing[0];
    } else {
      // Creation au premier lancement : compte avec acces a vie
      const hash = await bcrypt.hash('local-offline-' + Date.now(), 10);
      const { rows } = await pool.query(
        "INSERT INTO users (email, password_hash, name, role, is_super_admin, subscription_status, subscription_end, subscription_plan) VALUES ($1,$2,$3,'admin',0,'active',date('now','+50 years'),'Local Offline') RETURNING id, email, name, role, is_super_admin, subscription_status, subscription_end, subscription_plan, settings",
        [LOCAL_EMAIL, hash, 'Utilisateur Local']
      );
      user = rows[0];
    }
    // Mise a jour last_login
    await pool.query("UPDATE users SET last_login_at = datetime('now') WHERE id = $1", [user.id]);
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
    if (!password || password.length < 8) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    if (!/[A-Z]/.test(password)) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins une lettre majuscule' });
    const cleanEmail = String(email).trim().toLowerCase();

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.length) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash, name, role, subscription_status, subscription_end, subscription_plan) VALUES ($1,$2,$3,'admin','trial',date('now', '+3 days'),'Essai 3 jours') RETURNING id, email, name, role, is_super_admin, subscription_status, subscription_end, subscription_plan, created_at",
      [cleanEmail, hash, name.trim()]
    );
    const user = rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
    const cleanEmail = String(email).trim().toLowerCase();

    const { rows } = await pool.query('SELECT id, email, name, role, password_hash, blocked, blocked_reason, is_super_admin, subscription_status, subscription_end, subscription_plan FROM users WHERE email = $1', [cleanEmail]);
    if (!rows.length) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    if (user.blocked) return res.status(403).json({ error: user.blocked_reason || 'Votre compte a été bloqué.' });

    await pool.query("UPDATE users SET last_login_at = datetime('now') WHERE id = $1", [user.id]);
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_super_admin: !!user.is_super_admin,
      subscription_status: user.subscription_status,
      subscription_end: user.subscription_end,
      subscription_plan: user.subscription_plan,
    };
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/settings
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT settings FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    let s = rows[0].settings;
    try { s = typeof s === 'string' ? JSON.parse(s || '{}') : (s || {}); } catch { s = {}; }
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/auth/settings
router.put('/settings', requireAuth, async (req, res) => {
  try {
    const settings = req.body || {};
    const raw = JSON.stringify(settings);
    const { rows } = await pool.query(
      'UPDATE users SET settings = $1 WHERE id = $2 RETURNING settings',
      [raw, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    let s = rows[0].settings;
    try { s = typeof s === 'string' ? JSON.parse(s || '{}') : (s || {}); } catch { s = {}; }
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, is_super_admin, subscription_status, subscription_end, subscription_plan, created_at, last_login_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
