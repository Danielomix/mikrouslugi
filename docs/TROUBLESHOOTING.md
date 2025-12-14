# 🛠️ Rozwiązywanie Problemów - Mikrousługi E-commerce

## 🚨 Diagnoza Problemów

### **Ogólny Health Check**
```bash
# Sprawdź status wszystkich serwisów
curl http://localhost:3000/health

# Sprawdzenie poszczególnych serwisów
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Product Service
curl http://localhost:3004/health  # Order Service  
curl http://localhost:3005/health  # Payment Service
curl http://localhost:3006/health  # Notification Service
curl http://localhost:3007/health  # Inventory Service
curl http://localhost:3008/health  # Analytics Service

# Frontend dostępność
curl http://localhost:3003
```

### **MongoDB Connection Check**
```bash
# Sprawdź czy MongoDB jest uruchomiony
mongo --eval "db.stats()"

# Sprawdź bazy danych
mongo --eval "show dbs"

# Powinny być widoczne:
# mikrouslugi, mikrouslugi_orders, mikrouslugi_payments, 
# mikrouslugi_inventory, mikrouslugi_notifications, mikrouslugi_analytics
```

## 🔧 Problemy z Uruchomieniem

### **Problem: MongoDB nie startuje**
```bash
# macOS (Homebrew)
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# Windows (jako Service)
net start MongoDB

# Windows (manual start - jeśli nie zainstalowane jako service)
# Otwórz PowerShell jako Administrator
mongod --dbpath C:\data\db

# Sprawdź logi MongoDB
tail -f /var/log/mongodb/mongod.log  # Linux
tail -f /opt/homebrew/var/log/mongodb/mongo.log  # macOS
# Windows: sprawdź Event Viewer lub C:\Program Files\MongoDB\Server\6.0\log\
```

### **Problem: Port already in use (Windows-specific)**
```powershell
# PowerShell - sprawdź co używa portów
netstat -ano | findstr :3000  # API Gateway
netstat -ano | findstr :3001  # Auth Service
netstat -ano | findstr :3002  # Product Service
netstat -ano | findstr :3003  # Frontend
netstat -ano | findstr :27017 # MongoDB

# Zabij proces po PID (ostatnia kolumna)
taskkill /PID <PID_NUMBER> /F

# Zabij wszystkie procesy Node.js
taskkill /IM node.exe /F
```

### **Problem: Path separators (Windows)**
```powershell
# Windows używa backslash (\) zamiast forward slash (/)
# W PowerShell/CMD używaj:
cd services\auth-service
cd ..\product-service

# W Git Bash możesz używać Unix-style paths:
cd services/auth-service
cd ../product-service
tail -f /var/log/mongodb/mongod.log  # Linux
tail -f /opt/homebrew/var/log/mongodb/mongo.log  # macOS
```

### **Problem: Port already in use**
```bash
# Sprawdź co używa portów
lsof -i :3000  # API Gateway
lsof -i :3001  # Auth Service
lsof -i :3002  # Product Service
lsof -i :3003  # Frontend
lsof -i :3004  # Order Service
lsof -i :3005  # Payment Service
lsof -i :3006  # Notification Service
lsof -i :3007  # Inventory Service
lsof -i :3008  # Analytics Service
lsof -i :27017 # MongoDB

# Zabij proces na konkretnym porcie
kill -9 $(lsof -ti :3000)

# Zabij wszystkie Node.js procesy
killall node
```

### **Problem: Node.js/npm issues (Windows)**
```powershell
# Sprawdź wersje Node.js i npm
node --version  # Powinno być 18+
npm --version

# Jeśli problemy z permissions:
# Ustaw npm prefix (unikaj sudo na Windows)
npm config set prefix %APPDATA%\npm

# Jeśli problemy z maksymalną długością ścieżki:
# Włącz długie ścieżki w Windows 10/11
# Settings → Update & Security → For developers → Developer Mode

# Lub użyj Git Bash zamiast PowerShell/CMD
```

### **Problem: Docker Desktop (Windows)**
```bash
# Upewnij się że Docker Desktop jest uruchomiony
# Windows: kliknij ikonę Docker w system tray

# Sprawdź status
docker --version
docker-compose --version

# Uruchom projekt z Docker
docker-compose up --build

# Windows-specific Docker issues:
# 1. Włącz WSL 2 integration w Docker Desktop settings
# 2. Sprawdź czy masz włączone Hyper-V lub WSL 2
# 3. Restart Docker Desktop jeśli problemy z volume mounting
```

