const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAuth, signToken } = require('../middleware/auth');

// POST /api/auth/register — inscription publique
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    // Vérifier l'unicité
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.length) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

    // Compter les users — le 1er devient admin automatiquement
    const { rows: count } = await pool.query('SELECT COUNT(*)::int AS n FROM users');
    const role = count[0].n === 0 ? 'admin' : 'user';

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id, email, name, role, created_at',
      [cleanEmail, hash, name.trim(), role]
    );
    const user = rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
    const cleanEmail = String(email).trim().toLowerCase();

    const { rows } = await pool.query(
      'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
      [cleanEmail]
    );
    if (!rows.length) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — info de l'utilisateur courant
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, created_at, last_login_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
