const router = require('express').Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const params = [req.user.id];
    let query = `
      SELECT r.*, c.first_name, c.last_name, c.phone,
             v.brand, v.model, v.plate, v.price_per_day
      FROM reservations r
      JOIN clients  c ON c.id = r.client_id
      JOIN vehicles v ON v.id = r.vehicle_id
      WHERE r.user_id = $1
    `;
    if (status) { query += ' AND r.status = $2'; params.push(status); }
    query += ' ORDER BY r.start_date DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, c.first_name, c.last_name, c.phone, c.email,
              v.brand, v.model, v.plate, v.price_per_day, v.mileage
       FROM reservations r
       JOIN clients c ON c.id = r.client_id
       JOIN vehicles v ON v.id = r.vehicle_id
       WHERE r.id = $1 AND r.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Réservation introuvable' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const { client_id, vehicle_id, start_date, end_date, payment_method, deposit, paid_amount, km_limit, extra_km_price, notes } = req.body;

    const { rows: chk } = await db.query(
      `SELECT (SELECT 1 FROM clients WHERE id = $1 AND user_id = $3) AS c,
              (SELECT 1 FROM vehicles WHERE id = $2 AND user_id = $3) AS v`,
      [client_id, vehicle_id, req.user.id]
    );
    if (!chk[0].c || !chk[0].v) { await db.query('ROLLBACK'); return res.status(404).json({ error: 'Client ou véhicule introuvable' }); }

    const { rows: busy } = await db.query(
      `SELECT id FROM reservations
       WHERE vehicle_id = $1 AND user_id = $4 AND status IN ('active','upcoming')
         AND NOT (end_date <= $2 OR start_date >= $3)`,
      [vehicle_id, start_date, end_date, req.user.id]
    );
    if (busy.length) { await db.query('ROLLBACK'); return res.status(409).json({ error: 'Véhicule non disponible sur cette période' }); }

    const { rows: veh } = await db.query('SELECT price_per_day FROM vehicles WHERE id = $1 AND user_id = $2', [vehicle_id, req.user.id]);
    const days = Math.ceil((new Date(end_date) - new Date(start_date)) / 86400000);
    const total_price = days * veh[0].price_per_day;

    const { rows } = await db.query(
      `INSERT INTO reservations (user_id, client_id, vehicle_id, start_date, end_date, total_price, paid_amount, deposit, payment_method, km_limit, extra_km_price, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.user.id, client_id, vehicle_id, start_date, end_date, total_price, paid_amount ?? 0, deposit ?? 0, payment_method, km_limit ?? 200, extra_km_price ?? 50, notes]
    );
    await db.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { db.release(); }
});

router.patch('/:id', async (req, res) => {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const fields = [];
    const values = [];
    let i = 1;
    const allowed = ['status','paid_amount','deposit','payment_method','notes','km_limit','extra_km_price'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) { fields.push(`${key} = $${i++}`); values.push(req.body[key]); }
    }
    if (!fields.length) { await db.query('ROLLBACK'); return res.status(400).json({ error: 'Aucun champ' }); }
    values.push(req.params.id, req.user.id);
    const { rows } = await db.query(`UPDATE reservations SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i+1} RETURNING *`, values);
    if (!rows.length) { await db.query('ROLLBACK'); return res.status(404).json({ error: 'Introuvable' }); }
    const r = rows[0];
    if (req.body.status === 'active')      await db.query("UPDATE vehicles SET status = 'rented' WHERE id = $1 AND user_id = $2", [r.vehicle_id, req.user.id]);
    else if (req.body.status === 'cancelled') await db.query("UPDATE vehicles SET status = 'available' WHERE id = $1 AND user_id = $2", [r.vehicle_id, req.user.id]);
    await db.query('COMMIT');
    res.json(r);
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { db.release(); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT status FROM reservations WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Introuvable' });
    if (rows[0].status === 'active') return res.status(409).json({ error: 'Impossible d\'annuler une réservation active' });
    await pool.query('DELETE FROM reservations WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Réservation supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
