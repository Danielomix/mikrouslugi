# 🛒 Order Service

Serwis zarządzania zamówieniami z automatyzacją statusów i integracją z magazynem.

## 📋 Funkcjonalności

- **Zarządzanie zamówieniami** - CRUD operations
- **System statusów** - Automatyczna zmiana statusów
- **Integracja z produktami** - Sprawdzanie dostępności
- **Integracja z magazynem** - Automatyczne rezerwacje/aktualizacje
- **Automatyzacja dostarczenia** - Auto aktualizacja stock po dostarczeniu
- **System numeracji** - Unikalne numery zamówień

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
- `GET /orders` - Lista zamówień użytkownika
- `GET /orders/:id` - Szczegóły zamówienia
- `POST /orders` - Utworzenie zamówienia
- `PUT /orders/:id/status` - Aktualizacja statusu (admin only)
- `DELETE /orders/:id` - Anulowanie zamówienia

### **System Endpoints (automatyzacja)**
- `PUT /orders/:id/system-status` - Aktualizacja statusu przez system
- `GET /health` - Health check serwisu

## 🔄 Statusy zamówień

**Flow standardowy:**
1. `pending` - Zamówienie utworzone
2. `processing` - Płatność zakończona (automatycznie)
3. `shipped` - Wysłane
4. `delivered` - Dostarczone (automatycznie aktualizuje magazyn)

**Alternatywne statusy:**
- `cancelled` - Anulowane
- `refunded` - Zwrócone

## 🤖 Automatyzacja

### **1. Payment → Order Status**
Po zakończeniu płatności w Payment Service:
- Payment Service wywołuje `/orders/:id/system-status`
- Status zmienia się z `pending` na `processing`

### **2. Delivery → Inventory Update**
Po zmianie statusu na `delivered`:
- Automatyczne wywołanie Inventory Service `/product/:id/deliver`
- Automatyczne wywołanie Product Service `/products/:id/system-stock`
- Zmniejszenie stock i usunięcie rezerwacji

## 🔧 Konfiguracja

### **Environment Variables** (`.env`)
```bash
NODE_ENV=development
PORT=3004
MONGODB_URI=mongodb://localhost:27017/mikrouslugi_orders
JWT_SECRET=mikro-uslugi-super-secret-key-2025
PRODUCT_SERVICE_URL=http://localhost:3000/api
INVENTORY_SERVICE_URL=http://localhost:3000/api
```

## 🗄️ Database Schema

**Order Model:**
```javascript
{
  orderNumber: String,        // Unikalny numer zamówienia
  userId: ObjectId,          // ID użytkownika
  userEmail: String,         // Email użytkownika
  items: [{
    productId: ObjectId,     // ID produktu
    productName: String,     // Nazwa produktu
    productPrice: Number,    // Cena za sztukę
    quantity: Number,        // Ilość
    subtotal: Number         // Suma za pozycję
  }],
  totalAmount: Number,       // Suma przed dostawą i rabatami
  shippingCost: Number,      // Koszt dostawy
  discountAmount: Number,    // Rabat
  finalAmount: Number,       // Kwota finalna
  status: String,           // Status zamówienia
  paymentStatus: String,    // Status płatności
  paymentMethod: String,    // Metoda płatności
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  notes: String,            // Uwagi
  deliveredAt: Date,        // Data dostarczenia
  cancelledAt: Date,        // Data anulowania
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 API Examples

### **Lista zamówień**
```bash
curl -X GET http://localhost:3004/orders \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### **Utworzenie zamówienia**
```bash
curl -X POST http://localhost:3004/orders \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "product_id",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "Test Street 123",
      "city": "Warszawa",
      "postalCode": "00-001",
      "country": "Poland"
    }
  }'
```

### **Dostarczenie zamówienia (automatyzacja)**
```bash
curl -X PUT http://localhost:3004/orders/<ORDER_ID>/system-status \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'
```

## 🔄 Integration Flow

### **Tworzenie zamówienia:**
1. Sprawdzenie dostępności produktów (Product Service)
2. Rezerwacja w magazynie (Inventory Service) 
3. Utworzenie zamówienia z statusem `pending`
4. Generowanie unikalnego numeru zamówienia

### **Płatność → Processing:**
1. Payment Service kończy płatność
2. Automatyczne wywołanie system endpoint
3. Zmiana statusu na `processing`

### **Dostarczenie → Stock Update:**
1. Zmiana statusu na `delivered`
2. Dla każdego produktu w zamówieniu:
   - Wywołanie Inventory Service `/product/:id/deliver`
   - Wywołanie Product Service `/products/:id/system-stock`
   - Aktualizacja stock i usunięcie rezerwacji

## 📊 Features

### **Walidacja zamówień**
- Sprawdzanie dostępności produktów
- Automatyczne pobieranie cen z Product Service
- Kalkulacja sum i kosztów

### **Numeracja zamówień**
```javascript
// Format: ORD-TIMESTAMP-RANDOM
"orderNumber": "ORD-20251214-ABC123"
```

### **Paginacja i filtrowanie**
```bash
GET /orders?page=1&limit=10&status=processing&sortBy=createdAt
```

## 📚 Documentation

- **Swagger UI**: http://localhost:3004/api-docs
- **Health Check**: http://localhost:3004/health

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3004/health
```

### **Logi**
```bash
tail -f /tmp/order-service.log

# Logi automatyzacji
tail -f /tmp/order-service-debug.log
```

### **Sprawdzenie automatyzacji**
```bash
# Sprawdź logi aktualizacji stock
grep "Updated product.*stock" /tmp/order-service-debug.log
```

## 🚨 Error Handling

- `400` - Bad Request (walidacja, brak produktów)
- `401` - Unauthorized (brak tokenu)
- `403` - Forbidden (nie twoje zamówienie)
- `404` - Not Found (zamówienie nie istnieje)
- `409` - Conflict (niewystarczający stock)
- `500` - Internal Server Error

## 🛡️ Security

- **JWT Verification** - Weryfikacja tokenów
- **User Isolation** - Użytkownicy widzą tylko swoje zamówienia
- **Admin Privileges** - Admini widzą wszystkie zamówienia
- **System Endpoints** - Dedykowane dla automatyzacji

## 🔧 Troubleshooting

### **Problem z automatyzacją**
```bash
# Sprawdź logi Order Service
tail -f /tmp/order-service-debug.log

# Sprawdź komunikację z innymi serwisami
grep "Error updating" /tmp/order-service-debug.log
```

### **Problem z stock**
```bash
# Sprawdź czy produkty mają odpowiedni stock
curl http://localhost:3000/api/products/<PRODUCT_ID>

# Sprawdź stan magazynu
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/inventory/product/<PRODUCT_ID>
```

---

**Port**: 3004  
**Database**: `mikrouslugi_orders`  
**Collection**: `orders`