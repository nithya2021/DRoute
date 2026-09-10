# 🧪 DRoute Complete Testing Suite

Comprehensive testing guide with scripts and verification steps.

---

## 📋 Pre-Test Checklist

Before starting tests, verify:

- [ ] Node.js v18+ installed: `node --version`
- [ ] npm v9+ installed: `npm --version`
- [ ] Git v2+ installed: `git --version`
- [ ] Supabase account active
- [ ] `.env` file has correct credentials
- [ ] Both servers will be started

---

## 🧪 Test 1: Compilation & Dependencies

### Verify TypeScript compilation:

```bash
# Test server build
npm run build --workspace=@droute/server

# Should output:
# No errors ✓
```

### Verify all dependencies installed:

```bash
# Check key packages
npm list @supabase/supabase-js
npm list express
npm list react

# Should show versions installed
```

### Verify package integrity:

```bash
# Check for vulnerabilities
npm audit

# Should show vulnerabilities that are acceptable for demo
# (xlsx module has known low-severity issues)
```

✅ **Expected Result**: All packages installed, no blocking errors

---

## 🧪 Test 2: Server Health Check

### Start server:

```bash
# Terminal 1
npm run dev --workspace=@droute/server

# Wait for output:
# "Server running on port 3001"
```

### Test health endpoint:

```bash
# Terminal 2 - Run these
curl -s http://localhost:3001/health | jq .

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-09-10T..."
# }
```

✅ **Expected Result**: Server responds with status "ok"

---

## 🧪 Test 3: Database Connection

### Test driver fetch:

```bash
curl -s http://localhost:3001/api/drivers | jq .

# Expected response (5 drivers):
# [
#   {
#     "id": "driver_1",
#     "name": "Ahmad",
#     "vehicleNumber": "SG001",
#     "phoneNumber": "6581234561",
#     "status": "active"
#   },
#   {
#     "id": "driver_2",
#     "name": "Bala",
#     ...
#   },
#   ...
# ]
```

✅ **Expected Result**: All 5 drivers returned from Supabase

---

## 🧪 Test 4: Frontend Startup

### Start frontend:

```bash
# Terminal 2 (or new terminal)
npm run dev --workspace=@droute/client

# Wait for output:
# "VITE v5.4.21 ready in XXX ms"
# "➜  Local:   http://localhost:5173/"
```

### Open browser:

```
http://localhost:5173
```

### Verify UI:

- [ ] Page loads without errors
- [ ] 4 tabs visible: Import, Optimize, View Routes, Drivers
- [ ] All UI elements render
- [ ] No console errors (F12 → Console)
- [ ] Responsive on browser window resize

✅ **Expected Result**: Clean UI with all 4 tabs functional

---

## 🧪 Test 5: Excel Import Test (Small)

### Create test file:

Create `test-5-stops.xlsx` with columns:
- Address
- Postal Code
- Customer Name
- Contact Number

Example data:
```
123 Marina Bay Street | 018953 | John Lim | 6581234567
456 East Coast Drive | 520098 | Sarah Tan | 6581234568
789 Tampines Street 71 | 456318 | Ahmad Hassan | 6581234569
321 Clementi Road | 678568 | Lisa Wong | 6581234570
654 Orchard Road | 238843 | Rajesh Kumar | 6581234571
```

### Test via API:

```bash
curl -X POST http://localhost:3001/api/import/excel \
  -F "file=@test-5-stops.xlsx"

# Expected response:
# {
#   "jobId": "import_1789...",
#   "message": "File imported successfully",
#   "stopsCount": 5
# }
```

### Test via Browser:

1. Open http://localhost:5173
2. Click "Import Deliveries" tab
3. Choose file or drag-drop `test-5-stops.xlsx`
4. Click "Upload"
5. Should see: "✅ 5 records successfully imported"

✅ **Expected Result**: 5 stops imported into database

---

## 🧪 Test 6: Route Optimization

### Optimize via API:

```bash
curl -X POST http://localhost:3001/api/optimization/optimize

# Expected response:
# {
#   "routes": [
#     {
#       "id": "route_1",
#       "driverId": "driver_1",
#       "status": "pending",
#       "stops": ["stop_1"],
#       "totalDistance": 0,
#       "estimatedDuration": 100
#     },
#     ...
#   ],
#   "totalStops": 5,
#   "averageStopsPerRoute": 1,
#   "totalDistance": 20.17
# }
```

### Optimize via Browser:

1. Click "Optimize Routes" tab
2. Click "Optimize Routes" button
3. Should see results:
   - Total Stops: 5
   - Routes Created: 5
   - Average Stops/Route: 1
   - Total Distance: calculated

✅ **Expected Result**: 5 routes created (1 per driver)

---