### **Problem: PowerShell Execution Policy**
```powershell
# Jeśli nie możesz uruchomić npm scripts:
# Sprawdź execution policy
Get-ExecutionPolicy

# Ustaw execution policy (jako Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Lub uruchom konkretny skrypt z bypass
PowerShell -ExecutionPolicy Bypass -File .\start-script.ps1
```
```bash
# Wyczyść wszystkie node_modules
find . -name "node_modules" -type d -exec rm -rf {} +
find . -name "package-lock.json" -delete

# Reinstaluj wszystko
npm run install-all

# Dla konkretnego serwisu
cd services/auth-service
rm -rf node_modules package-lock.json
npm install
```

## � Problemy z Autentykacją

### **Problem: JWT Token Invalid**
```bash
# Sprawdź czy wszystkie serwisy używają tego samego JWT_SECRET
grep -r "JWT_SECRET" services/*/.env api-gateway/.env

# Wszystkie muszą mieć identyczny klucz:
JWT_SECRET=mikro-uslugi-super-secret-key-2025

# Usuń stare tokeny z frontend
# Otwórz browser dev tools → Application → Local Storage → Clear
```

### **Problem: Login fails with 401**
```bash
# Test direct auth service
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123456"}'

# Test przez API Gateway
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123456"}'
```

### **Problem: No admin user exists**
```bash
# Utwórz admin user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123456",
    "role": "admin"
  }'
```

## 🛒 Problemy z Automatyzacją E-commerce

### **Problem: Payment nie aktualizuje Order status**
```bash
# Sprawdź logi Payment Service
tail -f logs/payment-service.log

# Test manual payment processing
PAYMENT_ID="your_payment_id"
curl -X POST http://localhost:3005/payments/$PAYMENT_ID/process \
  -H "Authorization: Bearer $TOKEN"

# Sprawdź czy Order Service otrzymał aktualizację
tail -f logs/order-service.log | grep "system-status"
```

### **Problem: Order delivery nie aktualizuje Inventory**
```bash
# Test manual delivery endpoint
ORDER_ID="your_order_id"
curl -X PUT http://localhost:3004/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'

# Sprawdź logi Inventory Service
tail -f logs/inventory-service.log | grep "delivery"

# Sprawdź logi Product Service  
tail -f logs/product-service.log | grep "system-stock"
```

### **Problem: Stock nie zmniejsza się po dostawie**
```bash
# Sprawdź stan magazynu przed
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3007/inventory/product/PRODUCT_ID

# Sprawdź system endpoint Product Service
curl -X POST http://localhost:3002/products/system-stock \
  -H "Content-Type: application/json" \
  -d '{"productId": "PRODUCT_ID", "quantity": 1}'

# Sprawdź stan magazynu po
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3007/inventory/product/PRODUCT_ID
```

## 🌐 Problemy z Frontend

### **Problem: Frontend nie łączy się z API**
```bash
# Sprawdź konfigurację API URL
cat frontend/.env
# Powinno być: REACT_APP_API_URL=http://localhost:3000/api

# Test API connectivity
curl http://localhost:3000/api/products

# Sprawdź CORS settings w API Gateway
# Powinno pozwalać na http://localhost:3003
```

### **Problem: 404 na React routes**
```bash
# Sprawdź czy development server działa
cd frontend
npm start

# Sprawdź czy build jest prawidłowy
npm run build
npx serve -s build -l 3003
```

### **Problem: Payment Dialog nie działa**
```bash
# Sprawdź czy wszystkie payment endpoints działają
curl -H "Authorization: Bearer $TOKEN" http://localhost:3005/payments
curl -H "Authorization: Bearer $TOKEN" http://localhost:3004/orders

# Sprawdź console errors w browser dev tools
# Otwórz F12 → Console → Look for errors
```

## 🗄️ Problemy z Bazą Danych

### **Problem: Collections nie są tworzone**
```bash
# Połącz się z MongoDB
mongo

# Sprawdź bazy danych
show dbs

# Przełącz na konkretną bazę i sprawdź kolekcje
use mikrouslugi
show collections

use mikrouslugi_orders
show collections

use mikrouslugi_payments  
show collections
```

