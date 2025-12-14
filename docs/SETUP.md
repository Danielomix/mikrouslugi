# 🚀 Instrukcja Uruchomienia Mikrousług

## Wymagania Systemowe
- **Node.js 18+** (wymagany do wszystkich serwisów)
- **MongoDB Community Edition** (baza danych)
- **Git** do klonowania repozytorium
- **Docker** i **Docker Compose** (opcjonalne - dla konteneryzacji)
- **npm** lub **yarn** (package manager)

## 📥 Instalacja MongoDB

### macOS (Homebrew)
```bash
# Instalacja MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Uruchomienie MongoDB
brew services start mongodb/brew/mongodb-community

# Weryfikacja
mongo --eval "db.stats()"
```

### Ubuntu/Debian
```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create source list
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Windows
Pobierz MongoDB Community Server z [oficjalnej strony](https://www.mongodb.com/try/download/community) i zainstaluj.

## 🛠️ Szybkie Uruchomienie (REKOMENDOWANE)

### 1. Klonowanie i przygotowanie projektu
```bash
# Klonuj repozytorium
### 3. Konfiguracja zmiennych środowiskowych

Utwórz pliki `.env` w każdym serwisie:

**services/auth-service/.env**
```bash
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mikrouslugi
JWT_SECRET=mikro-uslugi-super-secret-key-2025
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
```

**services/product-service/.env**
```bash
NODE_ENV=development
PORT=3002
MONGODB_URI=mongodb://localhost:27017/mikrouslugi
JWT_SECRET=mikro-uslugi-super-secret-key-2025
AUTH_SERVICE_URL=http://localhost:3001
INVENTORY_SERVICE_URL=http://localhost:3007
```

**services/order-service/.env**
```bash
NODE_ENV=development
PORT=3004
MONGODB_URI=mongodb://localhost:27017/mikrouslugi_orders
JWT_SECRET=mikro-uslugi-super-secret-key-2025
AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
INVENTORY_SERVICE_URL=http://localhost:3007
PAYMENT_SERVICE_URL=http://localhost:3005
```

**services/payment-service/.env**
```bash
NODE_ENV=development
PORT=3005
MONGODB_URI=mongodb://localhost:27017/mikrouslugi_payments
JWT_SECRET=mikro-uslugi-super-secret-key-2025
ORDER_SERVICE_URL=http://localhost:3000/api
PROCESSING_DELAY=2000
```

**services/notification-service/.env**
```bash
NODE_ENV=development
PORT=3006
MONGODB_URI=mongodb://localhost:27017/mikrouslugi_notifications
JWT_SECRET=mikro-uslugi-super-secret-key-2025
EMAIL_PROVIDER=gmail
EMAIL_FROM=noreply@mikrouslugi.com
```

**services/inventory-service/.env**
```bash
NODE_ENV=development
PORT=3007
MONGODB_URI=mongodb://localhost:27017/mikrouslugi_inventory
JWT_SECRET=mikro-uslugi-super-secret-key-2025
DEFAULT_THRESHOLD=5
RESERVATION_EXPIRY=30
```

**services/analytics-service/.env**
```bash
NODE_ENV=development
PORT=3008
MONGODB_URI=mongodb://localhost:27017/mikrouslugi_analytics
JWT_SECRET=mikro-uslugi-super-secret-key-2025
AUTH_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3000/api
```

**api-gateway/.env**
```bash
NODE_ENV=development
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3006
INVENTORY_SERVICE_URL=http://localhost:3007
ANALYTICS_SERVICE_URL=http://localhost:3008
```

**frontend/.env**
```bash
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_NODE_ENV=development
```

### 4. Uruchomienie systemu

#### Opcja A: Uruchomienie lokalne (ZALECANE dla developmentu)
```bash
# MongoDB musi być uruchomiony!
# Sprawdź: mongo --eval "db.stats()"

# Uruchom wszystkie serwisy w osobnych terminalach:

# Terminal 1 - Auth Service
cd services/auth-service && npm run dev

# Terminal 2 - Product Service  
cd services/product-service && npm run dev

# Terminal 3 - Order Service
cd services/order-service && npm run dev

# Terminal 4 - Payment Service
cd services/payment-service && npm run dev

# Terminal 5 - Notification Service
cd services/notification-service && npm run dev

# Terminal 6 - Inventory Service
cd services/inventory-service && npm run dev

# Terminal 7 - Analytics Service  
cd services/analytics-service && npm run dev

# Terminal 8 - API Gateway
cd api-gateway && npm run dev

# Terminal 9 - Frontend
cd frontend && npm start
```

