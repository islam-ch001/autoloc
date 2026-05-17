const router = require('express').Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT i.*,
             r.start_date, r.end_date, r.total_price, r.paid_amount AS res_paid,
             c.first_name, c.last_name, c.phone,
             v.brand, v.model, v.plate
      FROM invoices i
      JOIN reservations r ON r.id = i.reservation_id
      JOIN clients      c ON c.id = r.client_id
      JOIN vehicles     v ON v.id = r.vehicle_id
      WHERE i.user_id = $1
      ORDER BY i.issue_date DESC, i.id DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { reservation_id, notes } = req.body;

    const { rows: resRows } = await pool.query(
      'SELECT id, total_price, paid_amount FROM reservations WHERE id = $1 AND user_id = $2',
      [reservation_id, req.user.id]
    );
    if (!resRows.length) return res.status(404).json({ error: 'Réservation introuvable' });
    const r = resRows[0];

    const { rows: existing } = await pool.query(
      'SELECT id, invoice_number FROM invoices WHERE reservation_id = $1 AND user_id = $2',
      [reservation_id, req.user.id]
    );
    if (existing.length) return res.status(409).json({ error: `Facture déjà enregistrée : ${existing[0].invoice_number}` });

    const { rows: countRows } = await pool.query('SELECT COUNT(*) AS n FROM invoices WHERE user_id = $1', [req.user.id]);
    const next = parseInt(countRows[0].n) + 1;
    const invoice_number = `FAC-${String(next).padStart(5, '0')}`;

    const { rows } = await pool.query(
      `INSERT INTO invoices (user_id, reservation_id, invoice_number, total_amount, paid_amount, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, reservation_id, invoice_number, r.total_price, r.paid_amount, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM invoices WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Facture introuvable' });
    res.json({ message: 'Facture supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
