# 🗄️ DRoute Supabase Setup Guide

## Overview
This guide walks through setting up Supabase PostgreSQL database for DRoute, replacing the in-memory data store with persistent database storage.

---

## Step 1: Create Supabase Account & Project

### 1.1 Sign Up
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with email, GitHub, or Google
4. Verify your email

### 1.2 Create Organization & Project
1. Create a new organization (if prompted)
2. Create a new project:
   - **Project Name**: `droute` (or your preference)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to Singapore (e.g., Singapore if available, else Asia-Pacific)
3. Wait for project initialization (~2 minutes)

---

## Step 2: Get Supabase Credentials

Once project is created:

1. Go to **Settings → API** in left sidebar
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

Example:
```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Create Database Schema

### 3.1 Using Supabase SQL Editor (Recommended)

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire SQL schema from `/packages/server/src/db/schema.sql`
4. Paste into the SQL editor
5. Click **"Run"**
6. Verify all tables created successfully

### 3.2 Verify Tables Created

In **Table Editor** (left sidebar), you should see:
- ✅ `drivers`
- ✅ `delivery_stops`
- ✅ `routes`
- ✅ `import_jobs`
- ✅ `delivery_proofs`

---

## Step 4: Configure Environment Variables

### 4.1 Update `.env` file

Edit `/home/user/DRoute/.env`:

```env
PORT=3001
NODE_ENV=development
REACT_APP_API_URL=http://localhost:3001/api

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual credentials from Step 2.

### 4.2 Create `.env.example`

Create `/home/user/DRoute/.env.example`:

```env
PORT=3001
NODE_ENV=development
REACT_APP_API_URL=http://localhost:3001/api

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

---

## Step 5: Install Dependencies

```bash
cd /home/user/DRoute
npm install
```

This installs the new `@supabase/supabase-js` client library.

---

## Step 6: Update Server Code to Use Supabase

The following files have been updated to support Supabase:

- ✅ `packages/server/src/services/supabase-store.ts` - New Supabase data store
- ✅ `packages/server/package.json` - Added `@supabase/supabase-js` dependency
- ✅ `.env` - Added Supabase credentials

**Next Step**: The server code needs to be updated to use `supabaseStore` instead of `dataStore`. This is done in each route handler.

---

## Step 7: Database Security Rules (RLS)

### Enable Row Level Security (Optional but Recommended)

In Supabase dashboard:

1. Go to **Authentication → Policies**
2. For each table, enable RLS:
   - Click table name
   - Toggle "Enable RLS"
   - Create allow-all policy for development (or restrict based on auth later)

For now, you can create a simple policy:

```sql
CREATE POLICY "Allow all" ON delivery_stops
  FOR ALL USING (true);

CREATE POLICY "Allow all" ON routes
  FOR ALL USING (true);

CREATE POLICY "Allow all" ON drivers
  FOR ALL USING (true);

CREATE POLICY "Allow all" ON import_jobs
  FOR ALL USING (true);

CREATE POLICY "Allow all" ON delivery_proofs
  FOR ALL USING (true);
```

---

## Step 8: Test Connection

### 8.1 Start the Server

```bash
npm run dev --workspace=@droute/server
```

### 8.2 Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Should respond with:
```json
{"status":"ok"}
```

### 8.3 Test Drivers Endpoint

```bash
curl http://localhost:3001/api/drivers
```

Should return empty array `[]` initially (no drivers seeded yet).

---

## Step 9: Initialize Default Drivers

The default 5 drivers need to be seeded into Supabase. Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO drivers (id, name, vehicle_number, phone_number, status) VALUES
  ('driver_1', 'Ahmad', 'SG001', '6581234561', 'active'),
  ('driver_2', 'Bala', 'SG002', '6581234562', 'active'),
  ('driver_3', 'Chen', 'SG003', '6581234563', 'active'),
  ('driver_4', 'David', 'SG004', '6581234564', 'active'),
  ('driver_5', 'Ethan', 'SG005', '6581234565', 'active');
```

Or use the API to create drivers:

```bash
# Ahmad
curl -X POST http://localhost:3001/api/drivers \
  -H "Content-Type: application/json" \
  -d '{"name":"Ahmad","vehicleNumber":"SG001","phoneNumber":"6581234561"}'

# Repeat for Bala, Chen, David, Ethan with appropriate data
```

---

## Step 10: Test Full Workflow

### 10.1 Import Deliveries

```bash
curl -X POST http://localhost:3001/api/import/excel \
  -F "file=@path/to/excel/file.xlsx"
```

### 10.2 Optimize Routes

```bash
curl -X POST http://localhost:3001/api/optimization/optimize
```

### 10.3 Check Routes

```bash
curl http://localhost:3001/api/optimization/routes
```

All data should now be persisted in Supabase PostgreSQL!

---

## Troubleshooting

### Connection Error: "SUPABASE_URL is required"

**Problem**: `.env` file not found or credentials missing

**Solution**:
```bash
# Verify .env exists
cat /home/user/DRoute/.env

# Check credentials are set
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

### Error: "Auth session missing"

**Problem**: Supabase RLS policies are blocking access

**Solution**: 
1. Go to Supabase dashboard → Table Editor
2. Click each table → RLS Toggle → Disable RLS for development

### Error: "relation does not exist"

**Problem**: Database schema wasn't created

**Solution**:
1. Go to Supabase SQL Editor
2. Run the schema.sql file again
3. Verify tables appear in Table Editor

### Slow Queries

**Problem**: No database indexes

**Solution**: Schema already includes indexes. If slow, run:

```sql
CREATE INDEX IF NOT EXISTS idx_routes_driver_id ON routes(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_proofs_route_id ON delivery_proofs(route_id);
```

---

## Deployment Notes

### Production Environment

For production deployment (.env.production):

```env
SUPABASE_URL=your_production_url
SUPABASE_ANON_KEY=your_production_key
NODE_ENV=production
```

### Database Backups

Supabase automatically backs up your database daily. Access backups in:
**Settings → Backups**

### Monitoring

Monitor database in:
- **Logs** → Real-time logs
- **Metrics** → Performance stats
- **Network** → Request analytics

---

## Next Steps

1. ✅ Supabase account created
2. ✅ Database schema deployed
3. ✅ Environment variables configured
4. ✅ Server dependencies updated
5. 🔄 **Next**: Update all route handlers to use `supabaseStore` instead of `dataStore`
6. 🔄 **After**: Run comprehensive tests
7. 🔄 **Finally**: Commit and push to GitHub

---

## Reference Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status**: 🎯 Ready for implementation

Generated: September 10, 2026
