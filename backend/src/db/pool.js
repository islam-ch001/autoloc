const { Pool } = require('pg');
require('dotenv').config();

// En production (Render) → DATABASE_URL (Supabase)
// En local             → variables séparées du .env
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // requis pour Supabase
    })
  : new Pool({
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

pool.on('connect', () => console.log('✅ PostgreSQL connecté'));
pool.on('error',  (err) => console.error('❌ Erreur PostgreSQL :', err.message));

module.exports = pool;
