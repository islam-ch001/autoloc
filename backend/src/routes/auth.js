const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAuth, requireAuthOnly, signToken } = require('../middleware/auth');

// Validation email RFC-light : local@domaine.tld
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// Liste de domaines temporaires/jetables fréquemment utilisés
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com','10minutemail.net','mailinator.com','mailinator.net','tempmail.com',
  'temp-mail.org','tempmail.net','guerrillamail.com','guerrillamail.info','guerrillamail.biz',
  'guerrillamail.net','guerrillamail.org','sharklasers.com','grr.la','spam4.me','yopmail.com',
  'yopmail.fr','yopmail.net','throwaway.email','throwawaymail.com','fakeinbox.com','trashmail.com',
  'trashmail.net','trashmail.de','dispostable.com','maildrop.cc','getnada.com','nada.email',
  'mail.tm','tempr.email','minuteinbox.com','emailondeck.com','mohmal.com','mytemp.email',
  'tempmailaddress.com','tempinbox.com','tmail.ws','tmpmail.org','mintemail.com','spambog.com',
  'fakemail.net','jetable.org','tempemail.com','disposablemail.com','linshiyou.com',
  'temporary-mail.net','tempr.email','wegwerfmail.de','airmail.cc','inboxbear.com',
]);

// Faute de frappe fréquente : suggérer la correction
const TYPO_SUGGESTIONS = {
  'gmial.com':'gmail.com','gmai.com':'gmail.com','gmal.com':'gmail.com','gnail.com':'gmail.com',
  'gmaill.com':'gmail.com','gmail.co':'gmail.com','gmail.con':'gmail.com',
  'yaho.com':'yahoo.com','yhaoo.com':'yahoo.com','yahoo.con':'yahoo.com','yahooo.com':'yahoo.com',
  'hotmial.com':'hotmail.com','hotmal.com':'hotmail.com','hotmail.co':'hotmail.com',
  'outlok.com':'outlook.com','outloo.com':'outlook.com',
};

function validateEmail(email) {
  if (!email || typeof email !== 'string') return { ok: false, error: 'Email requis' };
  const clean = email.trim().toLowerCase();
  if (clean.length > 120) return { ok: false, error: 'Email trop long' };
  if (!EMAIL_REGEX.test(clean)) return { ok: false, error: 'Format d\'email invalide (ex: nom@exemple.com)' };
  const domain = clean.split('@')[1];
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, error: 'Les emails temporaires/jetables ne sont pas autorisés. Utilisez votre vraie adresse email.' };
  }
  if (TYPO_SUGGESTIONS[domain]) {
    return { ok: false, error: `Vouliez-vous dire ${clean.split('@')[0]}@${TYPO_SUGGESTIONS[domain]} ?` };
  }
  return { ok: true, email: clean };
}

// POST /api/auth/register — inscription publique (chaque compte = espace isolé)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
    }
    if (!name.trim() || name.trim().length < 2) {
      return res.status(400).json({ error: 'Nom invalide (minimum 2 caractères)' });
    }
    const check = validateEmail(email);
    if (!check.ok) return res.status(400).json({ error: check.error });
    const cleanEmail = check.email;

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.length) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

    const hash = await bcrypt.hash(password, 10);
    // Donner automatiquement un essai gratuit de 3 jours à tout nouveau compte
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, subscription_status, subscription_end, subscription_plan)
       VALUES ($1,$2,$3,'admin','trial', (CURRENT_DATE + INTERVAL '3 days')::date, 'Essai 3 jours')
       RETURNING id, email, name, role, is_super_admin, subscription_status, subscription_end, subscription_plan, created_at`,
      [cleanEmail, hash, name.trim()]
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
      'SELECT id, email, name, role, password_hash, blocked, blocked_reason, is_super_admin, subscription_status, subscription_end, subscription_plan FROM users WHERE email = $1',
      [cleanEmail]
    );
    if (!rows.length) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    if (user.blocked) return res.status(403).json({ error: user.blocked_reason || 'Votre compte a été bloqué. Contactez l\'administrateur.' });

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_super_admin: user.is_super_admin,
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

// GET /api/auth/settings — paramètres de l'utilisateur courant
router.get('/settings', requireAuthOnly, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT settings FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0].settings || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/auth/settings — mise à jour des paramètres
router.put('/settings', requireAuthOnly, async (req, res) => {
  try {
    const settings = req.body || {};
    const { rows } = await pool.query(
      'UPDATE users SET settings = $1 WHERE id = $2 RETURNING settings',
      [settings, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0].settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/me
router.get('/me', requireAuthOnly, async (req, res) => {
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
