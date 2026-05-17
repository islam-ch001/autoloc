const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { app } = require('electron');

// La base est stockée dans le dossier userData (persistant par utilisateur Windows)
const dbDir = app ? app.getPath('userData') : path.join(__dirname, '..', '..');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'autoloc.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`[DB] SQLite ouverte : ${dbPath}`);

// ─── Schéma initial ─────────────────────────────────────────
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','user')),
  settings      TEXT NOT NULL DEFAULT '{}',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS vehicles (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand         TEXT NOT NULL,
  model         TEXT NOT NULL,
  year          INTEGER NOT NULL,
  category      TEXT NOT NULL,
  fuel          TEXT NOT NULL,
  transmission  TEXT NOT NULL,
  seats         INTEGER NOT NULL DEFAULT 5,
  price_per_day INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','rented','maintenance')),
  plate         TEXT NOT NULL,
  mileage       INTEGER NOT NULL DEFAULT 0,
  image         TEXT,
  color         TEXT,
  features      TEXT NOT NULL DEFAULT '[]',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, plate)
);

CREATE TABLE IF NOT EXISTS clients (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  address         TEXT,
  license         TEXT NOT NULL DEFAULT 'B',
  license_number  TEXT,
  total_rentals   INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  joined_date     TEXT NOT NULL DEFAULT (date('now')),
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reservations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id       INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  vehicle_id      INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  start_date      TEXT NOT NULL,
  end_date        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','completed','cancelled')),
  total_price     INTEGER NOT NULL DEFAULT 0,
  paid_amount     INTEGER NOT NULL DEFAULT 0,
  deposit         INTEGER NOT NULL DEFAULT 0,
  payment_method  TEXT,
  km_limit        INTEGER NOT NULL DEFAULT 200,
  extra_km_price  INTEGER NOT NULL DEFAULT 50,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (end_date > start_date)
);

CREATE TABLE IF NOT EXISTS returns (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reservation_id  INTEGER NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  return_date     TEXT NOT NULL DEFAULT (date('now')),
  mileage_out     INTEGER NOT NULL,
  mileage_in      INTEGER NOT NULL,
  fuel_out        TEXT NOT NULL DEFAULT 'Plein',
  fuel_in         TEXT NOT NULL DEFAULT 'Plein',
  condition       TEXT NOT NULL DEFAULT 'Bon état',
  damages         TEXT,
  excess_km       INTEGER NOT NULL DEFAULT 0,
  km_fees         INTEGER NOT NULL DEFAULT 0,
  extra_charges   INTEGER NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (mileage_in >= mileage_out)
);

CREATE TABLE IF NOT EXISTS invoices (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reservation_id  INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  invoice_number  TEXT NOT NULL,
  issue_date      TEXT NOT NULL DEFAULT (date('now')),
  total_amount    INTEGER NOT NULL DEFAULT 0,
  paid_amount     INTEGER NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_user        ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_reservation ON invoices(reservation_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_user        ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user         ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user    ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_client  ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle ON reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_returns_user         ON returns(user_id);
`);

// Migration : ajouter la colonne settings sur les DBs existantes (avant cette version)
try {
  const cols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!cols.includes('settings')) {
    db.exec("ALTER TABLE users ADD COLUMN settings TEXT NOT NULL DEFAULT '{}'");
    console.log('[DB] Migration : colonne users.settings ajoutée');
  }
} catch (err) { console.error('[DB] Migration error:', err); }

// Migration : relaxer la contrainte CHECK sur returns.condition (nouveaux libellés)
try {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='returns'").get();
  if (row && row.sql && row.sql.includes("'Dommage")) {
    console.log('[DB] Migration : relax returns.condition + migrate libellés');
    db.exec(`
      PRAGMA foreign_keys = OFF;
      ALTER TABLE returns RENAME TO returns_old_v1;
      CREATE TABLE returns (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reservation_id  INTEGER NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
        return_date     TEXT NOT NULL DEFAULT (date('now')),
        mileage_out     INTEGER NOT NULL,
        mileage_in      INTEGER NOT NULL,
        fuel_out        TEXT NOT NULL DEFAULT 'Plein',
        fuel_in         TEXT NOT NULL DEFAULT 'Plein',
        condition       TEXT NOT NULL DEFAULT 'Bon état',
        damages         TEXT,
        excess_km       INTEGER NOT NULL DEFAULT 0,
        km_fees         INTEGER NOT NULL DEFAULT 0,
        extra_charges   INTEGER NOT NULL DEFAULT 0,
        notes           TEXT,
        created_at      TEXT NOT NULL DEFAULT (datetime('now')),
        CHECK (mileage_in >= mileage_out)
      );
      INSERT INTO returns SELECT * FROM returns_old_v1;
      UPDATE returns SET condition = 'Bon état'  WHERE condition = 'Bon';
      UPDATE returns SET condition = 'Sale'      WHERE condition = 'Dommage mineur';
      UPDATE returns SET condition = 'Endommagé' WHERE condition = 'Dommage majeur';
      DROP TABLE returns_old_v1;
      CREATE INDEX IF NOT EXISTS idx_returns_user ON returns(user_id);
      PRAGMA foreign_keys = ON;
    `);
  }
} catch (err) { console.error('[DB] Migration condition error:', err); }

// ─── Wrappers compatibles pg-style ───────────────────────────
// PostgreSQL: $1, $2, $3 peuvent apparaitre dans n'importe quel ordre, et plusieurs fois.
// SQLite: ? sont positionnels — il faut REORDONNER les params selon l'ordre des $N.
function convertPlaceholders(sql, params = []) {
  const order = [];
  const cleanSql = sql.replace(/\$(\d+)/g, (_, n) => {
    order.push(parseInt(n, 10) - 1);
    return '?';
  });
  const orderedParams = order.map(i => params[i]);
  return { sql: cleanSql, params: orderedParams };
}

function query(sql, params = []) {
  const { sql: cleanSql, params: cleanParams } = convertPlaceholders(sql, params);
  const trimmed = cleanSql.trim().toUpperCase();
  try {
    if (trimmed.startsWith('SELECT') || /\bRETURNING\b/.test(trimmed)) {
      const stmt = db.prepare(cleanSql);
      const rows = stmt.all(...cleanParams);
      return Promise.resolve({ rows, rowCount: rows.length });
    } else {
      const stmt = db.prepare(cleanSql);
      const info = stmt.run(...cleanParams);
      return Promise.resolve({ rows: [], rowCount: info.changes });
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

// Émule pool.connect() pour les transactions
function connect() {
  let inTransaction = false;
  return Promise.resolve({
    query: async (sql, params) => {
      const upper = (sql || '').trim().toUpperCase();
      if (upper === 'BEGIN') { db.exec('BEGIN'); inTransaction = true; return { rows: [] }; }
      if (upper === 'COMMIT') { db.exec('COMMIT'); inTransaction = false; return { rows: [] }; }
      if (upper === 'ROLLBACK') {
        if (inTransaction) { try { db.exec('ROLLBACK'); } catch {} inTransaction = false; }
        return { rows: [] };
      }
      return query(sql, params);
    },
    release: () => { if (inTransaction) { try { db.exec('ROLLBACK'); } catch {} } },
  });
}

module.exports = { query, connect, db, dbPath };
