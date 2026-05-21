require('dotenv').config();
const express = require('express');
const cors = require('cors');

const vehiclesRouter = require('./routes/vehicles');
const clientsRouter = require('./routes/clients');
const driversRouter = require('./routes/drivers');
const reservationsRouter = require('./routes/reservations');
const returnsRouter = require('./routes/returns');
const dashboardRouter = require('./routes/dashboard');
const invoicesRouter = require('./routes/invoices');
const maintenanceRouter = require('./routes/maintenance');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');

const app = express();

// CORS: web production, dev local, and Electron desktop served from a dynamic local port.
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    if (/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) return cb(null, true);
    cb(new Error(`CORS bloque pour : ${origin}`));
  },
}));
app.use(express.json({ limit: '5mb' }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRouter);

app.use('/api/vehicles', requireAuth, vehiclesRouter);
app.use('/api/clients', requireAuth, clientsRouter);
app.use('/api/drivers', requireAuth, driversRouter);
app.use('/api/reservations', requireAuth, reservationsRouter);
app.use('/api/returns', requireAuth, returnsRouter);
app.use('/api/dashboard', requireAuth, dashboardRouter);
app.use('/api/invoices', requireAuth, invoicesRouter);
app.use('/api/maintenance', requireAuth, maintenanceRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AutoLoc API - http://localhost:${PORT}`));

module.exports = app;
