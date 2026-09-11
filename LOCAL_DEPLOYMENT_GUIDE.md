# 🚀 DRoute Local Deployment & Testing Guide

Complete step-by-step guide to run DRoute locally with Supabase integration.

---

## 📋 Prerequisites

✅ Supabase Account (Project ID: `vevapobsxogijxxkwnen`)  
✅ Node.js v18+ installed  
✅ npm v9+ installed  
✅ Git installed  

**Check versions:**
```bash
node --version    # Should be v18 or higher
npm --version     # Should be v9 or higher
git --version     # Should be 2.0+
```

---

## 🔧 Step 1: Clone Repository

```bash
# Clone the repo
git clone https://github.com/nithya2021/DRoute.git
cd DRoute

# Verify branch has Supabase integration
git log --oneline | head -3
# Should show commits about "Supabase integration"
```

---

## ⚙️ Step 2: Install Dependencies

```bash
# Install all packages (takes ~2 minutes)
npm install

# Verify installation
npm list | grep supabase
# Should show: @supabase/supabase-js@^2.38.0
```

---

## 🔑 Step 3: Configure Supabase Credentials

Edit `.env` file in project root:

```bash
# Open in text editor
nano .env
# or
code .env  # if using VS Code
```

Verify it contains:
```env
PORT=3001
NODE_ENV=development
REACT_APP_API_URL=http://localhost:3001/api

# Supabase Configuration (ALREADY SET)
SUPABASE_URL=https://vevapobsxogijxxkwnen.supabase.co
SUPABASE_SECRET_KEY=<your sb_secret_... key>
```

Save and close.

---

## 🎯 Step 4: Start Backend Server

```bash
# Terminal 1 - Keep this running
npm run dev --workspace=@droute/server

# Expected output:
# > @droute/server@1.0.0 dev
# > tsx watch src/index.ts
# Server running on port 3001
```

✅ **Server is ready when you see "Server running on port 3001"**

---

## 🎨 Step 5: Start Frontend (New Terminal)

```bash
# Terminal 2 - Keep this running
npm run dev --workspace=@droute/client

# Expected output:
# VITE v5.4.21 ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

✅ **Frontend is ready when you see the local URL**

---

## 🌐 Step 6: Open Website

Open your browser and go to:

```
http://localhost:5173
```

You should see:
- 📱 **DRoute Delivery Route Optimization**
- 4 tabs: Import Deliveries, Optimize Routes, View Routes, Drivers
- All UI elements fully functional

---

## 🧪 Testing Workflow

### Test 1: Check API Health

```bash
# Terminal 3 - Test endpoints
curl http://localhost:3001/health

# Response:
# {"status":"ok","timestamp":"2026-09-10T..."}
```

✅ **Backend is connected**

---

### Test 2: Fetch Drivers from Supabase

```bash
curl http://localhost:3001/api/drivers

# Response (5 drivers):
# [
#   {"id":"driver_1","name":"Ahmad","vehicleNumber":"SG001",...},
#   {"id":"driver_2","name":"Bala","vehicleNumber":"SG002",...},
#   ...
# ]
```

✅ **Supabase connection working!**

---

### Test 3: Import Sample Excel File

**Download sample file:** `samples/sample-deliveries.xlsx`

In browser at http://localhost:5173:
1. Click **"Import Deliveries"** tab
2. Click **"Choose File"** or drag-drop `sample-deliveries.xlsx`
3. Click **"Upload"**
4. Expected: "✅ 15 records successfully imported"

---

### Test 4: Optimize Routes

In same browser:
1. Click **"Optimize Routes"** tab
2. Click **"Optimize Routes"** button
3. Expected results:
   - Total Stops: 15
   - Routes Created: 5
   - Average Stops/Route: ~3
   - Total Distance: ~20 km

---

### Test 5: View Optimized Routes

1. Click **"View Routes"** tab
2. You should see:
   - Route 1: Ahmad (SG001) - 3 stops - Pending
   - Route 2: Bala (SG002) - 3 stops - Pending
   - Route 3: Chen (SG003) - 3 stops - Pending
   - Route 4: David (SG004) - 3 stops - Pending
   - Route 5: Ethan (SG005) - 3 stops - Pending

3. Click on any route to expand and see:
   - Driver details
   - Delivery stops with addresses
   - Estimated duration
   - Google Maps link

---

### Test 6: Update Route Status

In "View Routes" tab:
1. Click a route to expand
2. Click status dropdown (currently "Pending")
3. Change to "In Progress" or "Completed"
4. Status updates in database instantly

---

### Test 7: View Driver Assignments

1. Click **"Drivers"** tab
2. See all 5 drivers with:
   - Name, Vehicle Number, Phone
   - Assigned Routes count
   - Status (Active/Inactive)
   - Contact information

---

### Test 8: Test Proof of Delivery

```bash
# Add proof via API
curl -X POST http://localhost:3001/api/routes/route_id_here/proof \
  -H "Content-Type: application/json" \
  -d '{
    "stopId": "stop_123",
    "imageUrl": "https://example.com/image.jpg",
    "signatureUrl": "https://example.com/signature.jpg",
    "notes": "Delivered successfully"
  }'

