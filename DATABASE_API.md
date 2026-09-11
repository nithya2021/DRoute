# DRoute Database API Guide

Complete guide for adding and retrieving data from Supabase.

---

## Overview

The DRoute server is now fully integrated with Supabase PostgreSQL database. All data is persisted and retrieved asynchronously.

### Available Endpoints

- **Drivers**: Manage delivery drivers
- **Delivery Stops**: Import and manage delivery locations
- **Routes**: Optimize and track delivery routes
- **Delivery Proofs**: Record delivery confirmations
- **Import Jobs**: Track Excel file imports

---

## 1. DRIVERS API

### Get All Drivers

```bash
curl http://localhost:3001/api/drivers
```

**Response:**
```json
[
  {
    "id": "driver_1",
    "name": "Ahmad",
    "vehicle_number": "SG001",
    "phone_number": "6581234561",
    "status": "active",
    "created_at": "2026-09-10T10:00:00.000Z"
  }
]
```

### Get Single Driver

```bash
curl http://localhost:3001/api/drivers/driver_1
```

**Response:**
```json
{
  "id": "driver_1",
  "name": "Ahmad",
  "vehicle_number": "SG001",
  "phone_number": "6581234561",
  "status": "active",
  "created_at": "2026-09-10T10:00:00.000Z"
}
```

### Get Driver's Routes

```bash
curl http://localhost:3001/api/drivers/driver_1/routes
```

**Response:**
```json
[
  {
    "id": "route_1",
    "driver_id": "driver_1",
    "status": "in-progress",
    "stops": ["stop_1", "stop_2", "stop_3"],
    "total_distance": 25.5,
    "estimated_duration": 120,
    "created_at": "2026-09-10T10:00:00.000Z",
    "updated_at": "2026-09-10T10:15:00.000Z"
  }
]
```

### Add Driver via API (if needed)

```bash
curl -X POST http://localhost:3001/api/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "driver_6",
    "name": "Fatima",
    "vehicle_number": "SG006",
    "phone_number": "6581234566",
    "status": "active"
  }'
```

---

## 2. DELIVERY STOPS API

### Get All Delivery Stops

```bash
curl http://localhost:3001/api/routes
```

### Import Delivery Stops via Excel

```bash
curl -X POST http://localhost:3001/api/import/excel \
  -F "file=@deliveries.xlsx"
```

**Response:**
```json
{
  "jobId": "import_1694350800000",
  "message": "File imported successfully",
  "stopsCount": 150
}
```

**Excel File Format** (`deliveries.xlsx`):
```
| Address                           | Postal Code | Customer Name | Contact Number | Latitude   | Longitude  | Notes        |
|-----------------------------------|------------|----------------|-----------------|------------|------------|--------------|
| 1 Sentosa Road, Singapore         | 098522     | John Tan       | 91234567       | 1.2496     | 103.8303   | Leave at gate|
| 123 Ang Mo Kio Avenue 5, Singapore| 569933     | Mary Lee       | 98765432       | 1.3735     | 103.8456   | Ring doorbell|
```

---

## 3. OPTIMIZATION API

### Get All Routes

```bash
curl http://localhost:3001/api/optimization/routes
```

**Response:**
```json
[
  {
    "id": "route_20260910_1",
    "driver_id": "driver_1",
    "status": "pending",
    "stops": ["stop_1", "stop_5", "stop_10"],
    "total_distance": 15.3,
    "estimated_duration": 90,
    "created_at": "2026-09-10T10:00:00.000Z",
    "updated_at": "2026-09-10T10:00:00.000Z"
  }
]
```

### Get Single Route

```bash
curl http://localhost:3001/api/optimization/routes/route_20260910_1
```

### Optimize Routes

**Prerequisite**: Must have delivery stops imported and active drivers

```bash
curl -X POST http://localhost:3001/api/optimization/optimize
```

**Response:**
```json
{
  "routes": [
    {
      "id": "route_20260910_1",
      "driver_id": "driver_1",
      "status": "pending",
      "stops": ["stop_1", "stop_5", "stop_10"],
      "total_distance": 15.3,
      "estimated_duration": 90,
      "created_at": "2026-09-10T10:00:00.000Z",
      "updated_at": "2026-09-10T10:00:00.000Z"
    }
  ],
  "totalStops": 150,
  "averageStopsPerRoute": 30,
  "totalDistance": 450.75
}
```

---

## 4. ROUTE STATUS UPDATES

### Update Route Status

**Valid statuses**: `pending`, `in-progress`, `completed`

```bash
curl -X PATCH http://localhost:3001/api/routes/route_20260910_1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

**Response:**
```json
{
  "id": "route_20260910_1",
  "driver_id": "driver_1",
  "status": "in-progress",
  "stops": ["stop_1", "stop_5", "stop_10"],
  "total_distance": 15.3,
  "estimated_duration": 90,
  "created_at": "2026-09-10T10:00:00.000Z",
  "updated_at": "2026-09-10T10:30:00.000Z"
}
```

---

## 5. DELIVERY PROOFS API

### Add Delivery Proof

Record proof of delivery (photo + optional signature).

```bash
curl -X POST http://localhost:3001/api/routes/route_20260910_1/proof \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://storage.example.com/proof_123.jpg",
    "signatureUrl": "https://storage.example.com/signature_123.png",
    "notes": "Delivered to customer, signed on tablet"
  }'
