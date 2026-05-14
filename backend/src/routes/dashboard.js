const router = require('express').Router();
const pool   = require('../db/pool');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [vehicles, reservations, revenue, unpaid, clients, monthlyRev] = await Promise.all([
      // État flotte
      pool.query(`
        SELECT
          COUNT(*)                                          AS total,
          COUNT(*) FILTER (WHERE status = 'available')     AS available,
          COUNT(*) FILTER (WHERE status = 'rented')        AS rented,
          COUNT(*) FILTER (WHERE status = 'maintenance')   AS maintenance
        FROM vehicles
      `),
      // Réservations par statut
      pool.query(`
        SELECT
          COUNT(*)                                          AS total,
          COUNT(*) FILTER (WHERE status = 'active')        AS active,
          COUNT(*) FILTER (WHERE status = 'upcoming')      AS upcoming,
          COUNT(*) FILTER (WHERE status = 'completed')     AS completed
        FROM reservations
      `),
      // Revenu total encaissé
      pool.query(`
        SELECT COALESCE(SUM(paid_amount), 0) AS total_revenue
        FROM reservations
        WHERE status != 'cancelled'
      `),
      // Montant impayé (réservations actives)
      pool.query(`
        SELECT COALESCE(SUM(total_price - paid_amount), 0) AS unpaid
        FROM reservations
        WHERE status = 'active'
      `),
      // Clients actifs
      pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'active') AS active FROM clients`),
      // Revenus par mois (6 derniers mois)
      pool.query(`
        SELECT
          TO_CHAR(start_date, 'Mon') AS month,
          TO_CHAR(start_date, 'YYYY-MM') AS month_key,
          COALESCE(SUM(paid_amount), 0)  AS revenue,
          COUNT(*) AS rentals
        FROM reservations
        WHERE start_date >= NOW() - INTERVAL '6 months'
          AND status != 'cancelled'
        GROUP BY month, month_key
        ORDER BY month_key
      `),
    ]);

    res.json({
      fleet:       vehicles.rows[0],
      reservations: reservations.rows[0],
      revenue:     parseInt(revenue.rows[0].total_revenue),
      unpaid:      parseInt(unpaid.rows[0].unpaid),
      clients:     clients.rows[0],
      monthlyRevenue: monthlyRev.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/recent-reservations
router.get('/recent-reservations', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.id, r.start_date, r.end_date, r.status, r.total_price, r.paid_amount,
             c.first_name, c.last_name,
             v.brand, v.model
      FROM reservations r
      JOIN clients  c ON c.id = r.client_id
      JOIN vehicles v ON v.id = r.vehicle_id
      ORDER BY r.created_at DESC
      LIMIT 8
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
