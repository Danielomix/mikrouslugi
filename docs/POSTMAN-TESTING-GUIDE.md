# 📋 Przewodnik Testów Postman dla Mikrousług

## 🎯 Gdzie znajdziesz testy

### **1. Postman Collection**
```
/docs/postman/mikrouslugi-collection.json
```

### **2. Environment Variables**
```
/docs/postman/mikrouslugi-environment.json
```

## 🚀 Jak uruchomić testy w Postman

### **Krok 1: Importuj kolekcję**
1. Otwórz Postman
2. Kliknij **Import**
3. Wybierz `mikrouslugi-collection.json`
4. Następnie importuj `mikrouslugi-environment.json`

### **Krok 2: Ustaw Environment**
1. W prawym górnym rogu wybierz **"Mikrouslugi Environment"**
2. Sprawdź czy `baseUrl` = `http://localhost:3000`

### **Krok 3: Uruchom system**
```bash
# macOS/Linux
./start-local.sh

# Windows
start-windows.bat
```

## 🧪 Kompletne testy workflow

### **Test 1: Authentication Flow** 
```
1. Authentication → Register User
2. Authentication → Login (automatycznie ustawi token)
3. Authentication → Get Profile (sprawdzi czy token działa)
```

### **Test 2: Product Management**
```
1. Products → Create Product (wymaga admin token)
2. Products → Get All Products 
3. Products → Get Product by ID
4. Products → Filter Products
```

### **Test 3: E-commerce Automation Flow**
```
1. Authentication → Login (ustaw token)
2. Products → Create Product (automatycznie tworzy inventory)
3. Orders → Create Order (automatycznie rezerwuje produkty)
4. Payments → Create Payment 
5. Payments → Process Payment (automatycznie zmienia status zamówienia)
6. Orders → Update Order to "delivered" (automatycznie aktualizuje stock)
```

## 🔧 Automatyczne testy w kolekcji

### **Token Management**
Każdy test logowania automatycznie zapisuje token:
```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    pm.environment.set('authToken', responseJson.token);
    pm.environment.set('userId', responseJson.user._id);
}
```

### **ID Management**  
Tworzenie obiektów automatycznie zapisuje ID:
```javascript
// Po utworzeniu produktu
if (pm.response.code === 201) {
    const responseJson = pm.response.json();
    pm.environment.set('productId', responseJson.product._id);
}
```

## 📊 Kompletna lista testów

### **🔐 Authentication (4 testy)**
- Register User
- Login User  
- Verify Token
- Get Profile

### **📦 Products (6 testów)**
- Get All Products
- Create Product
- Get Product by ID
- Update Product
- Delete Product
- Filter Products

### **🛒 Orders (6 testów)**
- Get User Orders
- Create Order
- Get Order by ID
- Update Order Status
- Cancel Order
- Get Order History

### **💳 Payments (5 testów)**
- Get Payments
- Create Payment
- Get Payment by ID
- Process Payment
- Refund Payment

### **📦 Inventory (4 testy)**
- Get Inventory
- Reserve Products
- Deliver Products
- Check Stock Status

### **📧 Notifications (3 testy)**
- Get Notifications
- Mark as Read
- Get Preferences

### **📊 Analytics (3 testy)**
- Get Dashboard Data
- Get Reports
- Get Service Metrics

## 🎯 Testowanie automatyzacji

### **Scenario: Kompletne zamówienie**

**1. Przygotowanie:**
```
POST /auth/login → ustawi {{authToken}}
POST /products → ustawi {{productId}}
```

**2. Workflow:**
```
POST /orders → ustawi {{orderId}} (automatycznie rezerwuje produkty)
POST /payments → ustawi {{paymentId}}
POST /payments/{{paymentId}}/process → automatycznie zmienia status zamówienia
PUT /orders/{{orderId}}/status (status: delivered) → automatycznie aktualizuje stock
```

**3. Weryfikacja:**
```
GET /orders/{{orderId}} → sprawdź status = "delivered"
GET /inventory → sprawdź zmniejszony stock
GET /products/{{productId}} → sprawdź zaktualizowany stock
```

## 🔍 Debugging testów

### **Sprawdź logi serwisów:**
```bash
# macOS/Linux  
tail -f /tmp/payment-service.log
tail -f /tmp/order-service.log

# Windows
Get-Content -Path "logs/payment-service.log" -Tail 10 -Wait
```

### **Sprawdź environment variables:**
W Postman:
1. Kliknij oko👁️ obok environment
2. Sprawdź czy `authToken`, `productId`, `orderId` są ustawione

### **Test bezpośredni (bez Postman):**
```bash
# Login i pobierz token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | \
  jq -r '.token')

# Test endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/orders
```

## 🎯 Najważniejsze scenariusze testowe

### **Quick Health Check:**
```
GET {{baseUrl}}/health
GET {{baseUrl}}/api/auth/health  
GET {{baseUrl}}/api/products/health
```

### **Authentication Test:**
```
POST {{baseUrl}}/api/auth/login
Body: {"email": "test@example.com", "password": "password123"}
```

### **Full Automation Test:**
1. Login → Create Product → Create Order → Create Payment → Process Payment → Deliver Order
2. Sprawdź czy każdy krok automatycznie aktualizuje następne serwisy

Wszystkie testy są gotowe do użycia w Postman! 🚀