# 📊 DRoute Sample Test Data

Complete sample data for testing the DRoute application locally.

---

## 📥 Excel Import Test Data

### Sample 1: Small Test (5 Deliveries)

| Address | Postal Code | Customer Name | Contact Number | Notes |
|---------|-------------|---------------|-----------------|-------|
| 123 Marina Bay Street | 018953 | John Lim | 6581234567 | Ground floor |
| 456 East Coast Drive | 520098 | Sarah Tan | 6581234568 | Unit 12-05 |
| 789 Tampines Street 71 | 456318 | Ahmad Hassan | 6581234569 | Block 789 |
| 321 Clementi Road | 678568 | Lisa Wong | 6581234570 | Office, 3rd floor |
| 654 Orchard Road | 238843 | Rajesh Kumar | 6581234571 | Near MRT |

**How to use:**
1. Copy data into Excel
2. Save as `test-5-stops.xlsx`
3. Upload via "Import Deliveries" tab
4. Click "Optimize Routes"
5. Expect: 5 routes created (1 stop per driver)

---

### Sample 2: Medium Test (15 Deliveries)

| Address | Postal Code | Customer Name | Contact Number | Notes |
|---------|-------------|---------------|-----------------|-------|
| 123 Marina Bay Street | 018953 | John Lim | 6581234567 | Ground floor |
| 456 East Coast Drive | 520098 | Sarah Tan | 6581234568 | Unit 12-05 |
| 789 Tampines Street 71 | 456318 | Ahmad Hassan | 6581234569 | Block 789 |
| 321 Clementi Road | 678568 | Lisa Wong | 6581234570 | Office, 3rd floor |
| 654 Orchard Road | 238843 | Rajesh Kumar | 6581234571 | Near MRT |
| 246 Queens Road | 737570 | Sophie Ng | 6581234572 | Apt 04-12 |
| 321 Bukit Merah Lane | 640084 | David Chen | 6581234573 | Shophouse |
| 987 Bedok Reservoir Road | 520098 | Michelle Chua | 6581234574 | Duplex |
| 654 Novena Plaza | 307623 | Priya Nair | 6581234575 | Shopping mall |
| 135 Joo Chiat Road | 427619 | Tony Goh | 6581234576 | Restaurant |
| 579 Geylang Serai | 402000 | Fatimah Ali | 6581234577 | Market |
| 802 Hougang Avenue | 530802 | Peter Tan | 6581234578 | Industrial area |
| 145 Ang Mo Kio Drive | 565050 | Grace Lee | 6581234579 | Community center |
| 368 Bukit Batok Street | 650368 | Kumar Raj | 6581234580 | Residential |
| 987 Changi Drive | 039802 | Benny Lee | 6581234581 | Airport area |

**How to use:**
1. Copy all 15 rows into Excel
2. Save as `test-15-stops.xlsx`
3. Upload via "Import Deliveries" tab
4. Click "Optimize Routes"
5. Expect: 5 routes with ~3 stops each

---

### Sample 3: Large Test (25 Deliveries)

Use the above 15 + these 10:

| Address | Postal Code | Customer Name | Contact Number | Notes |
|---------|-------------|---------------|-----------------|-------|
| 111 Serangoon Road | 210111 | Meera Singh | 6581234582 | Temple area |
| 222 Boon Lay Way | 609963 | Chen Wei | 6581234583 | Industrial |
| 333 West Coast Road | 127357 | Mary Johnson | 6581234584 | Coastal |
| 444 Kallang Avenue | 339412 | Ravi Pillai | 6581234585 | Sports complex |
| 555 Jurong East | 609725 | Lisa Zhang | 6581234586 | Mall |
| 666 Yishun Avenue | 760666 | Ahmad Khalid | 6581234587 | HDB |
| 777 Pasir Ris Street | 510777 | Jennifer Lau | 6581234588 | New town |
| 888 Woodlands Road | 738777 | Robert Wong | 6581234589 | North area |
| 999 Sentosa Island | 098988 | Patricia Lee | 6581234590 | Resort |
| 1010 Buona Vista Road | 118637 | Michael Tan | 6581234591 | Research area |

**How to use:**
1. Copy all 25 rows (15 + 10 above)
2. Save as `test-25-stops.xlsx`
3. Upload and optimize
4. Expect: 5 routes with ~5 stops each

---

## 🧪 API Testing Examples

### Test 1: Get Health Status

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-09-10T23:46:17.663Z"
}
```

---

### Test 2: Get All Drivers

```bash
curl http://localhost:3001/api/drivers
```

**Expected Response:**
```json
[
  {
    "id": "driver_1",
    "name": "Ahmad",
    "vehicleNumber": "SG001",
    "phoneNumber": "6581234561",
    "status": "active",
    "createdAt": "2026-09-10T19:35:20.000Z"
  },
  {
    "id": "driver_2",
    "name": "Bala",
    "vehicleNumber": "SG002",
    "phoneNumber": "6581234562",
    "status": "active",
    "createdAt": "2026-09-10T19:35:20.000Z"
  },
  ...
]
```

---

### Test 3: Import Excel File

```bash
# Create a test Excel file first
curl -X POST http://localhost:3001/api/import/excel \
  -F "file=@test-5-stops.xlsx"
