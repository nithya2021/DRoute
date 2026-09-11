-- DRoute Shortest Route Optimizer Schema

-- Addresses Table (uploaded from Excel)
CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  upload_batch_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Route Calculations Table
CREATE TABLE IF NOT EXISTS route_calculations (
  id TEXT PRIMARY KEY,
  upload_batch_id TEXT NOT NULL,
  source_address_id TEXT NOT NULL REFERENCES addresses(id),
  destination_address_id TEXT NOT NULL REFERENCES addresses(id),
  ordered_stops TEXT[] NOT NULL DEFAULT '{}',
  total_distance DECIMAL(10, 2),
  total_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Upload Jobs Table
CREATE TABLE IF NOT EXISTS upload_jobs (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  total_records INTEGER,
  processed_records INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_addresses_upload_batch ON addresses(upload_batch_id);
CREATE INDEX IF NOT EXISTS idx_route_calculations_batch ON route_calculations(upload_batch_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_status ON upload_jobs(status);
