const express = require('express');
const path = require('path');
const { requireAuth } = require('./middleware/auth');

const authRouter         = require('./routes/auth');
const vehiclesRouter     = require('./routes/vehicles');
const clientsRouter      = require('./routes/clients');
const driversRouter      = require('./routes/drivers');
const reservationsRouter = require('./routes/reservations');
const returnsRouter      = require('./routes/returns');
const dashboardRouter    = require('./routes/dashboard');
const invoicesRouter     = require('./routes/invoices');
const maintenanceRouter  = require('./routes/maintenance');
const adminRouter        = require('./routes/admin');
const licenseRouter      = require('./routes/license');

function createApp() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Health
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', mode: 'offline' }));

  // License (NON protégée par requireAuth — c'est l'écran d'activation)
  app.use('/api/license', licenseRouter);

  // BOOTSTRAP : recupere toutes les donnees de base en UNE seule requete (perf)
  const pool = require('./db/pool');
  app.get('/api/bootstrap', requireAuth, async (req, res) => {
    try {
      const uid = req.user.id;
      const [vehicles, clients, drivers, reservations, returns, maintenance] = await Promise.all([
        pool.query('SELECT * FROM vehicles WHERE user_id = $1 ORDER BY brand, model', [uid]).then(r => r.rows),
        pool.query('SELECT * FROM clients WHERE user_id = $1 ORDER BY last_name, first_name', [uid]).then(r => r.rows),
        pool.query('SELECT * FROM drivers WHERE user_id = $1 ORDER BY last_name, first_name', [uid]).then(r => r.rows),
        pool.query(`SELECT r.*, c.first_name, c.last_name, c.phone, v.brand, v.model, v.plate, v.price_per_day,
                           d.first_name AS driver_first_name, d.last_name AS driver_last_name, d.phone AS driver_phone, d.daily_rate AS driver_daily_rate
                    FROM reservations r
                    JOIN clients c ON c.id = r.client_id
                    JOIN vehicles v ON v.id = r.vehicle_id
                    LEFT JOIN drivers d ON d.id = r.driver_id
                    WHERE r.user_id = $1 ORDER BY r.start_date DESC`, [uid]).then(r => r.rows),
        pool.query(`SELECT ret.*, r.start_date, r.end_date,
                           c.first_name AS client_first_name, c.last_name AS client_last_name,
                           v.brand, v.model, v.plate
                    FROM returns ret
                    JOIN reservations r ON r.id = ret.reservation_id
                    JOIN clients c ON c.id = r.client_id
                    JOIN vehicles v ON v.id = r.vehicle_id
                    WHERE ret.user_id = $1 ORDER BY ret.return_date DESC`, [uid]).then(r => r.rows),
        pool.query(`SELECT m.*, v.brand, v.model, v.plate
                    FROM maintenance m
                    JOIN vehicles v ON v.id = m.vehicle_id
                    WHERE m.user_id = $1 ORDER BY m.date DESC`, [uid]).then(r => r.rows),
      ]);
      res.json({ vehicles, clients, drivers, reservations, returns, maintenance });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // API
  app.use('/api/auth', authRouter);
  app.use('/api/vehicles',     requireAuth, vehiclesRouter);
  app.use('/api/clients',      requireAuth, clientsRouter);
  app.use('/api/drivers',      requireAuth, driversRouter);
  app.use('/api/reservations', requireAuth, reservationsRouter);
  app.use('/api/returns',      requireAuth, returnsRouter);
  app.use('/api/dashboard',    requireAuth, dashboardRouter);
  app.use('/api/invoices',     requireAuth, invoicesRouter);
  app.use('/api/maintenance',  requireAuth, maintenanceRouter);
  app.use('/api/admin',        adminRouter);

  // Frontend statique (build Vite copié dans ./frontend par electron-builder)
  const frontendPath = path.join(__dirname, '..', 'frontend');
  app.use(express.static(frontendPath));
  // SPA fallback : toute autre route → index.html
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(frontendPath, 'index.html')));

  // 404 API
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Route introuvable' }));

  // Erreur globale
  app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Erreur interne' });
  });

  return app;
}

// Port FIXE : essentiel pour persister localStorage (et donc le JWT) entre les lancements.
// Sans cela, chaque lancement repart de zéro (origine HTTP différente).
const FIXED_PORT = 51847;

function startServer() {
  return new Promise((resolve, reject) => {
    try {
      const app = createApp();
      const tryPort = (port, isLast = false) => {
        const server = app.listen(port, '127.0.0.1', () => {
          resolve({ port: server.address().port, server });
        });
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE' && !isLast) {
            // Port pris (autre instance ?) → fallback sur port aléatoire
            console.warn(`[Express] Port ${port} occupé, fallback sur port aléatoire`);
            tryPort(0, true);
          } else {
            reject(err);
          }
        });
      };
      tryPort(FIXED_PORT);
    } catch (err) { reject(err); }
  });
}

module.exports = { createApp, startServer };