```

**Expected Response:**
```json
{
  "jobId": "import_1789055909721",
  "message": "File imported successfully",
  "stopsCount": 5
}
```

---

### Test 4: Optimize Routes

```bash
curl -X POST http://localhost:3001/api/optimization/optimize
```

**Expected Response:**
```json
{
  "routes": [
    {
      "id": "route_1",
      "driverId": "driver_1",
      "status": "pending",
      "stops": ["stop_1", "stop_2", "stop_3"],
      "totalDistance": 4.5,
      "estimatedDuration": 45,
      "createdAt": "2026-09-10T23:46:18.000Z"
    },
    ...
  ],
  "totalStops": 5,
  "averageStopsPerRoute": 1,
  "totalDistance": 20.17
}
```

---

### Test 5: Get All Routes

```bash
curl http://localhost:3001/api/optimization/routes
```

**Expected Response:**
```json
[
  {
    "id": "route_1",
    "driverId": "driver_1",
    "status": "pending",
    "stops": ["stop_1"],
    "totalDistance": 0,
    "estimatedDuration": 100
  },
  ...
]
```

---

### Test 6: Update Route Status

```bash
curl -X PATCH http://localhost:3001/api/routes/route_1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

**Expected Response:**
```json
{
  "id": "route_1",
  "driverId": "driver_1",
  "status": "in-progress",
  "stops": ["stop_1"],
  "totalDistance": 0,
  "estimatedDuration": 100,
  "updatedAt": "2026-09-10T23:47:00.000Z"
}
```

---

### Test 7: Add Proof of Delivery

```bash
curl -X POST http://localhost:3001/api/routes/route_1/proof \
  -H "Content-Type: application/json" \
  -d '{
    "stopId": "stop_1",
    "imageUrl": "https://example.com/delivery.jpg",
    "signatureUrl": "https://example.com/signature.jpg",
    "notes": "Left with receptionist"
  }'
```

**Expected Response:**
```json
{
  "id": "proof_1789055909722",
  "stopId": "stop_1",
  "routeId": "route_1",
  "timestamp": "2026-09-10T23:47:30.000Z",
  "imageUrl": "https://example.com/delivery.jpg",
  "signatureUrl": "https://example.com/signature.jpg",
  "notes": "Left with receptionist"
}
```

---

### Test 8: Get Proof of Delivery

```bash
curl http://localhost:3001/api/routes/route_1/proofs
```

**Expected Response:**
```json
[
  {
    "id": "proof_1789055909722",
    "stopId": "stop_1",
    "routeId": "route_1",
    "timestamp": "2026-09-10T23:47:30.000Z",
    "imageUrl": "https://example.com/delivery.jpg",
    "signatureUrl": "https://example.com/signature.jpg",
    "notes": "Left with receptionist"
  }
]
```

---

## 📱 Browser UI Testing

### Test Sequence:

1. **Open http://localhost:5173**
   - Verify all 4 tabs load
   - Check responsive design

2. **Tab 1: Import Deliveries**
   - Upload `test-5-stops.xlsx`
   - Verify success message
   - Check import count = 5

3. **Tab 2: Optimize Routes**
   - Click "Optimize Routes" button
   - Verify results show:
     - Total Stops: 5
     - Routes Created: 5
     - Average: 1 stop/route
     - Distance: calculated

4. **Tab 3: View Routes**
   - See all 5 routes
   - Click route to expand
   - Verify driver info shows
   - Click status dropdown, change status
   - See update reflected

5. **Tab 4: Drivers**
   - See all 5 drivers:
     - Ahmad (SG001)
     - Bala (SG002)
     - Chen (SG003)
     - David (SG004)
     - Ethan (SG005)
   - Verify contact info
   - Check assigned routes count

---

## ✅ Test Checklist

- [ ] Small test (5 stops) works
- [ ] Medium test (15 stops) works
- [ ] Large test (25 stops) works
- [ ] Health endpoint responds
- [ ] Drivers endpoint returns 5 drivers
- [ ] Import endpoint creates job
- [ ] Optimize endpoint creates routes
- [ ] Get routes endpoint lists all routes
- [ ] Update status endpoint works
- [ ] Proof endpoint stores data
- [ ] Frontend imports successfully
- [ ] Frontend optimizes routes
- [ ] Frontend displays results
- [ ] Frontend updates statuses
- [ ] All data persists in Supabase

---

## 🎯 Expected Results

### For 5 Stops:
- Routes: 5
- Stops per route: 1
- Distance: ~0 km (mock coordinates)
- Time: ~100 mins per route

### For 15 Stops:
- Routes: 5
- Stops per route: ~3
- Distance: ~20 km
- Time: ~45 mins per route

### For 25 Stops:
- Routes: 5
- Stops per route: ~5
- Distance: ~50 km
- Time: ~90 mins per route

---

## 💾 Sample Data Creation Script

Create Excel files automatically:

```bash
# Run data generator (if available)
node scripts/generate-sample-data.js

# Creates in /samples:
# - sample-deliveries.xlsx
# - sample-data.json
# - sample-data.csv
```

---

## 🚀 Ready to Test!

1. Download sample Excel files from `samples/` folder
2. Or create your own with above data
3. Upload via browser UI
4. Click "Optimize Routes"
5. Watch magic happen! ✨

---

Generated: September 10, 2026  
Status: ✅ Ready for Testing
