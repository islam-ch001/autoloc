const router = require('express').Router();
const pool   = require('../db/pool');

// GET /api/reservations  (+ jointure client & vehicle)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT r.*,
             c.first_name, c.last_name, c.phone,
             v.brand, v.model, v.plate, v.price_per_day
      FROM reservations r
      JOIN clients  c ON c.id = r.client_id
      JOIN vehicles v ON v.id = r.vehicle_id
    `;
    const params = [];
    if (status) { query += ' WHERE r.status = $1'; params.push(status); }
    query += ' ORDER BY r.start_date DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reservations/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*,
              c.first_name, c.last_name, c.phone, c.email,
              v.brand, v.model, v.plate, v.price_per_day, v.mileage
       FROM reservations r
       JOIN clients  c ON c.id = r.client_id
       JOIN vehicles v ON v.id = r.vehicle_id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Réservation introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reservations
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { client_id, vehicle_id, start_date, end_date, payment_method, deposit, paid_amount, km_limit, extra_km_price, notes } = req.body;

    // Vérifier disponibilité
    const { rows: busy } = await client.query(
      `SELECT id FROM reservations
       WHERE vehicle_id = $1 AND status IN ('active','upcoming')
         AND NOT (end_date <= $2 OR start_date >= $3)`,
      [vehicle_id, start_date, end_date]
    );
    if (busy.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Véhicule non disponible sur cette période' });
    }

    // Calcul prix
    const { rows: veh } = await client.query('SELECT price_per_day FROM vehicles WHERE id = $1', [vehicle_id]);
    if (!veh.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Véhicule introuvable' }); }
    const days = Math.ceil((new Date(end_date) - new Date(start_date)) / 86400000);
    const total_price = days * veh[0].price_per_day;

    const { rows } = await client.query(
      `INSERT INTO reservations (client_id, vehicle_id, start_date, end_date, total_price, paid_amount, deposit, payment_method, km_limit, extra_km_price, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [client_id, vehicle_id, start_date, end_date, total_price, paid_amount ?? 0, deposit ?? 0, payment_method, km_limit ?? 200, extra_km_price ?? 50, notes]
    );

    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/reservations/:id  (mise à jour statut, paiement…)
router.patch('/:id', async (req, res) => {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const fields = [];
    const values = [];
    let i = 1;
    const allowed = ['status','paid_amount','deposit','payment_method','notes','km_limit','extra_km_price'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        values.push(req.body[key]);
      }
    }
    if (!fields.length) { await db.query('ROLLBACK'); return res.status(400).json({ error: 'Aucun champ' }); }
    values.push(req.params.id);

    const { rows } = await db.query(
      `UPDATE reservations SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!rows.length) { await db.query('ROLLBACK'); return res.status(404).json({ error: 'Introuvable' }); }

    const r = rows[0];

    // Sync statut véhicule
    if (req.body.status === 'active') {
      await db.query("UPDATE vehicles SET status = 'rented' WHERE id = $1", [r.vehicle_id]);
    } else if (req.body.status === 'cancelled') {
      await db.query("UPDATE vehicles SET status = 'available' WHERE id = $1", [r.vehicle_id]);
    }

    await db.query('COMMIT');
    res.json(r);
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    db.release();
  }
});

// DELETE /api/reservations/:id  (annulation seulement si upcoming)
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT status FROM reservations WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Introuvable' });
    if (rows[0].status === 'active') return res.status(409).json({ error: 'Impossible d\'annuler une réservation active' });
    await pool.query('DELETE FROM reservations WHERE id = $1', [req.params.id]);
    res.json({ message: 'Réservation supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