#### Opcja B: Docker Compose
```bash
# Kompletne uruchomienie w kontenerach
docker-compose up --build

# Uruchomienie w tle
docker-compose up -d --build

# Zatrzymanie
docker-compose down

# Zatrzymanie z usunięciem volumes
docker-compose down -v
```

### 5. Weryfikacja działania

**Sprawdź wszystkie serwisy:**
```bash
# Health check API Gateway (sprawdza wszystkie serwisy)
curl http://localhost:3000/health

# Sprawdzenie poszczególnych serwisów
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Product Service  
curl http://localhost:3004/health  # Order Service
curl http://localhost:3005/health  # Payment Service
curl http://localhost:3006/health  # Notification Service
curl http://localhost:3007/health  # Inventory Service
curl http://localhost:3008/health  # Analytics Service

# Frontend
curl http://localhost:3003
```

**Sprawdź bazy danych:**
```bash
# Połącz się z MongoDB
mongo

# Sprawdź bazy danych
show dbs

# Powinny być widoczne:
# mikrouslugi (auth + products)
# mikrouslugi_orders  
# mikrouslugi_payments
# mikrouslugi_inventory
# mikrouslugi_notifications
# mikrouslugi_analytics
```

## 🧪 Inicjalizacja i Testowanie Systemu

### 1. Utworzenie użytkownika administracyjnego
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com", 
    "password": "admin123456",
    "role": "admin"
  }'

# Zaloguj się i otrzymaj token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }'

# Zapisz token do zmiennej
export TOKEN="your_jwt_token_here"
```

### 2. Utworzenie przykładowych produktów
```bash
# Dodaj pierwszy produkt
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tesla Model 3",
    "description": "Electric sedan with autopilot",
    "price": 45000,
    "category": "automotive", 
    "stock": 5,
    "sku": "TESLA-MODEL3"
  }'

# Dodaj drugi produkt
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Latest Apple smartphone",
    "price": 1200,
    "category": "electronics",
    "stock": 10, 
    "sku": "IPHONE-15-PRO"
  }'
```

### 3. Testowanie automatyzacji e-commerce

**Complete Flow Test:**
```bash
# 1. Utwórz użytkownika klienta
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "customer@example.com",
    "password": "customer123"
  }'

# 2. Zaloguj klienta i otrzymaj token
CUSTOMER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com", 
    "password": "customer123"
  }' | jq -r '.token')

# 3. Pobierz listę produktów
curl -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  http://localhost:3000/api/products

# 4. Sprawdź stan magazynu przed zamówieniem
curl -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  http://localhost:3000/api/inventory

# 5. Złóż zamówienie (automatycznie zarezerwuje produkty)
ORDER_ID=$(curl -s -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID_HERE",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "123 Test St",
      "city": "Test City", 
      "zipCode": "12345",
      "country": "Poland"
    }
  }' | jq -r '.order._id')

# 6. Utwórz płatność dla zamówienia
PAYMENT_ID=$(curl -s -X POST http://localhost:3000/api/payments \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "'$ORDER_ID'",
    "amount": 45000,
    "method": "card"
  }' | jq -r '.payment._id')

# 7. Procesuj płatność (automatycznie zmieni status zamówienia)
curl -X POST http://localhost:3000/api/payments/$PAYMENT_ID/process \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# 8. Sprawdź status zamówienia (powinien być 'processing')
curl -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  http://localhost:3000/api/orders/$ORDER_ID

# 9. Zmień status na 'delivered' (automatycznie zaktualizuje magazyn)
curl -X PUT http://localhost:3000/api/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'

# 10. Sprawdź końcowy stan magazynu (stock powinien być zmniejszony)
curl -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  http://localhost:3000/api/inventory
```

## 🌐 Dostępne Endpointy

### API Gateway (Port 3000)
- **Health Check**: `GET /health` - Status wszystkich serwisów
- **Documentation**: `GET /api-docs` - Swagger UI

### Authentication (przez Gateway)
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`  
- **Profile**: `GET /api/auth/profile`
- **Verify**: `POST /api/auth/verify`

