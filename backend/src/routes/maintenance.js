const router = require('express').Router();
const pool = require('../db/pool');

// GET /api/maintenance — toutes les interventions (avec infos véhicule)
router.get('/', async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const params = [req.user.id];
    let sql = `
      SELECT m.*, v.brand, v.model, v.plate
      FROM maintenance m
      JOIN vehicles v ON v.id = m.vehicle_id
      WHERE m.user_id = $1
    `;
    if (vehicleId) { sql += ' AND m.vehicle_id = $2'; params.push(vehicleId); }
    sql += ' ORDER BY m.date DESC, m.id DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/maintenance
router.post('/', async (req, res) => {
  try {
    const { vehicle_id, date, type, description, cost, mileage, next_mileage, next_date, notes, set_in_maintenance } = req.body;
    if (!vehicle_id || !type) return res.status(400).json({ error: 'Véhicule et type requis' });

    // Vérifier ownership
    const { rows: own } = await pool.query('SELECT id FROM vehicles WHERE id = $1 AND user_id = $2', [vehicle_id, req.user.id]);
    if (!own.length) return res.status(404).json({ error: 'Véhicule introuvable' });

    const { rows } = await pool.query(
      `INSERT INTO maintenance (user_id, vehicle_id, date, type, description, cost, mileage, next_mileage, next_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.user.id, vehicle_id, date || new Date().toISOString().slice(0,10), type, description, cost ?? 0, mileage, next_mileage, next_date, notes]
    );

    // Optionnel : marquer le véhicule en maintenance
    if (set_in_maintenance) {
      await pool.query("UPDATE vehicles SET status = 'maintenance' WHERE id = $1 AND user_id = $2 AND status != 'rented'", [vehicle_id, req.user.id]);
    }

    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/maintenance/:id
router.patch('/:id', async (req, res) => {
  try {
    const fields = [];
    const values = [];
    let i = 1;
    const allowed = ['date','type','description','cost','mileage','next_mileage','next_date','notes'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) { fields.push(`${key} = $${i++}`); values.push(req.body[key]); }
    }
    if (!fields.length) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    values.push(req.params.id, req.user.id);
    const { rows } = await pool.query(
      `UPDATE maintenance SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i+1} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Intervention introuvable' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/maintenance/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM maintenance WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Intervention introuvable' });
    res.json({ message: 'Intervention supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
