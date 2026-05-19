const router = require('express').Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT rt.*, c.first_name, c.last_name, v.brand, v.model, v.plate
      FROM returns rt
      JOIN reservations r ON r.id = rt.reservation_id
      JOIN clients c ON c.id = r.client_id
      JOIN vehicles v ON v.id = r.vehicle_id
      WHERE rt.user_id = $1
      ORDER BY rt.return_date DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const { reservation_id, return_date, mileage_out, mileage_in, fuel_out, fuel_in, condition, damages, extra_charges, extra_paid, notes } = req.body;

    const { rows: resRows } = await db.query('SELECT * FROM reservations WHERE id = $1 AND user_id = $2', [reservation_id, req.user.id]);
    if (!resRows.length) { await db.query('ROLLBACK'); return res.status(404).json({ error: 'Réservation introuvable' }); }
    const reservation = resRows[0];
    if (reservation.status !== 'active') { await db.query('ROLLBACK'); return res.status(409).json({ error: 'La réservation n\'est pas active' }); }

    const kmDriven   = mileage_in - mileage_out;
    const excessKm   = Math.max(0, kmDriven - (reservation.km_limit || 0));
    const kmFees     = excessKm * (reservation.extra_km_price || 0);
    const totalExtra = kmFees + (extra_charges || 0);

    const paidExtra = +extra_paid || 0;
    const { rows } = await db.query(
      `INSERT INTO returns (user_id, reservation_id, return_date, mileage_out, mileage_in, fuel_out, fuel_in, condition, damages, excess_km, km_fees, extra_charges, extra_paid, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [req.user.id, reservation_id, return_date, mileage_out, mileage_in, fuel_out, fuel_in, condition ?? 'Bon état', damages, excessKm, kmFees, totalExtra, paidExtra, notes]
    );
    await db.query(
      "UPDATE reservations SET status = 'completed', paid_amount = paid_amount + $1 WHERE id = $2 AND user_id = $3",
      [paidExtra, reservation_id, req.user.id]
    );
    const newStatus = condition === 'Endommagé' ? 'maintenance' : 'available';
    await db.query('UPDATE vehicles SET status = $1, mileage = $2 WHERE id = $3 AND user_id = $4', [newStatus, mileage_in, reservation.vehicle_id, req.user.id]);
    await db.query('UPDATE clients SET total_rentals = total_rentals + 1 WHERE id = $1 AND user_id = $2', [reservation.client_id, req.user.id]);

    await db.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { db.release(); }
});

module.exports = router;
