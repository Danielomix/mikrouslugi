# 📦 Inventory Service

Serwis zarządzania magazynem z automatyczną obsługą stanów, rezerwacji i dostawy.

## 📋 Funkcjonalności

- **Zarządzanie magazynem** - Stany produktów w magazynie
- **System rezerwacji** - Automatyczne rezerwowanie produktów przy zamówieniach
- **Obsługa dostaw** - Automatyczne usuwanie rezerwacji i aktualizacja stanów
- **Monitoring stanów** - Tracking dostępności produktów
- **Integracja z zamówieniami** - Automatyczna synchronizacja
- **Alerty o niskich stanach** - Powiadomienia o brakach

## 🚀 Quick Start

```bash
# Instalacja zależności
npm install

# Uruchomienie serwisu
npm start

# Development mode
npm run dev
```

## 🌐 Endpoints

### **Chronione (wymagają JWT)**
- `GET /inventory` - Lista wszystkich pozycji magazynowych
- `GET /inventory/product/:productId` - Stan konkretnego produktu
- `POST /inventory/reserve` - Rezerwacja produktu
- `POST /inventory/release` - Zwolnienie rezerwacji

### **System endpoints (dla automatyzacji)**
- `POST /inventory/delivery` - Finalizacja dostawy (bez auth)

### **Administracja**
- `GET /health` - Health check serwisu

## 📊 Statusy magazynowe

**Stan produktu:**
- `available` - Dostępny (quantity > 0)
- `low_stock` - Niski stan (quantity < threshold)
- `out_of_stock` - Brak na stanie (quantity = 0)
- `discontinued` - Wycofany z oferty

**Stan rezerwacji:**
- `reserved` - Zarezerwowane dla zamówienia
- `released` - Zwolniona rezerwacja

## 🔄 Flow automatyzacji

### **1. Składanie zamówienia:**
```javascript
// Automatyczne rezerwowanie produktów
POST /inventory/reserve
{
  "orderId": "order_id",
  "productId": "product_id", 
  "quantity": 2
}
```

### **2. Zmiana statusu na 'delivered':**
```javascript
// Order Service automatycznie wywołuje
POST /inventory/delivery
{
  "orderId": "order_id",
  "productId": "product_id",
  "quantity": 2
}
```

### **3. Rezultat dostawy:**
- Usunięcie rezerwacji
- Zmniejszenie dostępnej ilości
- Aktualizacja statusu produktu

## 🗄️ Database Schema

**Inventory Model:**
```javascript
{
  productId: ObjectId,       // ID produktu (ref do Product Service)
  quantity: Number,          // Dostępna ilość
  reserved: Number,          // Ilość zarezerwowana
  threshold: Number,         // Próg alertu niskiego stanu
  status: String,            // Status magazynowy
  lastRestocked: Date,       // Ostatnie uzupełnienie
  createdAt: Date,
  updatedAt: Date
}
```

**Reservation Model:**
```javascript
{
  orderId: ObjectId,         // ID zamówienia
  productId: ObjectId,       // ID produktu
  quantity: Number,          // Ilość zarezerwowana
  status: String,            // Status rezerwacji
  expiresAt: Date,           // Wygaśnięcie rezerwacji
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Konfiguracja

### **Environment Variables** (`.env`)
```bash
NODE_ENV=development
PORT=3007
MONGODB_URI=mongodb://localhost:27017/mikrouslugi_inventory
JWT_SECRET=mikro-uslugi-super-secret-key-2025
DEFAULT_THRESHOLD=5
RESERVATION_EXPIRY=30
```

### **Konfiguracja progów**
```javascript
// Domyślne progi alertów
const DEFAULT_THRESHOLDS = {
  'electronics': 5,
  'clothing': 10,
  'books': 20,
  'food': 50
}
```

## 🔍 API Examples

### **Stan magazynu**
```bash
# Wszystkie produkty
curl -X GET http://localhost:3007/inventory \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Konkretny produkt
curl -X GET http://localhost:3007/inventory/product/<PRODUCT_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### **Rezerwacja produktu**
```bash
curl -X POST http://localhost:3007/inventory/reserve \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "676d2ef5e123456789abcdef",
    "productId": "676d1234567890abcdef1234",
    "quantity": 2
  }'
```

### **Finalizacja dostawy (system endpoint)**
```bash
curl -X POST http://localhost:3007/inventory/delivery \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "676d2ef5e123456789abcdef",
    "productId": "676d1234567890abcdef1234",
    "quantity": 2
  }'
```

