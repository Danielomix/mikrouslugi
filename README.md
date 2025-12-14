# 🚀 Mikrousługi E-commerce z Automatyzacją

Zaawansowany system e-commerce oparty na mikrousługach z pełną automatyzacją procesów biznesowych.

## ✨ Główne funkcje

### 🤖 **Kompletna Automatyzacja Workflow**
- **Płatność → Status zamówienia**: Automatyczna zmiana na "processing" po successful payment
- **Dostarczenie → Aktualizacja magazynu**: Automatyczne zmniejszenie stock i usunięcie rezerwacji
- **Zarządzanie inventory**: Automatyczne tworzenie pozycji magazynowych dla nowych produktów

### 🎯 **Workflow E-commerce**
1. **Dodanie produktu** → Automatyczne tworzenie rekordu w magazynie
2. **Składanie zamówienia** → Automatyczna rezerwacja produktów
3. **Płatność** → Automatyczna zmiana statusu zamówienia na "processing"
4. **Dostarczenie** → Automatyczna aktualizacja stock i usunięcie rezerwacji

## 🏗️ Architektura

### **Backend Stack**
- **Node.js + Express.js** - REST API dla każdego serwisu
- **MongoDB** - Dedykowana baza danych per serwis
- **JWT Authentication** - Bezpieczna autoryzacja z bcrypt
- **Axios** - Komunikacja między serwisami
- **Express Gateway** - Centralne API Gateway

### **Frontend Stack**
- **React 18** - Nowoczesny UI
- **Material-UI** - Komponentowa biblioteka UI
- **Responsive Design** - Działanie na wszystkich urządzeniach

## 🗂️ Serwisy

| Serwis | Port | Baza Danych | Funkcjonalność |
|--------|------|-------------|----------------|
| **Auth Service** | 3001 | `mikrouslugi` | Zarządzanie użytkownikami, JWT tokens |
| **Product Service** | 3002 | `mikrouslugi` | Katalog produktów, system kategorii |
| **Order Service** | 3004 | `mikrouslugi_orders` | Zamówienia, automatyzacja statusów |
| **Payment Service** | 3005 | `mikrouslugi_payments` | Płatności, auto-processing |
| **Notification Service** | 3006 | `mikrouslugi_notifications` | Email/SMS notifications |
| **Inventory Service** | 3007 | `mikrouslugi_inventory` | Magazyn, rezerwacje, delivery |
| **Analytics Service** | 3008 | `mikrouslugi_analytics` | Raporty, statystyki |
| **API Gateway** | 3000 | - | Routing, dokumentacja |
| **Frontend** | 3003 | - | React SPA |

## 🚀 Quick Start

### **1. Klonowanie i instalacja**
```bash
git clone <repository-url>
cd mikrouslugi
npm run install-all
```

### **2. Uruchomienie systemu**
```bash
# Uruchomienie wszystkich 9 serwisów
./start-local.sh

# Zatrzymanie systemu
./stop-local.sh
```

### **3. Dostęp do aplikacji**
- 🌐 **Frontend**: http://localhost:3003
- 🚪 **API Gateway**: http://localhost:3000  
- 📖 **Dokumentacja**: http://localhost:3000/api-docs

## 👤 Logowanie

**Domyślne konto administratora:**
- **Email**: `test@example.com`
- **Hasło**: `password123`
- **Rola**: `admin`

## 🧪 Testowanie Automatyzacji

### **Test 1: Dodanie produktu**
```bash
# Produkt automatycznie tworzy rekord w magazynie
curl -X POST "http://localhost:3000/api/products" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "price": 1000, "stock": 10}'
```

### **Test 2: Pełny workflow zamówienia**
```bash
# 1. Utwórz zamówienie (status: pending)
ORDER_ID="<order-id>"

# 2. Utwórz płatność (status: pending) 
PAYMENT_ID="<payment-id>"

# 3. Procesuj płatność → Automatycznie zmienia zamówienie na "processing"
curl -X POST "http://localhost:3000/api/payments/$PAYMENT_ID/process"

# 4. Dostarcz zamówienie → Automatycznie aktualizuje magazyn i stock
curl -X PUT "http://localhost:3000/api/orders/$ORDER_ID/system-status" \
  -d '{"status": "delivered"}'
```

### **Test 3: Sprawdzenie automatyzacji**
```bash
# Przed testem: Product Stock: 5, Inventory: 5
# Po zamówieniu 2 sztuk i dostarczeniu:
# Product Stock: 3, Inventory: 3 (automatycznie zaktualizowane)
```

## 📊 Monitoring

### **Logi serwisów:**
```bash
# Auth Service
tail -f /tmp/auth-service.log

# Order Service  
tail -f /tmp/order-service.log

# Payment Service
tail -f /tmp/payment-service.log

# Wszystkie inne serwisy
tail -f /tmp/<service-name>.log
```

