const router = require('express').Router();
const pool = require('../db/pool');

// Helper : (de)sérialiser la colonne features (JSON string ↔ array)
const parseRow = (r) => r ? { ...r, features: r.features ? JSON.parse(r.features) : [] } : r;
const parseRows = (rows) => rows.map(parseRow);
const serializeFeatures = (f) => JSON.stringify(Array.isArray(f) ? f : []);

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const params = [req.user.id];
    let query = 'SELECT * FROM vehicles WHERE user_id = $1';
    if (status) { query += ' AND status = $2'; params.push(status); }
    query += ' ORDER BY id';
    const { rows } = await pool.query(query, params);
    res.json(parseRows(rows));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM vehicles WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Véhicule introuvable' });
    res.json(parseRow(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { brand, model, year, category, fuel, transmission, seats, price_per_day, plate, mileage, image, color, features } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO vehicles (user_id, brand, model, year, category, fuel, transmission, seats, price_per_day, plate, mileage, image, color, features)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [req.user.id, brand, model, year, category, fuel, transmission, seats ?? 5, price_per_day, plate, mileage ?? 0, image, color, serializeFeatures(features)]
    );
    res.status(201).json(parseRow(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    const fields = [];
    const values = [];
    let i = 1;
    const allowed = ['brand','model','year','category','fuel','transmission','seats','price_per_day','status','plate','mileage','image','color','features'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        values.push(key === 'features' ? serializeFeatures(req.body[key]) : req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    values.push(req.params.id, req.user.id);
    const { rows } = await pool.query(
      `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i+1} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Véhicule introuvable' });
    res.json(parseRow(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const { rows: active } = await db.query(
      "SELECT id FROM reservations WHERE vehicle_id = $1 AND user_id = $2 AND status = 'active'",
      [req.params.id, req.user.id]
    );
    if (active.length) { await db.query('ROLLBACK'); return res.status(409).json({ error: 'Impossible : véhicule actuellement en location' }); }
    await db.query('DELETE FROM returns WHERE user_id = $1 AND reservation_id IN (SELECT id FROM reservations WHERE vehicle_id = $2 AND user_id = $1)', [req.user.id, req.params.id]);
    await db.query('DELETE FROM reservations WHERE vehicle_id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    const { rows } = await db.query('DELETE FROM vehicles WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (!rows.length) { await db.query('ROLLBACK'); return res.status(404).json({ error: 'Véhicule introuvable' }); }
    await db.query('COMMIT');
    res.json({ message: 'Véhicule supprimé', id: rows[0].id });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { db.release(); }
});

module.exports = router;
