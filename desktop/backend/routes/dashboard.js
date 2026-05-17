const router = require('express').Router();
const pool = require('../db/pool');

// SQLite ne supporte pas FILTER (WHERE ...) → on utilise SUM(CASE WHEN ... THEN 1 ELSE 0 END)
// SQLite ne supporte pas TO_CHAR ni INTERVAL → strftime + julianday

router.get('/stats', async (req, res) => {
  try {
    const uid = req.user.id;

    const fleet = (await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status='available'   THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status='rented'      THEN 1 ELSE 0 END) AS rented,
        SUM(CASE WHEN status='maintenance' THEN 1 ELSE 0 END) AS maintenance
      FROM vehicles WHERE user_id = $1
    `, [uid])).rows[0];

    const reservations = (await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status='active'    THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status='upcoming'  THEN 1 ELSE 0 END) AS upcoming,
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed
      FROM reservations WHERE user_id = $1
    `, [uid])).rows[0];

    const revenue = (await pool.query(`SELECT COALESCE(SUM(paid_amount), 0) AS total_revenue FROM reservations WHERE user_id = $1 AND status != 'cancelled'`, [uid])).rows[0];
    const unpaid  = (await pool.query(`SELECT COALESCE(SUM(total_price - paid_amount), 0) AS unpaid FROM reservations WHERE user_id = $1 AND status = 'active'`, [uid])).rows[0];
    const clients = (await pool.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active FROM clients WHERE user_id = $1`, [uid])).rows[0];

    const monthlyRev = (await pool.query(`
      SELECT
        strftime('%Y-%m', start_date) AS month_key,
        strftime('%m', start_date)    AS month,
        COALESCE(SUM(paid_amount), 0) AS revenue,
        COUNT(*) AS rentals
      FROM reservations
      WHERE user_id = $1
        AND start_date >= date('now','-6 months')
        AND status != 'cancelled'
      GROUP BY month_key
      ORDER BY month_key
    `, [uid])).rows;

    res.json({
      fleet,
      reservations,
      revenue: parseInt(revenue.total_revenue) || 0,
      unpaid:  parseInt(unpaid.unpaid) || 0,
      clients,
      monthlyRevenue: monthlyRev,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/recent-reservations', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.id, r.start_date, r.end_date, r.status, r.total_price, r.paid_amount,
             c.first_name, c.last_name, v.brand, v.model
      FROM reservations r
      JOIN clients c ON c.id = r.client_id
      JOIN vehicles v ON v.id = r.vehicle_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 8
    `, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
