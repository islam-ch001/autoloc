-- ============================================================
-- AutoLoc - Migration : Ajout de la table CHAUFFEURS (drivers)
-- ============================================================

CREATE TABLE IF NOT EXISTS drivers (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name      VARCHAR(60)  NOT NULL,
  last_name       VARCHAR(60)  NOT NULL,
  phone           VARCHAR(25)  NOT NULL,
  email           VARCHAR(120),
  address         VARCHAR(200),
  birth_date      DATE,
  license         VARCHAR(5)   NOT NULL DEFAULT 'B',
  license_number  VARCHAR(40),
  license_expiry  DATE,
  daily_rate      INTEGER      NOT NULL DEFAULT 0,    -- tarif journalier en DA
  salary          INTEGER      NOT NULL DEFAULT 0,    -- salaire mensuel en DA
  notes           TEXT,
  status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','inactive')),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_user ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);

-- Ajout du champ driver_id aux réservations (optionnel)
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_driver ON reservations(driver_id);
