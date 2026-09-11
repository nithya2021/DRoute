-- DRoute Supabase Schema

CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  vehicle_number TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS delivery_stops (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  customer_name TEXT,
  contact_number TEXT,
  notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- stops is JSONB because a Route carries full DeliveryStop objects, not just ids
CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL REFERENCES drivers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  stops JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_distance DOUBLE PRECISION,
  estimated_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS import_jobs (
  id TEXT PRIMARY KEY,
  filename TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  total_stops INTEGER DEFAULT 0,
  processed_stops INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS delivery_proofs (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES routes(id),
  stop_id TEXT NOT NULL,
  image_url TEXT,
  signature_url TEXT,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_routes_driver_id ON routes(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_proofs_route_id ON delivery_proofs(route_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