## 🧪 Test 7: View Routes

### Via API:

```bash
curl -s http://localhost:3001/api/optimization/routes | jq .

# Expected: Array of 5 routes
# Each with id, driverId, status, stops, distance, duration
```

### Via Browser:

1. Click "View Routes" tab
2. Should see 5 route cards:
   - Route 1: Ahmad (SG001) - 1 stop - Pending
   - Route 2: Bala (SG002) - 1 stop - Pending
   - Route 3: Chen (SG003) - 1 stop - Pending
   - Route 4: David (SG004) - 1 stop - Pending
   - Route 5: Ethan (SG005) - 1 stop - Pending
3. Click on a route to expand
4. See driver details and delivery stops

✅ **Expected Result**: All 5 routes displayed correctly

---

## 🧪 Test 8: Update Route Status

### Via API:

```bash
# First get a route ID from previous test, e.g., route_1
curl -X PATCH http://localhost:3001/api/routes/route_1 \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'

# Expected response:
# {
#   "id": "route_1",
#   "driverId": "driver_1",
#   "status": "in-progress",  # Changed!
#   ...
# }
```

### Via Browser:

1. Click on a route to expand
2. Click status dropdown
3. Change from "Pending" to "In Progress"
4. Should update immediately
5. Change to "Completed"
6. Should update again

✅ **Expected Result**: Status updates persist in database

---

## 🧪 Test 9: Driver Management

### Via API:

```bash
# Get all drivers
curl -s http://localhost:3001/api/drivers | jq .

# Get single driver
curl -s http://localhost:3001/api/drivers/driver_1 | jq .

# Get driver's routes
curl -s http://localhost:3001/api/drivers/driver_1/routes | jq .
```

### Via Browser:

1. Click "Drivers" tab
2. Should see all 5 drivers:
   - Name, Vehicle Number, Phone
   - Status: Active
   - Assigned Routes count
3. Verify data matches API response

✅ **Expected Result**: All driver endpoints functional

---

## 🧪 Test 10: Proof of Delivery

### Via API:

```bash
# Add proof (replace route_1 with actual route ID)
curl -X POST http://localhost:3001/api/routes/route_1/proof \
  -H "Content-Type: application/json" \
  -d '{
    "stopId": "stop_1",
    "imageUrl": "https://example.com/delivery.jpg",
    "signatureUrl": "https://example.com/signature.jpg",
    "notes": "Delivered successfully"
  }'

# Expected response:
# {
#   "id": "proof_1789...",
#   "routeId": "route_1",
#   "stopId": "stop_1",
#   "timestamp": "2026-09-10T...",
#   ...
# }

# Get proof
curl -s http://localhost:3001/api/routes/route_1/proofs | jq .
```

✅ **Expected Result**: Proof stored and retrieved

---

## 🧪 Test 11: Large Dataset (15 Stops)

### Create test file with 15 stops:

Use the data from `SAMPLE_TEST_DATA.md` → Sample 2

### Test import:

```bash
curl -X POST http://localhost:3001/api/import/excel \
  -F "file=@test-15-stops.xlsx"

# Expected: stopsCount: 15
```

### Test optimization:

```bash
curl -X POST http://localhost:3001/api/optimization/optimize

# Expected:
# {
#   "totalStops": 15,
#   "routes": [...],    # 5 routes
#   "averageStopsPerRoute": 3,
#   "totalDistance": 20.17
# }
```

### Verify in browser:

1. Upload test-15-stops.xlsx
2. Optimize routes
3. Should see:
   - 5 routes
   - ~3 stops each
   - Geographic clustering

✅ **Expected Result**: Large dataset optimization works

---

## 🧪 Test 12: Error Handling

### Test missing required fields:

```bash
# Missing file
curl -X POST http://localhost:3001/api/import/excel

# Expected: 400 error with "No file uploaded"
```

### Test invalid route ID:

```bash
curl http://localhost:3001/api/routes/invalid_id

# Expected: 404 "Route not found"
```

### Test invalid status:

```bash
curl -X PATCH http://localhost:3001/api/routes/route_1 \
  -H "Content-Type: application/json" \
  -d '{"status": "invalid"}'

# Expected: 400 "Invalid status"
```

✅ **Expected Result**: All error cases handled gracefully

---

## 🧪 Test 13: Performance Testing

### Measure response times:

```bash
# Time health check
time curl http://localhost:3001/health

# Time drivers fetch
time curl http://localhost:3001/api/drivers

# Time routes fetch
time curl http://localhost:3001/api/optimization/routes

# Time route optimization
time curl -X POST http://localhost:3001/api/optimization/optimize
```

### Expected times:

