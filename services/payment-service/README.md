# 💳 Payment Service

Serwis obsługi płatności z automatycznym przetwarzaniem i integracją z zamówieniami.

## 📋 Funkcjonalności

- **Zarządzanie płatnościami** - CRUD operations
- **Automatyczne przetwarzanie** - Symulacja bramki płatniczej
- **Integracja z zamówieniami** - Automatyczna aktualizacja statusów
- **System refund** - Obsługa zwrotów
- **Monitoring płatności** - Tracking statusów
- **Multiple payment methods** - Karty, przelewy, etc.

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
- `GET /payments` - Lista płatności użytkownika
- `GET /payments/user/:userId` - Płatności konkretnego użytkownika
- `GET /payments/:id` - Szczegóły płatności
- `POST /payments` - Utworzenie płatności
- `POST /payments/:id/process` - Przetwarzanie płatności
- `POST /payments/:id/refund` - Zwrot płatności
- `PUT /payments/:id` - Aktualizacja płatności
- `GET /health` - Health check serwisu

## 🔄 Statusy płatności

**Flow standardowy:**
1. `pending` - Płatność utworzona
2. `processing` - W trakcie przetwarzania (po wywołaniu `/process`)
3. `completed` - Zakończona (po 2 sekundach, automatycznie)
4. `failed` - Nieudana
5. `refunded` - Zwrócona

## 🤖 Automatyzacja

### **Auto Processing Flow:**
1. Utworzenie płatności (status: `pending`)
2. Wywołanie `/payments/:id/process` (status: `processing`)
3. Po 2 sekundach automatycznie:
   - Status zmienia się na `completed`
   - Order Service otrzymuje aktualizację statusu zamówienia

### **Order Integration:**
```javascript
// Po zakończeniu płatności automatycznie
const orderResponse = await axios.put(
  `${ORDER_SERVICE_URL}/orders/${orderId}/system-status`, 
  { status: 'processing' }
);
```

## 🔧 Konfiguracja

### **Environment Variables** (`.env`)
```bash
NODE_ENV=development
PORT=3005
MONGODB_URI=mongodb://localhost:27017/mikrouslugi_payments
JWT_SECRET=mikro-uslugi-super-secret-key-2025
ORDER_SERVICE_URL=http://localhost:3000/api
```

### **Payment Methods**
- `card` - Karta kredytowa/debetowa
- `bank_transfer` - Przelew bankowy
- `paypal` - PayPal
- `blik` - BLIK
- `cash_on_delivery` - Płatność przy odbiorze

## 🗄️ Database Schema

**Payment Model:**
```javascript
{
  paymentId: String,         // Unikalny ID płatności
  orderId: ObjectId,         // ID zamówienia
  userId: ObjectId,          // ID użytkownika
  amount: Number,            // Kwota (w groszach/centach)
  currency: String,          // Waluta (default: USD)
  status: String,            // Status płatności
  method: String,            // Metoda płatności
  transactionId: String,     // ID transakcji zewnętrznej
  refundAmount: Number,      // Kwota zwrotu
  refundReason: String,      // Powód zwrotu
  failureReason: String,     // Powód niepowodzenia
  metadata: Object,          // Dodatkowe dane
  processedAt: Date,         // Data przetworzenia
  refundedAt: Date,          // Data zwrotu
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 API Examples

### **Lista płatności**
```bash
curl -X GET http://localhost:3005/payments \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### **Utworzenie płatności**
```bash
curl -X POST http://localhost:3005/payments \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_id",
    "amount": 50000,
    "method": "card",
    "currency": "USD"
  }'
```

### **Przetwarzanie płatności**
```bash
curl -X POST http://localhost:3005/payments/<PAYMENT_ID>/process \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "tx_123456789"
  }'
```

### **Zwrot płatności**
```bash
curl -X POST http://localhost:3005/payments/<PAYMENT_ID>/refund \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25000,
    "reason": "Customer request"
  }'
```

## 💡 Features

### **Auto Payment ID Generation**
```javascript
// Format: PAY-YYYYMMDD-HHMMSS-RANDOM
"paymentId": "PAY-20251214-115308-M5Y4XW"
```

### **Amount Validation**
- Automatyczna walidacja kwot
- Obsługa różnych walut
- Formatowanie kwot w response

### **Payment Processing Simulation**
- 2-sekundowe opóźnienie dla realizmu
- Automatyczne powiadomienie Order Service
- Logowanie wszystkich operacji

### **Refund System**
- Częściowe i pełne zwroty
- Tracking przyczyn zwrotów
- Automatyczne aktualizacje statusów

## 🔄 Integration

### **Z Order Service**
- Automatyczne aktualizacje statusu zamówienia
- Sprawdzanie zgodności kwot
- Notyfikacje o płatnościach

### **Z Auth Service**
- Weryfikacja użytkowników
- Authorization dla operacji

### **Future integrations**
- Stripe/PayPal API
- Bank transfer APIs
- Mobile payment systems

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3005/health
```

### **Payment Stats**
```bash
# Wszystkie płatności
curl -H "Authorization: Bearer $TOKEN" http://localhost:3005/payments

# Płatności konkretnego użytkownika
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3005/payments/user/<USER_ID>
```

### **Logi**
```bash
tail -f /tmp/payment-service.log
```

## 📚 Documentation

- **Swagger UI**: http://localhost:3005/api-docs
- **Health Check**: http://localhost:3005/health

## 🚨 Error Handling

- `400` - Bad Request (nieprawidłowa kwota, method)
- `401` - Unauthorized (brak tokenu)
- `403` - Forbidden (nie twoja płatność)
- `404` - Not Found (płatność nie istnieje)
- `409` - Conflict (płatność już przetworzona)
- `422` - Unprocessable Entity (błędne dane)
- `500` - Internal Server Error

## 🛡️ Security

- **JWT Verification** - Weryfikacja tokenów
- **User Isolation** - Użytkownicy widzą tylko swoje płatności
- **Amount Validation** - Walidacja kwot i walut
- **Transaction Logging** - Logowanie wszystkich operacji
- **Secure Processing** - Bezpieczne przetwarzanie płatności

## 🔧 Troubleshooting

### **Problem z automatyzacją**
```bash
# Sprawdź logi Payment Service
tail -f /tmp/payment-service.log

# Sprawdź czy Order Service otrzymuje aktualizacje
grep "Order status updated" /tmp/payment-service.log
```

### **Problem z płatnością**
```bash
# Sprawdź status płatności
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3005/payments/<PAYMENT_ID>

# Sprawdź czy zamówienie istnieje
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/orders/<ORDER_ID>
```

## 💰 Payment Flow Example

```bash
# 1. Utwórz płatność
PAYMENT_ID="payment_id"

# 2. Procesuj płatność (status: processing)
curl -X POST http://localhost:3005/payments/$PAYMENT_ID/process

# 3. Czekaj 2 sekundy - automatycznie:
#    - Status płatności: completed
#    - Status zamówienia: processing

# 4. Sprawdź rezultat
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3005/payments/$PAYMENT_ID
```

---

**Port**: 3005  
**Database**: `mikrouslugi_payments`  
**Collection**: `payments`