```

**Response:**
```json
{
  "id": "proof_1694350800000",
  "routeId": "route_20260910_1",
  "imageUrl": "https://storage.example.com/proof_123.jpg",
  "signatureUrl": "https://storage.example.com/signature_123.png",
  "notes": "Delivered to customer, signed on tablet",
  "createdAt": "2026-09-10T10:30:00.000Z"
}
```

### Get Route Proofs

```bash
curl http://localhost:3001/api/routes/route_20260910_1/proofs
```

**Response:**
```json
[
  {
    "id": "proof_1694350800000",
    "routeId": "route_20260910_1",
    "imageUrl": "https://storage.example.com/proof_123.jpg",
    "signatureUrl": "https://storage.example.com/signature_123.png",
    "notes": "Delivered to customer, signed on tablet",
    "createdAt": "2026-09-10T10:30:00.000Z"
  }
]
```

---

## 6. IMPORT JOBS API

### Get All Import Jobs

```bash
curl http://localhost:3001/api/import/jobs
```

**Response:**
```json
[
  {
    "id": "import_1694350800000",
    "filename": "deliveries.xlsx",
    "status": "completed",
    "totalStops": 150,
    "processedStops": 150,
    "createdAt": "2026-09-10T10:00:00.000Z",
    "completedAt": "2026-09-10T10:02:00.000Z"
  }
]
```

### Get Single Import Job

```bash
curl http://localhost:3001/api/import/jobs/import_1694350800000
```

---

## 7. COMPLETE WORKFLOW EXAMPLE

### Step 1: Seed Default Drivers

Execute in Supabase SQL Editor:

```sql
INSERT INTO drivers (id, name, vehicle_number, phone_number, status) VALUES
  ('driver_1', 'Ahmad', 'SG001', '6581234561', 'active'),
  ('driver_2', 'Bala', 'SG002', '6581234562', 'active'),
  ('driver_3', 'Chen', 'SG003', '6581234563', 'active'),
  ('driver_4', 'David', 'SG004', '6581234564', 'active'),
  ('driver_5', 'Ethan', 'SG005', '6581234565', 'active');
```

### Step 2: Import Excel File

```bash
curl -X POST http://localhost:3001/api/import/excel \
  -F "file=@deliveries.xlsx"
```

### Step 3: Optimize Routes

```bash
curl -X POST http://localhost:3001/api/optimization/optimize
```

### Step 4: Check Optimized Routes

```bash
curl http://localhost:3001/api/optimization/routes
```

### Step 5: Update Route Status

```bash
curl -X PATCH http://localhost:3001/api/routes/route_20260910_1 \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

### Step 6: Add Delivery Proof

```bash
curl -X POST http://localhost:3001/api/routes/route_20260910_1/proof \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://storage.example.com/proof_123.jpg",
    "notes": "Delivered successfully"
  }'
```

---

## 8. DATABASE SCHEMA

### Drivers Table

```sql
CREATE TABLE drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  vehicle_number TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Delivery Stops Table

```sql
CREATE TABLE delivery_stops (
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
```

### Routes Table

```sql
CREATE TABLE routes (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL REFERENCES drivers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  stops TEXT[] NOT NULL DEFAULT '{}',
  total_distance DECIMAL(10, 2),
  estimated_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Delivery Proofs Table

```sql
CREATE TABLE delivery_proofs (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES routes(id),
  image_url TEXT,
  notes TEXT,
  signature_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Import Jobs Table

```sql
CREATE TABLE import_jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'processing',
  total_records INTEGER,
  processed_records INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

---

## 9. TROUBLESHOOTING

### Connection Error: "SUPABASE_URL is required"

**Solution**: Verify `.env` file has credentials:
```bash
cat .env
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

### Error: "Auth session missing"

**Solution**: RLS policies blocking access. In Supabase:
1. Go to **Table Editor**
2. Click each table
3. Click **RLS** toggle
4. Disable for development, or create allow-all policy:

```sql
ALTER TABLE delivery_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON delivery_stops FOR ALL USING (true);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON routes FOR ALL USING (true);

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON drivers FOR ALL USING (true);
```

### Error: "relation does not exist"

**Solution**: Schema not created. Run in Supabase SQL Editor:
```bash
# Copy entire schema from /packages/server/src/db/schema.sql
# and run in SQL Editor
```

---

## 10. API RESPONSE CODES

| Code | Meaning                          |
|------|----------------------------------|
| 200  | Success                          |
| 201  | Created                          |
| 400  | Bad Request                      |
| 404  | Not Found                        |
| 500  | Server Error                     |

---

## 11. ENVIRONMENT SETUP

Update `.env` with Supabase credentials:

```env
PORT=3001
NODE_ENV=development
REACT_APP_API_URL=http://localhost:3001/api

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 12. START SERVER

```bash
npm run dev --workspace=@droute/server
```

Server will run on `http://localhost:3001`

---

**Status**: ✅ Database integration complete and ready for production
