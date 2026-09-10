# ⚡ DRoute Quick Start (5 minutes)

Get DRoute running locally in under 5 minutes!

---

## 🚀 TL;DR (Copy-Paste)

```bash
# 1. Clone repo
git clone https://github.com/nithya2021/DRoute.git
cd DRoute

# 2. Install packages
npm install

# 3. Terminal 1 - Start backend
npm run dev --workspace=@droute/server
# Wait for: "Server running on port 3001"

# 4. Terminal 2 - Start frontend  
npm run dev --workspace=@droute/client
# Wait for: "http://localhost:5173"

# 5. Open browser
# http://localhost:5173
```

---

## ✅ Verify Everything Works

```bash
# Terminal 3 - Test API
curl http://localhost:3001/api/drivers | jq .

# Should show 5 drivers:
# [
#   {"id":"driver_1","name":"Ahmad",...},
#   {"id":"driver_2","name":"Bala",...},
#   ...
# ]
```

✨ **You're done!** Site is ready for testing.

---

## 📋 Next: Test the Workflow

### In Browser (http://localhost:5173):

1. **Import** tab → Upload Excel file
2. **Optimize** tab → Click "Optimize Routes"
3. **View Routes** tab → See 5 optimized routes
4. **Drivers** tab → See driver assignments

---

## 📊 Sample Test File

Use Excel with these columns:
```
Address | Postal Code | Customer Name | Contact Number
```

Example:
```
123 Marina Bay Street | 018953 | John Lim | 6581234567
456 East Coast Drive | 520098 | Sarah Tan | 6581234568
...
```

**Or download from:** `/samples/sample-deliveries.xlsx`

---

## 🎯 What Happens

```
You upload Excel
    ↓
15 delivery addresses imported
    ↓
System clusters into 5 geographic routes
    ↓
Assigns to 5 drivers (Ahmad, Bala, Chen, David, Ethan)
    ↓
~3 stops per driver
    ↓
All data saved in Supabase ✨
```

---

## 🆘 Stuck?

| Issue | Fix |
|-------|-----|
| "Server won't start" | Kill old process: `pkill -f tsx` |
| "Port in use" | Change port: `PORT=3002 npm run dev...` |
| "No drivers showing" | Check Supabase credentials in `.env` |
| "Import fails" | Verify Excel has 4 columns (Address, Postal Code, Name, Phone) |

---

## 📚 More Info

- **Full guide:** `LOCAL_DEPLOYMENT_GUIDE.md`
- **Test data:** `SAMPLE_TEST_DATA.md`
- **API docs:** `README.md`
- **Setup guide:** `SUPABASE_SETUP.md`

---

## 🎉 Success!

When you see all this:
- ✅ Backend running on http://localhost:3001
- ✅ Frontend running on http://localhost:5173
- ✅ 5 drivers in database
- ✅ Excel import works
- ✅ Routes optimize automatically
- ✅ All data in Supabase

**You have a fully working delivery route optimization system!** 🚀

---

Generated: September 10, 2026
