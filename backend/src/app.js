require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const vehiclesRouter     = require('./routes/vehicles');
const clientsRouter      = require('./routes/clients');
const reservationsRouter = require('./routes/reservations');
const returnsRouter      = require('./routes/returns');
const dashboardRouter    = require('./routes/dashboard');
const invoicesRouter     = require('./routes/invoices');
const authRouter         = require('./routes/auth');
const { requireAuth }    = require('./middleware/auth');

const app = express();

// Middleware — accepte localhost en dev et le vrai domaine Vercel en prod
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,   // ex: https://autoloc.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Autoriser les requêtes sans origin (Postman, curl) et les origines connues
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqué pour : ${origin}`));
  },
}));
app.use(express.json());

// Logger simple
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Auth (publique)
app.use('/api/auth', authRouter);

// Routes protégées (requièrent JWT)
app.use('/api/vehicles',     requireAuth, vehiclesRouter);
app.use('/api/clients',      requireAuth, clientsRouter);
app.use('/api/reservations', requireAuth, reservationsRouter);
app.use('/api/returns',      requireAuth, returnsRouter);
app.use('/api/dashboard',    requireAuth, dashboardRouter);
app.use('/api/invoices',     requireAuth, invoicesRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }));

// Erreur globale
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 AutoLoc API — http://localhost:${PORT}`));

module.exports = app;
