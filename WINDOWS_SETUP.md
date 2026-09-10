# 🪟 DRoute Windows Setup & Commands

Complete setup guide for Windows users.

---

## ❌ Issue You're Getting

```
npm error No workspaces found:
npm error   --workspace=@droute/server
```

**Cause**: Windows might have issues with the workspace syntax. The `--workspace` flag requires npm v7+.

**Solution**: Use alternative methods below.

---

## ✅ Method 1: Direct cd Navigation (Recommended)

### **Start Backend (Terminal 1):**

```cmd
cd packages\server
npm run dev

# Expected output:
# > @droute/server@1.0.0 dev
# > tsx watch src/index.ts
# Server running on port 3001
```

### **Start Frontend (Terminal 2):**

```cmd
cd packages\client
npm run dev

# Expected output:
# VITE v5.4.21 ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

---

## ✅ Method 2: cd with slash (Windows PowerShell)

### **Start Backend:**

```powershell
cd packages/server
npm run dev
```

### **Start Frontend:**

```powershell
cd packages/client
npm run dev
```

---

## ✅ Method 3: Workspace with Quotes (Windows CMD)

### **Start Backend:**

```cmd
npm run dev -- --workspace="@droute/server"
```

### **Start Frontend:**

```cmd
npm run dev -- --workspace="@droute/client"
```

---

## ✅ Method 4: From Root Directory

### **Install dependencies (once):**

```cmd
npm install
```

### **Start Backend (new terminal):**

```cmd
npm -w @droute/server run dev

# Note: Using -w instead of --workspace
```

### **Start Frontend (new terminal):**

```cmd
npm -w @droute/client run dev
```

---

## 🎯 Complete Windows Setup Steps

### **Step 1: Clone & Navigate**

```cmd
git clone https://github.com/nithya2021/DRoute.git
cd DRoute
npm install
```

### **Step 2: Open 2 Terminals/PowerShells**

**Terminal 1 - Backend:**

```cmd
cd packages\server
npm run dev
```

Wait for: `Server running on port 3001`

**Terminal 2 - Frontend:**

```cmd
cd packages\client
npm run dev
```

Wait for: `http://localhost:5173`

### **Step 3: Open Browser**

```
http://localhost:5173
```

---

## 🧪 Testing on Windows

### **Test 1: Health Check**

```cmd
curl http://localhost:3001/health
```

**or use PowerShell:**

```powershell
Invoke-WebRequest http://localhost:3001/health | ConvertTo-Json
```

### **Test 2: Get Drivers**

```cmd
curl http://localhost:3001/api/drivers
```

**or PowerShell:**

```powershell
Invoke-WebRequest http://localhost:3001/api/drivers | ConvertTo-Json
```

### **Test 3: Run Test Scripts**

```cmd
# Node.js test script
node test-api.js

# PowerShell test script (if bash not available)
powershell -File test-api.ps1
```

---

## 🔧 Troubleshooting on Windows

### **Issue: "Command not found" for curl**

**Solution: Use PowerShell instead**

```powershell
# Instead of: curl http://localhost:3001/health
Invoke-WebRequest http://localhost:3001/health | ConvertTo-Json
```

### **Issue: Port 3001 already in use**

```cmd
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace 1234 with PID from above)
taskkill /PID 1234 /F

# Restart server
npm run dev
```

### **Issue: npm workspace not found**

**Try these in order:**

1. Check npm version: `npm --version` (should be 7+)
2. Use cd method instead: `cd packages\server && npm run dev`
3. Update npm: `npm install -g npm@latest`
4. Use -w flag: `npm -w @droute/server run dev`

### **Issue: Frontend won't start on 5173**

```cmd
# Try different port
set VITE_PORT=5174
npm run dev

# or

PORT=5174 npm run dev
```

### **Issue: Supabase connection error**

```cmd
# Verify .env exists
type .env

# Check SUPABASE_URL
echo %SUPABASE_URL%

# If empty, update .env manually
notepad .env
```

---

## 🪟 Windows-Specific Path Syntax

| Action | Windows | PowerShell |
|--------|---------|-----------|
| Change dir | `cd packages\server` | `cd packages/server` |
| Set env | `set VAR=value` | `$env:VAR="value"` |
| Run cmd | `npm run dev` | `npm run dev` |
| Kill process | `taskkill /PID xxx /F` | `Stop-Process -Id xxx -Force` |
| List processes | `tasklist` | `Get-Process` |

---

## 📦 Quick Windows Commands

```cmd
# Install all dependencies
npm install

# Navigate to server
cd packages\server

# Start server in development
npm run dev

# Build server
npm run build

# Navigate to client
cd packages\client

# Start client
npm run dev

# Build client
npm run build

# Run tests
node test-api.js

# Check port usage
netstat -ano | findstr :3001
```

---

## 🎯 Complete Windows Workflow

### **Step-by-Step:**

1. **Open CMD or PowerShell**

```cmd
cd DRoute
npm install
```

2. **Open Terminal 1:**

```cmd
cd packages\server
npm run dev
# Wait for: "Server running on port 3001"
```

3. **Open Terminal 2:**

```cmd
cd packages\client
npm run dev
# Wait for: "http://localhost:5173"
```

4. **Open Terminal 3:**

```cmd
# Test the API
node test-api.js
```

5. **Open Browser:**

```
http://localhost:5173
```

---

## ✅ Success Indicators on Windows

You know it's working when:

✅ Terminal 1 shows: `Server running on port 3001`  
✅ Terminal 2 shows: `http://localhost:5173`  
✅ Browser loads: http://localhost:5173 without errors  
✅ `curl http://localhost:3001/api/drivers` returns 5 drivers  
✅ Test script shows: All tests passed  

---

## 📋 Windows Environment Setup

### **Check Prerequisites:**

```cmd
# Check Node.js
node --version

# Check npm
npm --version

# Check git
git --version

# All should show versions (not "not found")
```

### **If npm workspace still fails:**

Update npm:

```cmd
npm install -g npm@latest
```

Check package.json:

```cmd
# Open in notepad
notepad package.json

# Should have "workspaces" defined
```

---

## 🚀 TL;DR For Windows

```cmd
# 1. Clone and install
git clone https://github.com/nithya2021/DRoute.git
cd DRoute
npm install

# 2. Terminal 1 - Backend
cd packages\server
npm run dev

# 3. Terminal 2 - Frontend
cd packages\client
npm run dev

# 4. Terminal 3 - Test
node test-api.js

# 5. Browser
http://localhost:5173
```

---

## 💡 Pro Tips for Windows

1. **Use PowerShell** if you're comfortable with it - better escape character handling

2. **Pin your terminals** - Dock them side by side for easier monitoring

3. **Use VS Code** - Built-in terminal makes this easier

4. **Watch the ports** - Make sure 3001 and 5173 are free

5. **Save these commands** in a batch file:

```batch
@echo off
start "Backend" cmd /k "cd packages\server && npm run dev"
start "Frontend" cmd /k "cd packages\client && npm run dev"
echo Servers started in separate windows
```

Save as `start-servers.bat` and double-click to start both!

---

## 🆘 Still Having Issues?

1. **Check npm version**: `npm --version` (need 7+)
2. **Check Node version**: `node --version` (need 18+)
3. **Delete node_modules**: `rmdir /s /q node_modules` and `npm install`
4. **Check .env**: `type .env` (verify Supabase credentials)
5. **Port conflicts**: `netstat -ano | findstr :3001`

---

**Generated**: September 10, 2026  
**Platform**: Windows (CMD/PowerShell)  
**Status**: ✅ Ready to Use
