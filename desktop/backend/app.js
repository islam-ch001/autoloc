const express = require('express');
const path = require('path');
const { requireAuth } = require('./middleware/auth');

const authRouter         = require('./routes/auth');
const vehiclesRouter     = require('./routes/vehicles');
const clientsRouter      = require('./routes/clients');
const reservationsRouter = require('./routes/reservations');
const returnsRouter      = require('./routes/returns');
const dashboardRouter    = require('./routes/dashboard');
const invoicesRouter     = require('./routes/invoices');

function createApp() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Health
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', mode: 'offline' }));

  // API
  app.use('/api/auth', authRouter);
  app.use('/api/vehicles',     requireAuth, vehiclesRouter);
  app.use('/api/clients',      requireAuth, clientsRouter);
  app.use('/api/reservations', requireAuth, reservationsRouter);
  app.use('/api/returns',      requireAuth, returnsRouter);
  app.use('/api/dashboard',    requireAuth, dashboardRouter);
  app.use('/api/invoices',     requireAuth, invoicesRouter);

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

function startServer() {
  return new Promise((resolve, reject) => {
    try {
      const app = createApp();
      // Port 0 = port libre attribué par le système
      const server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        resolve({ port, server });
      });
      server.on('error', reject);
    } catch (err) { reject(err); }
  });
}

module.exports = { createApp, startServer };