# Response:
# {"id":"proof_1789...","routeId":"route_...","timestamp":"2026-09-10T..."}
```

✅ **All proof data stored in Supabase**

---

## 📊 Complete Test Checklist

- [ ] Backend server starts successfully
- [ ] Frontend loads at http://localhost:5173
- [ ] Health endpoint responds (http://localhost:3001/health)
- [ ] Drivers list fetched from Supabase
- [ ] Excel file imported (15 stops)
- [ ] Routes optimized (5 routes created)
- [ ] Routes visible in "View Routes" tab
- [ ] Route status can be updated
- [ ] Driver assignments display correctly
- [ ] Proof of delivery endpoint works
- [ ] All data persists in Supabase

---

## 🔍 Troubleshooting

### Issue: "Server running on port 3001" but can't connect

**Solution:**
```bash
# Check if port is already in use
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process and restart
pkill -f "tsx watch"  # or use the PID from above
npm run dev --workspace=@droute/server
```

### Issue: "SUPABASE_URL is required"

**Solution:**
```bash
# Verify .env file exists and is readable
cat .env | grep SUPABASE_URL

# If empty, update it:
echo "SUPABASE_URL=https://vevapobsxogijxxkwnen.supabase.co" >> .env
echo "SUPABASE_SECRET_KEY=<your-key-here>" >> .env
```

### Issue: Excel import fails

**Solution:**
```bash
# Check file format is .xlsx (not .xls)
# Verify columns: Address, Postal Code, Customer Name, Contact Number

# Use provided sample file:
# /samples/sample-deliveries.xlsx
```

### Issue: No drivers showing up

**Solution:**
```bash
# Test direct Supabase connection
curl "https://vevapobsxogijxxkwnen.supabase.co/rest/v1/drivers?select=*" \
  -H "apikey: <your-anon-key>"

# If error, check:
# 1. Network connectivity
# 2. Supabase project is active
# 3. Credentials are correct (no typos)
```

### Issue: "Port already in use"

**Solution:**
```bash
# Use different port
PORT=3002 npm run dev --workspace=@droute/server
# Update frontend API URL in .env
```

---

## 📈 Performance Expectations

| Metric | Expected |
|--------|----------|
| Backend startup | <3 seconds |
| Frontend load | <2 seconds |
| API response time | <100ms |
| Excel import (15 rows) | <500ms |
| Route optimization | <200ms |
| Database query | <50ms |

---

## 🔄 Typical Workflow

```
1. Start Backend (Terminal 1)
   ↓
2. Start Frontend (Terminal 2)
   ↓
3. Open http://localhost:5173 in browser
   ↓
4. Upload Excel file
   ↓
5. Click "Optimize Routes"
   ↓
6. View optimized routes in "View Routes" tab
   ↓
7. Update route statuses as deliveries progress
   ↓
8. Capture proof of delivery
   ↓
9. All data automatically saved in Supabase ✨
```

---

## 📱 Real-World Usage

### Driver Workflow:
1. Manager uploads Excel with 100+ addresses
2. System optimizes into 5 routes automatically
3. Each driver gets ~20 geographically clustered stops
4. Drivers navigate using Google Maps links
5. Driver marks stops as delivered
6. Driver uploads proof (photo/signature)
7. Manager tracks progress in real-time

### Manager Workflow:
1. View all routes and driver assignments
2. Monitor completion status
3. Download delivery reports
4. Verify proof of delivery
5. Manage driver availability

---

## 🚀 Next Steps

### After Local Testing:
- [ ] Test with larger Excel files (50-100 deliveries)
- [ ] Test with multiple drivers
- [ ] Verify mobile responsiveness
- [ ] Test with different browsers
- [ ] Stress test with rapid requests

### Before Production:
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Set up database backups
- [ ] Configure SSL certificate
- [ ] Set up monitoring/logging
- [ ] Deploy to cloud (Heroku, AWS, Vercel)

---

## 📞 Support

If you encounter issues:

1. **Check logs:**
   ```bash
   # Server logs (Terminal 1)
   npm run dev --workspace=@droute/server
   
   # Frontend logs (Browser DevTools - F12)
   ```

2. **Check database:**
   ```bash
   # Supabase Dashboard
   https://supabase.com/dashboard/project/vevapobsxogijxxkwnen
   ```

3. **Check GitHub:**
   ```bash
   https://github.com/nithya2021/DRoute
   ```

---

## ✨ Success Indicators

You'll know everything is working when:

✅ Backend responds to http://localhost:3001/health  
✅ Frontend loads at http://localhost:5173  
✅ 5 drivers appear in Drivers tab  
✅ Excel file imports successfully  
✅ Routes optimize with 5 drivers  
✅ All data persists in Supabase  
✅ UI is responsive and interactive  

---

**🎉 DRoute is ready for testing!**

**Next:** Open http://localhost:5173 and start importing deliveries!

---

Generated: September 10, 2026  
Status: ✅ Production Ready for Local Testing