| Operation | Expected |
|-----------|----------|
| Health | <10ms |
| Fetch drivers | <50ms |
| Fetch routes | <50ms |
| Optimize routes | <200ms |

✅ **Expected Result**: All operations fast (<200ms)

---

## 🧪 Test 14: Database Persistence

### Verify data survives restart:

```bash
# 1. Import 5 stops and optimize routes
# 2. Stop server (Ctrl+C)
# 3. Wait 5 seconds
# 4. Restart server
npm run dev --workspace=@droute/server

# 5. Check routes still exist
curl -s http://localhost:3001/api/optimization/routes | jq . length

# Should show 5 routes (or more if you added more)
```

✅ **Expected Result**: Data persists in Supabase after restart

---

## 🧪 Test 15: Responsive Design

### Test on different screen sizes:

```bash
Browser: http://localhost:5173

Resize to:
- [ ] Desktop (1920x1080): All UI visible
- [ ] Tablet (768x1024): UI adapts properly
- [ ] Mobile (375x667): UI stacks vertically
- [ ] Phone (375x812): All tabs accessible
```

### Test on mobile device:

```bash
# On same WiFi network:
ifconfig | grep inet
# Get your local IP, e.g., 192.168.1.100

# On mobile:
http://192.168.1.100:5173
```

✅ **Expected Result**: Responsive on all devices

---

## ✅ Complete Test Checklist

- [ ] Test 1: Compilation & Dependencies ✓
- [ ] Test 2: Server Health Check ✓
- [ ] Test 3: Database Connection ✓
- [ ] Test 4: Frontend Startup ✓
- [ ] Test 5: Excel Import (5 stops) ✓
- [ ] Test 6: Route Optimization ✓
- [ ] Test 7: View Routes ✓
- [ ] Test 8: Update Status ✓
- [ ] Test 9: Driver Management ✓
- [ ] Test 10: Proof of Delivery ✓
- [ ] Test 11: Large Dataset (15 stops) ✓
- [ ] Test 12: Error Handling ✓
- [ ] Test 13: Performance Testing ✓
- [ ] Test 14: Database Persistence ✓
- [ ] Test 15: Responsive Design ✓

---

## 📊 Results Summary Template

```
DROUTE TEST RESULTS - [DATE]

Environment:
- Node: [version]
- npm: [version]
- Browser: [name/version]
- OS: [OS name]

Tests Passed: [X/15]
- Compilation: PASS/FAIL
- Server Health: PASS/FAIL
- Database: PASS/FAIL
- Frontend: PASS/FAIL
- Import (5): PASS/FAIL
- Optimization: PASS/FAIL
- View Routes: PASS/FAIL
- Update Status: PASS/FAIL
- Drivers: PASS/FAIL
- Proof: PASS/FAIL
- Large Data: PASS/FAIL
- Error Handling: PASS/FAIL
- Performance: PASS/FAIL
- Persistence: PASS/FAIL
- Responsive: PASS/FAIL

Performance Metrics:
- Health: [time]ms
- Drivers: [time]ms
- Routes: [time]ms
- Optimize: [time]ms

Issues Found:
- [Issue 1]
- [Issue 2]

Overall Status: PASS/FAIL
```

---

## 🐛 Troubleshooting

### Port already in use:
```bash
lsof -i :3001  # Find process
kill -9 [PID]   # Kill it
npm run dev --workspace=@droute/server
```

### Supabase connection error:
```bash
# Verify credentials
cat .env | grep SUPABASE

# Test connection
curl https://vevapobsxogijxxkwnen.supabase.co/rest/v1/drivers \
  -H "apikey: [your-key]"
```

### Frontend not loading:
```bash
# Check console (F12)
# Clear browser cache (Ctrl+Shift+Delete)
# Restart npm run dev
```

### No data in database:
```bash
# Verify .env is loaded
echo $SUPABASE_URL

# Check Supabase dashboard
# https://supabase.com/dashboard/project/vevapobsxogijxxkwnen
```

---

## 🎯 Success Criteria

All tests pass when:

✅ Server responds to all endpoints  
✅ Database connects and returns data  
✅ Frontend loads without errors  
✅ Excel import works  
✅ Route optimization creates 5 routes  
✅ Routes can be viewed  
✅ Status updates work  
✅ Driver data displays  
✅ Proof of delivery works  
✅ Large datasets process  
✅ Errors handled gracefully  
✅ Performance is fast (<200ms)  
✅ Data persists after restart  
✅ UI is responsive  

---

## 📝 Notes

- Run all tests in sequence
- Keep both terminals (backend + frontend) running
- Use jq for prettier JSON output: `pip install jq` or `brew install jq`
- Screenshot results for records
- Run tests after any code changes

---

**Generated**: September 10, 2026  
**Status**: ✅ Complete Testing Suite Ready
