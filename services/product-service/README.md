# 📦 Product Service

Serwis zarządzania katalogiem produktów w systemie e-commerce.

## 📋 Funkcjonalności

- **Zarządzanie produktami** - CRUD operations
- **System kategorii** - Grupowanie produktów
- **Zarządzanie stock** - Kontrola dostępności
- **System SKU** - Unikalne kody produktów
- **Cennik** - Zarządzanie cenami
- **System endpoint** - Automatyczne aktualizacje stock

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

### **Publiczne**
- `GET /products` - Lista produktów (z paginacją)
- `GET /products/:id` - Szczegóły produktu
- `GET /health` - Health check serwisu

### **Chronione (wymagają JWT)**
- `POST /products` - Utworzenie produktu (admin only)
- `PUT /products/:id` - Aktualizacja produktu (admin only)
- `DELETE /products/:id` - Usunięcie produktu (admin only)

### **System Endpoints (automatyzacja)**
- `PUT /products/:id/system-stock` - Aktualizacja stock przez system

## 📊 Dane testowe

**Przykładowe produkty:**
- Tesla Model 3 (Samochód elektryczny)
- BMW X5 (SUV premium)
- Audi A4 (Limuzyna sportowa)
- Wilson Tennis Racket (Sprzęt sportowy)
- IKEA Sofa (Meble)

## 🔧 Konfiguracja

### **Environment Variables** (`.env`)
```bash
NODE_ENV=development
PORT=3002
MONGODB_URI=mongodb://localhost:27017/mikrouslugi
JWT_SECRET=mikro-uslugi-super-secret-key-2025
```

### **Dostępne kategorie**
- `Electronics` - Elektronika
- `Clothing` - Odzież
- `Books` - Książki
- `Home` - Dom i ogród
- `Sports` - Sport i rekreacja
- `Food` - Żywność
- `Other` - Inne (używane dla samochodów)

## 🗄️ Database Schema

**Product Model:**
```javascript
{
  name: String,           // Nazwa produktu
  description: String,    // Opis produktu
  price: Number,         // Cena (w groszach/centach)
  category: String,      // Kategoria (enum)
  stock: Number,         // Dostępna ilość
  sku: String,          // Unikalny kod produktu
  tags: [String],       // Tagi do wyszukiwania
  images: [String],     // URLe do zdjęć
  isActive: Boolean,    // Status aktywności
  createdBy: ObjectId,  // ID użytkownika
  updatedBy: ObjectId,  // ID ostatniego edytora
  createdAt: Date,      // Data utworzenia
  updatedAt: Date       // Data aktualizacji
}
```

## 🔍 API Examples

### **Lista produktów**
```bash
curl -X GET "http://localhost:3002/products?page=1&limit=10&category=Other"
```

### **Szczegóły produktu**
```bash
curl -X GET http://localhost:3002/products/<PRODUCT_ID>
```

### **Utworzenie produktu**
```bash
curl -X POST http://localhost:3002/products \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tesla Model S",
    "description": "Luksusowy samochód elektryczny",
    "price": 120000,
    "category": "Other",
    "stock": 5,
    "sku": "TESLA-MODEL-S-001"
  }'
```

### **Aktualizacja stock (system)**
```bash
curl -X PUT http://localhost:3002/products/<PRODUCT_ID>/system-stock \
  -H "Content-Type: application/json" \
  -d '{"stock": 3}'
```

## 🤖 Automatyzacja

### **System Stock Updates**
Endpoint `/products/:id/system-stock` jest używany przez Order Service do automatycznej aktualizacji stock po dostarczeniu zamówienia.

**Flow:**
1. Zamówienie ma status "delivered"
2. Order Service wywołuje system endpoint
3. Stock produktu zostaje automatycznie zmniejszony
4. Log aktualizacji w konsoli

## 🔄 Integration

### **Z Order Service**
- Sprawdzanie dostępności produktów podczas tworzenia zamówienia
- Automatyczne aktualizacje stock po dostarczeniu

### **Z Inventory Service**  
- Synchronizacja stock między Product a Inventory
- Tworzenie pozycji magazynowych dla nowych produktów

### **Z Auth Service**
- Weryfikacja uprawnień do zarządzania produktami
- Tracking kto utworzył/edytował produkt

## 📊 Features

### **Paginacja**
```bash
GET /products?page=1&limit=10&sortBy=price&sortOrder=desc
```

### **Filtrowanie**
```bash
GET /products?category=Electronics&minPrice=100&maxPrice=1000
```

### **Wyszukiwanie**
```bash
GET /products?search=tesla&tags=electric,car
```

### **Formatowanie cen**
```javascript
// Automatyczne formatowanie cen w response
"formattedPrice": "$1,200.00"
```

## 📚 Documentation

- **Swagger UI**: http://localhost:3002/api-docs
- **Health Check**: http://localhost:3002/health

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3002/health
```

### **Logi**
```bash
tail -f /tmp/product-service.log
```

### **Metryki produktów**
```bash
# Liczba produktów
curl http://localhost:3002/products | jq '.pagination.total'

# Produkty z niskim stock
curl "http://localhost:3002/products?stock_lt=5"
```

## 🚨 Error Handling

- `400` - Bad Request (walidacja, niepoprawne dane)
- `401` - Unauthorized (brak tokenu)
- `403` - Forbidden (brak uprawnień admin)
- `404` - Not Found (produkt nie istnieje)
- `409` - Conflict (SKU już istnieje)
- `500` - Internal Server Error

## 🛡️ Security

- **JWT Verification** - Weryfikacja tokenów przez Auth Service
- **Input Validation** - express-validator
- **Admin Only Operations** - Tworzenie/edycja tylko dla adminów
- **System Endpoints** - Bezpieczeństwo dla automatyzacji

---

**Port**: 3002  
**Database**: `mikrouslugi`  
**Collection**: `products`