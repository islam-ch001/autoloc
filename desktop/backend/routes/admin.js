const router = require('express').Router();
const pool = require('../db/pool');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

router.use(requireAuth, requireSuperAdmin);

router.get('/users', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.id, u.email, u.name, u.role, u.is_super_admin,
        u.blocked, u.blocked_reason,
        u.subscription_status, u.subscription_end, u.subscription_plan, u.subscription_notes,
        u.created_at, u.last_login_at,
        (SELECT COUNT(*) FROM vehicles WHERE user_id = u.id) AS vehicles_count,
        (SELECT COUNT(*) FROM clients WHERE user_id = u.id) AS clients_count,
        (SELECT COUNT(*) FROM reservations WHERE user_id = u.id) AS reservations_count
      FROM users u
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/subscription', async (req, res) => {
  try {
    const { status, end, plan, notes } = req.body;
    if (status && !['none', 'active', 'expired', 'trial'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const fields = [];
    const values = [];
    let i = 1;
    if (status !== undefined) { fields.push(`subscription_status = $${i++}`); values.push(status); }
    if (end !== undefined) { fields.push(`subscription_end = $${i++}`); values.push(end || null); }
    if (plan !== undefined) { fields.push(`subscription_plan = $${i++}`); values.push(plan || null); }
    if (notes !== undefined) { fields.push(`subscription_notes = $${i++}`); values.push(notes || null); }
    if (!fields.length) return res.status(400).json({ error: 'Aucun champ a mettre a jour' });

    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, email, name, subscription_status, subscription_end, subscription_plan`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/block', async (req, res) => {
  try {
    const { blocked, reason } = req.body;
    const { rows } = await pool.query(
      'UPDATE users SET blocked = $1, blocked_reason = $2 WHERE id = $3 RETURNING id, email, blocked',
      [blocked ? 1 : 0, reason || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
