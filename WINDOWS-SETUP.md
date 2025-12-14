# 🎯 Windows Quick Start Guide

## Prerequisites
1. **Node.js** (v16 or later) from [nodejs.org](https://nodejs.org)
2. **MongoDB** - Choose one option:
   - MSI Installer from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Chocolatey: `choco install mongodb`
   - Scoop: `scoop install mongodb`

## Installation

### 1. Clone and Install
```cmd
git clone https://github.com/Danielomix/mikrouslugi.git
cd mikrouslugi
npm run install-all
```

### 2. Start MongoDB
```cmd
REM If installed as service:
net start MongoDB

REM If manual installation:
mongod --dbpath C:\data\db
```

### 3. Run the System

#### Option A: Command Prompt (Recommended)
```cmd
start-windows.bat
```

#### Option B: PowerShell
```powershell
# If needed, set execution policy first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then start:
.\start-windows.ps1
```

## Access Points
- 🌐 **Frontend**: http://localhost:3003
- 🚪 **API Gateway**: http://localhost:3000
- 📖 **API Docs**: http://localhost:3000/api-docs

## Test Login
- **Email**: `test@example.com`
- **Password**: `password123`

## Troubleshooting

### Port Issues
```cmd
REM Check what's using ports:
netstat -an | findstr :3000
netstat -an | findstr :3001

REM Kill processes:
taskkill /F /PID <process-id>
```

### MongoDB Issues
```cmd
REM Check MongoDB service:
sc query MongoDB

REM Restart MongoDB service:
net stop MongoDB
net start MongoDB
```

### PowerShell Issues
```powershell
# Check current execution policy:
Get-ExecutionPolicy

# Set execution policy for current user:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Complete Architecture
The system runs 9 services:
- Auth Service (Port 3001)
- Product Service (Port 3002)  
- Order Service (Port 3004)
- Payment Service (Port 3005)
- Notification Service (Port 3006)
- Inventory Service (Port 3007)
- Analytics Service (Port 3008)
- API Gateway (Port 3000)
- React Frontend (Port 3003)

For detailed documentation, see `docs/` folder or visit the main README.md