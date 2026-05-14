const router = require('express').Router();
const pool   = require('../db/pool');

// GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM vehicles';
    const params = [];
    if (status) { query += ' WHERE status = $1'; params.push(status); }
    query += ' ORDER BY id';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Véhicule introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles
router.post('/', async (req, res) => {
  try {
    const { brand, model, year, category, fuel, transmission, seats, price_per_day, plate, mileage, image, color, features } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO vehicles (brand, model, year, category, fuel, transmission, seats, price_per_day, plate, mileage, image, color, features)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [brand, model, year, category, fuel, transmission, seats ?? 5, price_per_day, plate, mileage ?? 0, image, color, features ?? []]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/vehicles/:id
router.patch('/:id', async (req, res) => {
  try {
    const fields = [];
    const values = [];
    let i = 1;
    const allowed = ['brand','model','year','category','fuel','transmission','seats','price_per_day','status','plate','mileage','image','color','features'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        values.push(req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Véhicule introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows: active } = await pool.query(
      "SELECT id FROM reservations WHERE vehicle_id = $1 AND status = 'active'",
      [req.params.id]
    );
    if (active.length) return res.status(409).json({ error: 'Impossible : véhicule actuellement en location' });
    const { rows } = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Véhicule introuvable' });
    res.json({ message: 'Véhicule supprimé', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
