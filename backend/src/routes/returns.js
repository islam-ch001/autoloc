const router = require('express').Router();
const pool   = require('../db/pool');

// GET /api/returns
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT rt.*,
             c.first_name, c.last_name,
             v.brand, v.model, v.plate
      FROM returns rt
      JOIN reservations r ON r.id = rt.reservation_id
      JOIN clients      c ON c.id = r.client_id
      JOIN vehicles     v ON v.id = r.vehicle_id
      ORDER BY rt.return_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/returns/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT rt.*, c.first_name, c.last_name, v.brand, v.model, v.plate
       FROM returns rt
       JOIN reservations r ON r.id = rt.reservation_id
       JOIN clients      c ON c.id = r.client_id
       JOIN vehicles     v ON v.id = r.vehicle_id
       WHERE rt.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Retour introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/returns
router.post('/', async (req, res) => {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const { reservation_id, return_date, mileage_out, mileage_in, fuel_out, fuel_in, condition, damages, excess_km, km_fees, extra_charges, notes } = req.body;

    // Vérifier que la réservation est active
    const { rows: resRows } = await db.query('SELECT * FROM reservations WHERE id = $1', [reservation_id]);
    if (!resRows.length) { await db.query('ROLLBACK'); return res.status(404).json({ error: 'Réservation introuvable' }); }
    const reservation = resRows[0];
    if (reservation.status !== 'active') { await db.query('ROLLBACK'); return res.status(409).json({ error: 'La réservation n\'est pas active' }); }

    // Calculer le dépassement côté serveur (vérification)
    const kmDriven   = mileage_in - mileage_out;
    const excessKm   = Math.max(0, kmDriven - (reservation.km_limit || 0));
    const kmFees     = excessKm * (reservation.extra_km_price || 0);
    const totalExtra = kmFees + (extra_charges || 0);

    // Insérer le retour
    const { rows } = await db.query(
      `INSERT INTO returns (reservation_id, return_date, mileage_out, mileage_in, fuel_out, fuel_in, condition, damages, excess_km, km_fees, extra_charges, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [reservation_id, return_date, mileage_out, mileage_in, fuel_out, fuel_in, condition ?? 'Bon', damages, excessKm, kmFees, totalExtra, notes]
    );

    // Marquer réservation comme terminée
    await db.query("UPDATE reservations SET status = 'completed' WHERE id = $1", [reservation_id]);

    // Mettre à jour statut véhicule + kilométrage
    const newStatus = condition === 'Dommage majeur' ? 'maintenance' : 'available';
    await db.query(
      'UPDATE vehicles SET status = $1, mileage = $2 WHERE id = $3',
      [newStatus, mileage_in, reservation.vehicle_id]
    );

    // Incrémenter total_rentals du client
    await db.query('UPDATE clients SET total_rentals = total_rentals + 1 WHERE id = $1', [reservation.client_id]);

    await db.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    db.release();
  }
});

module.exports = router;
