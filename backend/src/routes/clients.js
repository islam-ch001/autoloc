const router = require('express').Router();
const pool   = require('../db/pool');

// GET /api/clients
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM clients';
    const params = [];
    const conds  = [];
    if (status) { conds.push(`status = $${params.length + 1}`); params.push(status); }
    if (search) {
      conds.push(`(first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1} OR phone ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    if (conds.length) query += ' WHERE ' + conds.join(' AND ');
    query += ' ORDER BY last_name, first_name';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Client introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, phone, email, address, license, license_number } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO clients (first_name, last_name, phone, email, address, license, license_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [first_name, last_name, phone, email, address, license ?? 'B', license_number]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/clients/:id
router.patch('/:id', async (req, res) => {
  try {
    const fields = [];
    const values = [];
    let i = 1;
    const allowed = ['first_name','last_name','phone','email','address','license','license_number','status'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        values.push(req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE clients SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Client introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows: active } = await pool.query(
      "SELECT id FROM reservations WHERE client_id = $1 AND status IN ('active','upcoming')",
      [req.params.id]
    );
    if (active.length) return res.status(409).json({ error: 'Impossible : client a des réservations en cours' });
    const { rows } = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Client introuvable' });
    res.json({ message: 'Client supprimé', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