### **Problem: Database cleanup nie działa**
```bash
# Manual cleanup preserving admin user
mongo mikrouslugi --eval '
  db.users.deleteMany({email: {$ne: "admin@example.com"}});
  print("Deleted non-admin users");
'

# Cleanup orders, payments, inventory
mongo mikrouslugi_orders --eval 'db.orders.deleteMany({})'
mongo mikrouslugi_payments --eval 'db.payments.deleteMany({})'
mongo mikrouslugi_inventory --eval 'db.inventories.deleteMany({})'
mongo mikrouslugi_inventory --eval 'db.reservations.deleteMany({})'
```

## 🔄 Problemy z Inter-Service Communication

### **Problem: Services cannot reach each other**
```bash
# Test direct service calls
curl http://localhost:3001/auth/verify \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3002/products

# Test API Gateway routing
curl http://localhost:3000/api/products
curl http://localhost:3000/api/orders

# Sprawdź environment variables
grep -r "SERVICE_URL" api-gateway/.env services/*/.env
```

### **Problem: System endpoints return 401**
```bash
# System endpoints should NOT require authentication
# Test direct system calls

curl -X POST http://localhost:3004/orders/ORDER_ID/system-status \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'

curl -X POST http://localhost:3007/inventory/delivery \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_ID", "productId": "PRODUCT_ID", "quantity": 1}'
```

## 🆘 Emergency Recovery

### **Complete System Reset**
```bash
# Nuclear option - reset everything
killall node
brew services restart mongodb/brew/mongodb-community

# Clean everything
find . -name "node_modules" -type d -exec rm -rf {} +
find . -name "package-lock.json" -delete
rm -rf logs/*

# Database reset
mongo --eval 'db.dropDatabase()' mikrouslugi
mongo --eval 'db.dropDatabase()' mikrouslugi_orders  
mongo --eval 'db.dropDatabase()' mikrouslugi_payments
mongo --eval 'db.dropDatabase()' mikrouslugi_inventory
mongo --eval 'db.dropDatabase()' mikrouslugi_notifications
mongo --eval 'db.dropDatabase()' mikrouslugi_analytics

# Reinstall and restart
npm run install-all
# Manual restart wszystkich serwisów
```

### **Debug Checklist**
1. [ ] **MongoDB running**: `mongo --eval "db.stats()"`
2. [ ] **All services healthy**: `curl http://localhost:3000/health`
3. [ ] **Frontend accessible**: `curl http://localhost:3003`
4. [ ] **Admin user exists**: Login test
5. [ ] **Environment variables**: All .env files configured
6. [ ] **No port conflicts**: `lsof -i :3000-3008`
7. [ ] **Automation working**: End-to-end payment test

---

**System is designed to be resilient - most issues are environment/configuration related!**
cd gateway && npm install
cd frontend && npm install
```

## 🔧 Architektura - Co działa

### ✅ Działające rozwiązania:
- **API Gateway**: `simple-gateway.js` - Express + Axios
- **Uruchomienie**: `start-local.sh` - bash scripts
- **Frontend**: React + Material-UI + JWT auth
- **Backend**: Node.js + Express + MongoDB

### ❌ Problematyczne (usunięte):
- `http-proxy-middleware` - timeouty i błędy 304
- Złożone proxy configurations
- nodemon w gateway (niepotrzebne)

## 📊 Status Funkcji

| Funkcja | Status | Notatki |
|---------|--------|---------|
| Rejestracja użytkowników | ✅ Działa | JWT + bcrypt |
| Logowanie | ✅ Działa | Token handling |
| Dashboard | ✅ Działa | Statystyki produktów |
| Lista produktów | ✅ Działa | Paginacja + filtrowanie |
| Wyszukiwanie | ✅ Działa | Nazwa, opis, SKU |
| Filtrowanie | ✅ Działa | Kategoria, cena |
| Dodawanie produktów | ✅ Działa | Walidacja SKU |
| Edycja produktów | ✅ Działa | Full CRUD |
| Usuwanie produktów | ✅ Działa | Confirmation dialog |
| API Gateway proxy | ✅ Działa | simple-gateway.js |

## 🚀 Najlepsze Praktyki

1. **Zawsze używaj `start-local.sh`** - najbardziej niezawodne
2. **Sprawdzaj logi** w `/tmp/` jeśli problemy
3. **Testuj API bezpośrednio** - `curl` commands w README
4. **Frontend błędy** - sprawdź console przeglądarki (F12)
5. **Port conflicts** - używaj `./stop-local.sh` przed restart