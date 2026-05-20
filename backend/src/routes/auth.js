const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../db/pool');
const { requireAuth, requireAuthOnly, signToken } = require('../middleware/auth');
const { sendVerificationCode } = require('../lib/mailer');

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

// POST /api/auth/signup-request — Étape 1 : valider, envoyer code de vérification par email
router.post('/signup-request', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
    if (password.length < 6) return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
    if (!name.trim() || name.trim().length < 2) return res.status(400).json({ error: 'Nom invalide (minimum 2 caractères)' });

    const check = validateEmail(email);
    if (!check.ok) return res.status(400).json({ error: check.error });
    const cleanEmail = check.email;

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.length) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

    // Nettoyer les anciennes demandes pour cet email
    await pool.query('DELETE FROM email_verifications WHERE email = $1 OR expires_at < NOW()', [cleanEmail]);

    // Générer un code 6 chiffres + hasher
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO email_verifications (email, code_hash, name, password_hash, expires_at)
       VALUES ($1,$2,$3,$4, NOW() + INTERVAL '10 minutes')`,
      [cleanEmail, codeHash, name.trim(), passwordHash]
    );

    // Envoyer l'email (si SMTP configuré)
    try {
      await sendVerificationCode({ to: cleanEmail, code, name: name.trim() });
    } catch (err) {
      console.error('[signup-request] Erreur envoi email:', err);
      const debugDetails = process.env.SMTP_DEBUG === 'true'
        ? ` [${err.code || ''} ${err.responseCode || ''}: ${err.response || err.message}]`
        : '';
      return res.status(500).json({ error: "Impossible d'envoyer l'email de vérification." + debugDetails });
    }

    res.json({ ok: true, email: cleanEmail, message: 'Code envoyé par email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup-verify — Étape 2 : vérifier code et créer compte
router.post('/signup-verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email et code requis' });
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    const { rows } = await pool.query(
      'SELECT * FROM email_verifications WHERE email = $1 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [cleanEmail]
    );
    if (!rows.length) return res.status(400).json({ error: 'Code expiré ou introuvable. Recommencez l\'inscription.' });

    const verif = rows[0];
    if (verif.attempts >= 5) {
      await pool.query('DELETE FROM email_verifications WHERE id = $1', [verif.id]);
      return res.status(429).json({ error: 'Trop de tentatives. Recommencez l\'inscription.' });
    }

    const codeHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
    if (codeHash !== verif.code_hash) {
      await pool.query('UPDATE email_verifications SET attempts = attempts + 1 WHERE id = $1', [verif.id]);
      return res.status(400).json({ error: 'Code incorrect' });
    }

    // Code OK → créer le compte
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.length) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

    const { rows: created } = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, subscription_status, subscription_end, subscription_plan)
       VALUES ($1,$2,$3,'admin','trial', (CURRENT_DATE + INTERVAL '3 days')::date, 'Essai 3 jours')
       RETURNING id, email, name, role, is_super_admin, subscription_status, subscription_end, subscription_plan, created_at`,
      [cleanEmail, verif.password_hash, verif.name]
    );
    const user = created[0];
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [cleanEmail]);

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup-resend — Renvoyer un nouveau code
router.post('/signup-resend', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });
    const cleanEmail = String(email).trim().toLowerCase();

    const { rows } = await pool.query(
      'SELECT name, password_hash FROM email_verifications WHERE email = $1 ORDER BY id DESC LIMIT 1',
      [cleanEmail]
    );
    if (!rows.length) return res.status(404).json({ error: 'Aucune demande en cours. Recommencez l\'inscription.' });

    const { name, password_hash } = rows[0];
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [cleanEmail]);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    await pool.query(
      `INSERT INTO email_verifications (email, code_hash, name, password_hash, expires_at)
       VALUES ($1,$2,$3,$4, NOW() + INTERVAL '10 minutes')`,
      [cleanEmail, codeHash, name, password_hash]
    );

    try {
      await sendVerificationCode({ to: cleanEmail, code, name });
    } catch (err) {
      console.error('[signup-resend] Erreur:', err.message);
      return res.status(500).json({ error: "Impossible d'envoyer l'email." });
    }
    res.json({ ok: true });
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
