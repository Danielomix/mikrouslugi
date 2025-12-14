# 🔐 Auth Service

Serwis autoryzacji i zarządzania użytkownikami w systemie mikrousług e-commerce.

## 📋 Funkcjonalności

- **Rejestracja użytkowników** - Tworzenie nowych kont
- **Logowanie** - JWT token authentication
- **Weryfikacja tokenów** - Middleware dla innych serwisów
- **Zarządzanie użytkownikami** - CRUD operations
- **Hashing haseł** - bcrypt encryption
- **Role-based access** - Admin/User permissions

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
- `POST /auth/register` - Rejestracja nowego użytkownika
- `POST /auth/login` - Logowanie użytkownika
- `GET /health` - Health check serwisu

### **Chronione (wymagają JWT)**
- `GET /auth/verify` - Weryfikacja tokenu
- `GET /auth/profile` - Profil użytkownika
- `PUT /auth/profile` - Aktualizacja profilu
- `GET /users` - Lista użytkowników (admin only)
- `PUT /users/:id` - Aktualizacja użytkownika (admin only)
- `DELETE /users/:id` - Usunięcie użytkownika (admin only)

## 📊 Dane testowe

**Domyślny administrator:**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "role": "admin"
}
```

## 🔧 Konfiguracja

### **Environment Variables** (`.env`)
```bash
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mikrouslugi
JWT_SECRET=mikro-uslugi-super-secret-key-2025
JWT_EXPIRES_IN=24h
```

### **JWT Token Format**
```json
{
  "userId": "user_id",
  "email": "user@example.com", 
  "role": "admin|user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🗄️ Database Schema

**User Model:**
```javascript
{
  name: String,           // Imię i nazwisko
  email: String,          // Unikalny email
  password: String,       // Zahashowane hasło (bcrypt)
  role: String,          // 'admin' | 'user'
  isActive: Boolean,      // Status konta
  lastLogin: Date,        // Ostatnie logowanie
  createdAt: Date,        // Data utworzenia
  updatedAt: Date         // Data aktualizacji
}
```

## 🔍 API Examples

### **Rejestracja**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jan Kowalski",
    "email": "jan@example.com",
    "password": "password123"
  }'
```

### **Logowanie**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **Weryfikacja tokenu**
```bash
curl -X GET http://localhost:3001/auth/verify \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 🛡️ Security Features

- **Password Hashing** - bcrypt z salt rounds = 12
- **JWT Tokens** - Secure token generation
- **Input Validation** - express-validator
- **Rate Limiting** - Ochrona przed atakami brute force
- **CORS** - Kontrolowany dostęp cross-origin
- **Helmet** - Security headers

## 📚 Documentation

- **Swagger UI**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## 🔄 Integration

Serwis Auth jest używany przez wszystkie inne serwisy do:
- Weryfikacji JWT tokenów
- Pobierania informacji o użytkownikach
- Autoryzacji operacji

**Przykład użycia w innych serwisach:**
```javascript
// Middleware weryfikacji tokenu
const authResponse = await axios.get(`${AUTH_SERVICE_URL}/auth/verify`, {
  headers: { Authorization: req.headers.authorization }
});
```

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3001/health
```

### **Logi**
```bash
tail -f /tmp/auth-service.log
```

## 🚨 Error Handling

- `400` - Bad Request (walidacja)
- `401` - Unauthorized (błędne dane/token)
- `403` - Forbidden (brak uprawnień)
- `404` - Not Found (użytkownik nie istnieje)
- `409` - Conflict (email już istnieje)
- `500` - Internal Server Error

---

**Port**: 3001  
**Database**: `mikrouslugi`  
**Collection**: `users`