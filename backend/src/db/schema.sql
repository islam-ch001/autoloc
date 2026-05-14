-- ============================================================
-- AutoLoc — Schéma PostgreSQL
-- Exécuter : psql -U postgres -d autoloc -f schema.sql
-- ============================================================

-- Créer la base si elle n'existe pas (à exécuter en dehors)
-- CREATE DATABASE autoloc;

-- Nettoyage (ordre inverse des dépendances)
DROP TABLE IF EXISTS returns       CASCADE;
DROP TABLE IF EXISTS reservations  CASCADE;
DROP TABLE IF EXISTS clients       CASCADE;
DROP TABLE IF EXISTS vehicles      CASCADE;

-- ============================================================
-- VÉHICULES
-- ============================================================
CREATE TABLE vehicles (
  id            SERIAL PRIMARY KEY,
  brand         VARCHAR(60)  NOT NULL,
  model         VARCHAR(60)  NOT NULL,
  year          SMALLINT     NOT NULL,
  category      VARCHAR(40)  NOT NULL,
  fuel          VARCHAR(30)  NOT NULL,
  transmission  VARCHAR(30)  NOT NULL,
  seats         SMALLINT     NOT NULL DEFAULT 5,
  price_per_day INTEGER      NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'available'
                             CHECK (status IN ('available','rented','maintenance')),
  plate         VARCHAR(30)  NOT NULL UNIQUE,
  mileage       INTEGER      NOT NULL DEFAULT 0,
  image         TEXT,
  color         VARCHAR(20),
  features      TEXT[]       DEFAULT '{}',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE clients (
  id              SERIAL PRIMARY KEY,
  first_name      VARCHAR(60)  NOT NULL,
  last_name       VARCHAR(60)  NOT NULL,
  phone           VARCHAR(25)  NOT NULL,
  email           VARCHAR(120),
  address         VARCHAR(200),
  license         VARCHAR(5)   NOT NULL DEFAULT 'B',
  license_number  VARCHAR(40),
  total_rentals   INTEGER      NOT NULL DEFAULT 0,
  status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','inactive')),
  joined_date     DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RÉSERVATIONS
-- ============================================================
CREATE TABLE reservations (
  id              SERIAL PRIMARY KEY,
  client_id       INTEGER      NOT NULL REFERENCES clients(id)  ON DELETE RESTRICT,
  vehicle_id      INTEGER      NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  start_date      DATE         NOT NULL,
  end_date        DATE         NOT NULL,
  status          VARCHAR(20)  NOT NULL DEFAULT 'upcoming'
                               CHECK (status IN ('upcoming','active','completed','cancelled')),
  total_price     INTEGER      NOT NULL DEFAULT 0,
  paid_amount     INTEGER      NOT NULL DEFAULT 0,
  deposit         INTEGER      NOT NULL DEFAULT 0,
  payment_method  VARCHAR(30),
  km_limit        INTEGER      NOT NULL DEFAULT 200,
  extra_km_price  INTEGER      NOT NULL DEFAULT 50,
  notes           TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_date > start_date)
);

-- ============================================================
-- RETOURS
-- ============================================================
CREATE TABLE returns (
  id              SERIAL PRIMARY KEY,
  reservation_id  INTEGER      NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  return_date     DATE         NOT NULL DEFAULT CURRENT_DATE,
  mileage_out     INTEGER      NOT NULL,
  mileage_in      INTEGER      NOT NULL,
  fuel_out        VARCHAR(10)  NOT NULL DEFAULT 'Plein',
  fuel_in         VARCHAR(10)  NOT NULL DEFAULT 'Plein',
  condition       VARCHAR(30)  NOT NULL DEFAULT 'Bon'
                               CHECK (condition IN ('Bon','Dommage mineur','Dommage majeur')),
  damages         TEXT,
  excess_km       INTEGER      NOT NULL DEFAULT 0,
  km_fees         INTEGER      NOT NULL DEFAULT 0,
  extra_charges   INTEGER      NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT mileage_in_gte_out CHECK (mileage_in >= mileage_out)
);

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX idx_reservations_client  ON reservations(client_id);
CREATE INDEX idx_reservations_vehicle ON reservations(vehicle_id);
CREATE INDEX idx_reservations_status  ON reservations(status);
CREATE INDEX idx_returns_reservation  ON returns(reservation_id);
CREATE INDEX idx_vehicles_status      ON vehicles(status);

-- ============================================================
-- SEED — Données initiales
-- ============================================================
INSERT INTO vehicles (brand, model, year, category, fuel, transmission, seats, price_per_day, status, plate, mileage, image, features) VALUES
('Toyota',     'Corolla',   2024, 'Berline',    'Essence', 'Automatique', 5, 4500, 'available',    '00125-116-16', 12400, 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400', ARRAY['GPS','Climatisation','Bluetooth','Caméra de recul']),
('Hyundai',    'Tucson',    2023, 'SUV',        'Diesel',  'Automatique', 5, 6500, 'rented',       '00456-118-16', 28900, 'https://images.unsplash.com/photo-1633695632011-9b2f1b3a6b14?w=400', ARRAY['GPS','Climatisation','Bluetooth','Toit ouvrant','4x4']),
('Renault',    'Clio 5',    2024, 'Citadine',   'Essence', 'Manuelle',    5, 3000, 'available',    '00789-120-16',  8200, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400', ARRAY['Climatisation','Bluetooth']),
('Mercedes',   'Classe C',  2023, 'Premium',    'Diesel',  'Automatique', 5,12000, 'available',    '01012-122-16', 15600, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400', ARRAY['GPS','Climatisation','Cuir','Bluetooth','Caméra 360°','Sièges chauffants']),
('Dacia',      'Logan',     2024, 'Économique', 'Essence', 'Manuelle',    5, 2500, 'rented',       '01345-124-16', 45200, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400', ARRAY['Climatisation']),
('Peugeot',    '3008',      2023, 'SUV',        'Diesel',  'Automatique', 5, 7000, 'maintenance',  '01678-126-16', 34100, 'https://images.unsplash.com/photo-1606611013016-969c19ba27b5?w=400', ARRAY['GPS','Climatisation','Bluetooth','Aide au stationnement']),
('Volkswagen', 'Golf 8',    2024, 'Berline',    'Essence', 'Automatique', 5, 5500, 'available',    '01901-128-16', 11000, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400', ARRAY['GPS','Climatisation','Bluetooth','Apple CarPlay']),
('Kia',        'Sportage',  2023, 'SUV',        'Diesel',  'Automatique', 5, 6000, 'rented',       '02234-130-16', 22300, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400', ARRAY['GPS','Climatisation','Bluetooth','Caméra de recul']),
('Citroën',    'C3',        2024, 'Citadine',   'Essence', 'Manuelle',    5, 2800, 'available',    '02567-132-16',  6800, 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400', ARRAY['Climatisation','Bluetooth']),
('BMW',        'X3',        2022, 'Premium',    'Diesel',  'Automatique', 5,11000, 'available',    '02890-134-16', 31200, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400', ARRAY['GPS','Cuir','Climatisation','Bluetooth','Toit panoramique']);

INSERT INTO clients (first_name, last_name, phone, email, address, license, license_number, total_rentals, status, joined_date) VALUES
('Ahmed',   'BOUZID',    '0555 12 34 56', 'ahmed.bouzid@email.com',  'Alger Centre', 'B', '12345678',  8, 'active',   '2024-03-15'),
('Fatima',  'ZERHOUNI',  '0661 98 76 54', 'fatima.z@email.com',       'Oran',         'B', '23456789',  3, 'active',   '2024-08-22'),
('Karim',   'MESSAOUDI', '0770 45 67 89', 'k.messaoudi@email.com',    'Constantine',  'B', '34567890', 12, 'active',   '2023-11-10'),
('Yasmine', 'BENALI',    '0555 78 90 12', 'yasmine.b@email.com',      'Blida',        'B', '45678901',  1, 'active',   '2025-01-05'),
('Mohamed', 'CHERIF',    '0661 23 45 67', 'm.cherif@email.com',       'Sétif',        'B', '56789012',  5, 'inactive', '2024-06-18'),
('Amina',   'HADJ',      '0770 11 22 33', 'amina.hadj@email.com',     'Tlemcen',      'B', '67890123',  2, 'active',   '2025-02-14');

INSERT INTO reservations (client_id, vehicle_id, start_date, end_date, status, total_price, paid_amount, deposit, payment_method, km_limit, extra_km_price, notes) VALUES
(1, 2, '2025-05-10', '2025-05-17', 'active',    45500, 45500, 20000, 'Espèces',  300, 50, ''),
(3, 5, '2025-05-12', '2025-05-14', 'active',     5000,  5000, 10000, 'Virement', 200, 40, 'Client régulier'),
(2, 8, '2025-05-08', '2025-05-15', 'active',    42000, 30000, 15000, 'Espèces',  400, 60, 'Reste à payer: 12000 DA'),
(4, 1, '2025-05-18', '2025-05-22', 'upcoming',  18000,     0,     0, '',         200, 50, 'Première location'),
(1, 7, '2025-04-20', '2025-04-25', 'completed', 27500, 27500, 20000, 'Espèces',  250, 50, ''),
(3, 4, '2025-04-15', '2025-04-18', 'completed', 36000, 36000, 25000, 'CCP',      300, 80, ''),
(5, 3, '2025-05-20', '2025-05-25', 'upcoming',  15000,  7500, 10000, 'Espèces',  200, 50, ''),
(6,10, '2025-05-25', '2025-05-30', 'upcoming',  55000,     0,     0, '',         500,100, ''),
(2, 9, '2025-03-10', '2025-03-13', 'completed',  8400,  8400, 10000, 'Espèces',  150, 40, ''),
(4, 6, '2025-04-01', '2025-04-05', 'completed', 28000, 28000, 15000, 'Virement', 200, 70, '');

INSERT INTO returns (reservation_id, return_date, mileage_out, mileage_in, fuel_out, fuel_in, condition, damages, excess_km, km_fees, extra_charges, notes) VALUES
(5, '2025-04-25', 10200, 10850, 'Plein', 'Plein',  'Bon',            '',                              0,    0,    0, 'RAS'),
(6, '2025-04-18', 14800, 15600, 'Plein', '3/4',    'Bon',            '',                              0,    0, 1500, 'Frais carburant manquant'),
(9, '2025-03-13',  6200,  6800, 'Plein', 'Plein',  'Bon',            '',                              0,    0,    0, ''),
(10,'2025-04-05', 32500, 34100, 'Plein', '1/2',    'Dommage mineur', 'Rayure pare-choc avant',      300, 21000, 8000, 'Réparation programmée');
