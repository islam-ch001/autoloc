const router = require('express').Router();
const pool   = require('../db/pool');

// GET /api/drivers  — liste des chauffeurs de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const params = [req.user.id];
    const conds  = ['user_id = $1'];
    if (status) { conds.push(`status = $${params.length + 1}`); params.push(status); }
    if (search) {
      conds.push(`(first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1} OR phone ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    const query = 'SELECT * FROM drivers WHERE ' + conds.join(' AND ') + ' ORDER BY last_name, first_name';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM drivers WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Chauffeur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drivers
router.post('/', async (req, res) => {
  try {
    const {
      first_name, last_name, phone, email, address, birth_date,
      license, license_number, license_expiry,
      daily_rate, salary, notes,
    } = req.body;
    if (!first_name || !last_name || !phone) {
      return res.status(400).json({ error: 'Nom, prénom et téléphone sont requis' });
    }
    const { rows } = await pool.query(
      `INSERT INTO drivers (
        user_id, first_name, last_name, phone, email, address, birth_date,
        license, license_number, license_expiry, daily_rate, salary, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        req.user.id, first_name, last_name, phone, email || null, address || null, birth_date || null,
        license ?? 'B', license_number || null, license_expiry || null,
        daily_rate || 0, salary || 0, notes || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/drivers/:id
router.patch('/:id', async (req, res) => {
  try {
    const fields = [];
    const values = [];
    let i = 1;
    const allowed = [
      'first_name','last_name','phone','email','address','birth_date',
      'license','license_number','license_expiry',
      'daily_rate','salary','notes','status',
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        values.push(req.body[key] === '' ? null : req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    values.push(req.params.id, req.user.id);
    const { rows } = await pool.query(
      `UPDATE drivers SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i+1} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Chauffeur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/drivers/:id
router.delete('/:id', async (req, res) => {
  try {
    // Empêcher la suppression si le chauffeur est assigné à une réservation en cours
    const { rows: active } = await pool.query(
      "SELECT id FROM reservations WHERE driver_id = $1 AND user_id = $2 AND status IN ('active','upcoming')",
      [req.params.id, req.user.id]
    );
    if (active.length) return res.status(409).json({ error: 'Impossible : chauffeur assigné à des réservations en cours' });

    const { rows } = await pool.query('DELETE FROM drivers WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Chauffeur introuvable' });
    res.json({ message: 'Chauffeur supprimé', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