### Products (przez Gateway)
- **List**: `GET /api/products`
- **Details**: `GET /api/products/:id`
- **Create**: `POST /api/products` (admin)
- **Update**: `PUT /api/products/:id` (admin)
- **Delete**: `DELETE /api/products/:id` (admin)

### Orders (przez Gateway)
- **List**: `GET /api/orders`
- **Details**: `GET /api/orders/:id`
- **Create**: `POST /api/orders`
- **Update Status**: `PUT /api/orders/:id/status`

### Payments (przez Gateway)
- **List**: `GET /api/payments`
- **Details**: `GET /api/payments/:id`
- **Create**: `POST /api/payments`
- **Process**: `POST /api/payments/:id/process`
- **Refund**: `POST /api/payments/:id/refund`

### Inventory (przez Gateway)
- **List**: `GET /api/inventory`
- **Product Stock**: `GET /api/inventory/product/:id`
- **Reserve**: `POST /api/inventory/reserve`
- **Release**: `POST /api/inventory/release`

### Notifications (przez Gateway)  
- **List**: `GET /api/notifications`
- **Send**: `POST /api/notifications/send`
- **Preferences**: `GET /api/preferences`

### Analytics (przez Gateway)
- **Dashboard**: `GET /api/analytics/dashboard`
- **Sales**: `GET /api/analytics/sales`
- **Performance**: `GET /api/analytics/performance`

### Frontend (Port 3003)
- **Main App**: `http://localhost:3003`
- **Admin Panel**: Dostępny po zalogowaniu jako admin
- **Customer Panel**: Dostępny po zalogowaniu jako user

## 🚨 Rozwiązywanie Problemów

### Problem z MongoDB
```bash
# Sprawdź czy MongoDB jest uruchomiony
brew services list | grep mongo

# Restart MongoDB
brew services restart mongodb/brew/mongodb-community

# Sprawdź logi MongoDB
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### Problem z portami
```bash
# Sprawdź co używa portów
lsof -i :3000  # API Gateway
lsof -i :3001  # Auth Service
lsof -i :3002  # Product Service
lsof -i :27017 # MongoDB

# Zabij proces na porcie
kill -9 $(lsof -ti :3000)
```

### Problem z zależnościami
```bash
# Usuń wszystkie node_modules i reinstaluj
find . -name "node_modules" -type d -exec rm -rf {} +
find . -name "package-lock.json" -delete  
npm run install-all
```

### Problem z JWT tokens
```bash
# Sprawdź czy wszystkie serwisy używają tego samego JWT_SECRET
grep -r "JWT_SECRET" services/*/. env

# Wszystkie muszą mieć ten sam klucz:
# JWT_SECRET=mikro-uslugi-super-secret-key-2025
```

## ✅ Checklist Uruchomienia

- [ ] MongoDB uruchomiony i dostępny
- [ ] Wszystkie serwisy mają pliki .env
- [ ] Zależności zainstalowane (`npm run install-all`)
- [ ] Wszystkie serwisy uruchomione i zdravy health check
- [ ] API Gateway odpowiada na porcie 3000  
- [ ] Frontend dostępny na porcie 3003
- [ ] Bazy danych utworzone (sprawdź `show dbs`)
- [ ] Testowy admin user utworzony
- [ ] Przykładowe produkty dodane
- [ ] Automation flow przetestowany
- [ ] Wszystkie endpointy działają prawidłowo

**System jest gotowy do użycia!** 🎉

Frontend: `http://localhost:3003`  
API Gateway: `http://localhost:3000`  
Swagger Docs: `http://localhost:3000/api-docs`
# Restart MongoDB
docker-compose restart mongodb

# Sprawdź logi MongoDB
docker-compose logs mongodb

# Wyczyszczenie volumes (USUWA DANE!)
docker-compose down -v
```

### Porty zajęte
Sprawdź czy porty 3000, 3001, 3002, 27017 nie są zajęte:
```bash
lsof -i :3000
lsof -i :3001
lsof -i :3002  
lsof -i :27017
```

## 📞 Wsparcie

W razie problemów sprawdź:
1. Logi serwisów: `docker-compose logs -f`
2. Health endpoints: http://localhost:3000/health
3. Dokumentację API: http://localhost:3000/api-docs