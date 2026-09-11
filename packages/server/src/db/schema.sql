-- DRoute Supabase Schema

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  vehicle_number TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Delivery Stops Table
CREATE TABLE IF NOT EXISTS delivery_stops (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  customer_name TEXT,
  contact_number TEXT,
  notes TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Routes Table
CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL REFERENCES drivers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  stops TEXT[] NOT NULL DEFAULT '{}',
  total_distance DECIMAL(10, 2),
  estimated_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Import Jobs Table
CREATE TABLE IF NOT EXISTS import_jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'processing',
  total_records INTEGER,
  processed_records INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Delivery Proofs Table
CREATE TABLE IF NOT EXISTS delivery_proofs (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES routes(id),
  image_url TEXT,
  notes TEXT,
  signature_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_routes_driver_id ON routes(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_proofs_route_id ON delivery_proofs(route_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