### **Zwolnienie rezerwacji**
```bash
curl -X POST http://localhost:3007/inventory/release \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "676d2ef5e123456789abcdef",
    "productId": "676d1234567890abcdef1234"
  }'
```

## 💡 Features

### **Automatyczna inicjalizacja**
```javascript
// Tworzenie wpisu magazynowego przy dodaniu produktu
{
  "productId": "new_product_id",
  "quantity": 0,
  "reserved": 0,
  "threshold": 5,
  "status": "out_of_stock"
}
```

### **Inteligentne statusy**
```javascript
// Automatyczne określanie statusu
function updateStatus(quantity, threshold) {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'available';
}
```

### **System rezerwacji**
- **Auto-expiry** - Rezerwacje wygasają po 30 minutach
- **Cleanup job** - Automatyczne usuwanie wygasłych rezerwacji
- **Rollback** - Przywracanie stanów przy anulowaniu

### **Monitoring stanów**
- Tracking zmian ilości
- Alerty o niskich stanach
- Historia operacji magazynowych

## 🔄 Integration Points

### **Z Product Service**
- Inicjalizacja stanów przy nowych produktach
- Synchronizacja informacji o produktach

### **Z Order Service**
- Automatyczne rezerwacje przy zamówieniach
- Finalizacja dostaw przy zmianie statusu

### **Z Analytics Service**
- Raporty stanów magazynowych
- Analiza rotacji produktów

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3007/health
```

### **Stan magazynu**
```bash
# Produkty o niskim stanie
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3007/inventory?status=low_stock"

# Wszystkie rezerwacje
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3007/reservations
```

### **Metryki**
```bash
# Całkowita wartość magazynu
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3007/inventory/stats

# Top produkty
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3007/inventory/top-products
```

## 🚨 Error Handling

- `400` - Bad Request (nieprawidłowa ilość)
- `401` - Unauthorized (brak tokenu)
- `404` - Not Found (produkt nie istnieje)
- `409` - Conflict (niewystarczająca ilość)
- `422` - Unprocessable Entity (błędne dane)
- `500` - Internal Server Error

## 🔧 Troubleshooting

### **Problem z rezerwacją**
```bash
# Sprawdź stan produktu
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3007/inventory/product/<PRODUCT_ID>

# Sprawdź aktywne rezerwacje
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3007/reservations?productId=<PRODUCT_ID>
```

### **Problem z dostawą**
```bash
# Sprawdź czy rezerwacja istnieje
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3007/reservations?orderId=<ORDER_ID>

# Sprawdź logi serwisu
tail -f /tmp/inventory-service.log
```

### **Problem z automatyzacją**
```bash
# Sprawdź czy endpoint delivery działa
curl -X POST http://localhost:3007/inventory/delivery \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test","productId":"test","quantity":1}'

# Sprawdź logi Order Service
tail -f /tmp/order-service.log
```

## 📋 Workflow Example

**Complete automation flow:**

```bash
# 1. Sprawdź stan początkowy
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3007/inventory/product/<PRODUCT_ID>
# Przykład: quantity: 5, reserved: 0

# 2. Złóż zamówienie (automatyczna rezerwacja)
# quantity: 3, reserved: 2

# 3. Zmień status zamówienia na 'delivered'
curl -X PUT http://localhost:3000/api/orders/<ORDER_ID>/status \
  -d '{"status": "delivered"}'

# 4. Sprawdź stan końcowy
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3007/inventory/product/<PRODUCT_ID>
# Przykład: quantity: 3, reserved: 0 (automatycznie zaktualizowane)
```

## 🛡️ Security

- **JWT Verification** - Ochrona wszystkich endpoints
- **System Endpoints** - Bezpieczne endpoints dla automatyzacji
- **Data Validation** - Walidacja wszystkich danych wejściowych
- **Rate Limiting** - Ochrona przed spam-em
- **Audit Trail** - Logowanie wszystkich operacji

## 🎯 Future Enhancements

- **Multi-warehouse support** - Obsługa wielu magazynów
- **Batch operations** - Operacje hurtowe
- **Advanced analytics** - Zaawansowana analityka
- **API dla dostawców** - Integracja z dostawcami
- **Mobile apps** - Aplikacje mobilne dla magazynu

---

**Port**: 3007  
**Database**: `mikrouslugi_inventory`  
**Collections**: `inventories`, `reservations`