### **Health Check:**
```bash
# Sprawdź status wszystkich serwisów
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Product
curl http://localhost:3004/health  # Order
curl http://localhost:3005/health  # Payment
curl http://localhost:3006/health  # Notification
curl http://localhost:3007/health  # Inventory
curl http://localhost:3008/health  # Analytics
```

## 🛠️ Narzędzia Development

### **Database Management**
```bash
# Wyczyszczenie wszystkich baz (zachowuje admin user)
mongosh < scripts/clean-all-databases.mongodb

# Sprawdzenie stanu baz danych
mongosh mikrouslugi
mongosh mikrouslugi_orders
mongosh mikrouslugi_payments
mongosh mikrouslugi_inventory
mongosh mikrouslugi_notifications
mongosh mikrouslugi_analytics
```

### **API Testing**
```bash
# Logowanie i pobranie tokenu
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | \
  jq -r '.token')

# Test endpointów
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/products
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/orders
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/payments
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/inventory
```

## 🔧 Konfiguracja

### **Environment Variables**
Każdy serwis ma plik `.env` z konfiguracją:
- `MONGODB_URI` - URL bazy danych
- `JWT_SECRET` - Klucz do tokenów JWT
- `PORT` - Port serwisu
- `*_SERVICE_URL` - URLe innych serwisów

### **Bazy danych**
- `mikrouslugi` - Auth, Products, główne dane
- `mikrouslugi_orders` - Zamówienia
- `mikrouslugi_payments` - Płatności
- `mikrouslugi_inventory` - Magazyn
- `mikrouslugi_notifications` - Powiadomienia
- `mikrouslugi_analytics` - Analityka

## 🎯 Funkcjonalności

### **Frontend Features**
- ✅ Dashboard z statystykami
- ✅ Zarządzanie produktami (CRUD)
- ✅ Lista zamówień z filtrami
- ✅ System płatności z auto-processing
- ✅ Zarządzanie magazynem
- ✅ Responsive design
- ✅ Real-time updates

### **Backend Features**  
- ✅ Mikrousługowa architektura
- ✅ Auto-scaling ready
- ✅ JWT Authentication
- ✅ Input validation
- ✅ Error handling
- ✅ API documentation (Swagger)
- ✅ Health checks
- ✅ Centralized logging

### **Automatyzacja**
- ✅ Auto payment processing (2s delay simulation)
- ✅ Auto order status updates
- ✅ Auto inventory management
- ✅ Auto product stock updates
- ✅ Inter-service communication
- ✅ System endpoints dla automatyzacji

## 📚 Dokumentacja API

Każdy serwis ma dokumentację Swagger dostępną pod:
- **Auth Service**: http://localhost:3001/api-docs
- **Product Service**: http://localhost:3002/api-docs
- **Order Service**: http://localhost:3004/api-docs
- **Payment Service**: http://localhost:3005/api-docs
- **Notification Service**: http://localhost:3006/api-docs
- **Inventory Service**: http://localhost:3007/api-docs
- **Analytics Service**: http://localhost:3008/api-docs
- **API Gateway**: http://localhost:3000/api-docs

## 🔒 Bezpieczeństwo

- **JWT Tokens** - Secure authentication
- **bcrypt** - Password hashing
- **Input Validation** - Express-validator
- **CORS** - Controlled cross-origin access
- **Helmet** - Security headers
- **Rate Limiting** - Ochrona przed atakami
- **System Endpoints** - Dedykowane endpointy dla automatyzacji

## 📈 Skalowanie

System zaprojektowany z myślą o skalowalności:
- **Mikrousługi** - Niezależne deployment
- **Database per Service** - Izolacja danych
- **Stateless Services** - Horizontal scaling ready
- **API Gateway** - Load balancing ready
- **Docker Ready** - Konteneryzacja gotowa
- **Cloud Native** - Gotowe na chmurę

## 🚨 Troubleshooting

### **Problemy z uruchomieniem**
```bash
# Sprawdź czy MongoDB działa
mongosh --eval "db.runCommand('ping')"

# Sprawdź dostępność portów
lsof -i :3000-3008

# Restart systemu
./stop-local.sh && ./start-local.sh
```

### **Problemy z autoryzacją**
```bash
# Sprawdź token
echo $TOKEN | cut -c 1-50

# Odnów token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | \
  jq -r '.token')
```

## 🎉 Demo Workflow

**Kompletny test systemu:**

1. **Uruchom system**: `./start-local.sh`
2. **Zaloguj się**: http://localhost:3003
3. **Dodaj produkt**: Automatycznie tworzy rekord w magazynie
4. **Utwórz zamówienie**: Produkty są rezerwowane
5. **Procesuj płatność**: Status zamówienia zmienia się automatycznie
6. **Dostarcz zamówienie**: Stock i magazyn aktualizują się automatycznie

**System automatycznie zarządza całym cyklem życia zamówienia!**

---

**🎯 Gotowy do production system e-commerce z pełną automatyzacją procesów biznesowych!**

**Utworzony przez**: Mikrousługi Development Team  
**Data**: Grudzień 2025  
**Wersja**: 2.0 (z automatyzacją)