# Mikrousługi - Node.js Microservices Architecture

Kompleksowy projekt mikrousług zbudowany przy użyciu Node.js, Express.js, MongoDB i Docker.

## 🏗️ Architektura

- **Frontend**: React.js z Material-UI  
- **Backend**: Node.js + Express.js
- **Baza danych**: MongoDB z Mongoose ORM
- **Autoryzacja**: JWT tokens z bcrypt
- **Komunikacja**: REST API (HTTP + JSON)
- **API Gateway**: Prosty Express proxy (axios-based)
- **Konteneryzacja**: Docker + Docker Compose
- **Dokumentacja**: Swagger/OpenAPI
- **Uruchamianie**: Skrypty bash dla rozwoju lokalnego

## 🚀 Usługi

### 1. Frontend (Port 3003)
- React.js z Material-UI
- Dashboard zarządzania produktami
- Autentykacja użytkowników
- Responsywny design
- URL: http://localhost:3003

### 2. Auth Service (Port 3001)
- Rejestracja i logowanie użytkowników
- JWT token generation/validation
- Szyfrowanie haseł (bcrypt)
- Endpoints: `/auth/register`, `/auth/login`, `/auth/verify`

### 3. Product Service (Port 3002)
- Zarządzanie produktami
- CRUD operations dla produktów
- Autoryzacja z Auth Service
- Endpoints: `/products`, `/products/:id`

### 4. API Gateway (Port 3000)
- Prosty proxy oparty na Express + Axios
- Routing żądań do odpowiednich serwisów
- CORS handling
- Centralized logging
- URL: http://localhost:3000

## 📦 Wymagania

- Node.js 18+
- Docker & Docker Compose
- MongoDB (w kontenerze)

## 🛠️ Instalacja i Uruchomienie

### Szybki Start (Rozwój lokalny)

1. **Klonuj repozytorium**:
```bash
git clone https://github.com/Danielomix/mikrouslugi.git
cd mikrouslugi
```

2. **Zainstaluj zależności**:
```bash
npm run install-all
```

3. **Uruchom wszystkie serwisy**:
```bash
./start-local.sh
```

4. **Zatrzymaj wszystkie serwisy**:
```bash
./stop-local.sh
```

### Uruchomienie z Docker

1. **Uruchomienie całego środowiska**:
   ```bash
   git clone <repository-url>
   cd mikrouslugi
   ```

2. **Zainstaluj zależności**:
   ```bash
   npm run install-all
   ```

3. **Uruchom wszystkie serwisy**:
   ```bash
   npm run dev
   ```

## � Skrypty Lokalne

### start-local.sh
Uruchamia wszystkie mikrousługi lokalnie bez Docker:
- Sprawdza i uruchamia MongoDB
- Czyści porty
- Uruchamia wszystkie serwisy w tle
- Wyświetla status i adresy

### stop-local.sh  
Zatrzymuje wszystkie lokalne serwisy:
- Zabija procesy Node.js
- Czyści porty
- Usuwa logi

## �🐳 Docker Commands

```bash
# Uruchom wszystkie serwisy
docker-compose up --build

# Uruchom w tle
docker-compose up -d

# Zatrzymaj wszystkie serwisy
docker-compose down

# Zobacz logi
docker-compose logs -f

# Wyczyść wszystko (containers, volumes, networks)
npm run clean
```

## 📋 Dostępne Endpointy

### Frontend Web App (http://localhost:3003)
- **Dashboard**: Główny panel administracyjny
- **Logowanie**: http://localhost:3003/login
- **Rejestracja**: http://localhost:3003/register
- **Produkty**: http://localhost:3003/products
- **Dodaj Produkt**: http://localhost:3003/products/new

### API Gateway (http://localhost:3000)
- `POST /api/auth/*` - Proxy do Auth Service
- `GET/POST/PUT/DELETE /api/products/*` - Proxy do Product Service

## 🧪 Testowanie

### Postman
1. Importuj kolekcję z `/docs/postman/`
2. Ustaw environment variables
3. Testuj endpoints

### Manual Testing
```bash
# Rejestracja użytkownika
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Logowanie 
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Pobranie produktów (wymagany token)
curl -X GET "http://localhost:3000/api/products" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Wyszukiwanie produktów
curl -X GET "http://localhost:3000/api/products?search=Opel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filtrowanie po kategorii
curl -X GET "http://localhost:3000/api/products?category=Other" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Logowanie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Lista produktów
curl http://localhost:3000/api/products
```

## 📊 Monitoring i Logi

### Logi lokalne (po uruchomieniu ./start-local.sh)
```bash
# Auth Service
tail -f /tmp/auth-service.log

# Product Service  
tail -f /tmp/product-service.log

# API Gateway
tail -f /tmp/gateway.log

# Frontend
tail -f /tmp/frontend.log
```

### Logi Docker
```bash
# Wszystkie serwisy
docker-compose logs -f

# Konkretny serwis
docker-compose logs -f auth-service
```

### Health Checks
- Auth Service: http://localhost:3001/health
- Product Service: http://localhost:3002/health  
- API Gateway: http://localhost:3000/health

## ✨ Funkcjonalności

### Frontend (React)
- ✅ **Dashboard** - Statystyki i przegląd
- ✅ **Autoryzacja** - Logowanie/Rejestracja z JWT
- ✅ **Zarządzanie produktami** - CRUD operations
- ✅ **Wyszukiwanie** - Po nazwie, opisie, SKU
- ✅ **Filtrowanie** - Po kategorii, cenie
- ✅ **Responsive design** - Material-UI
- ✅ **Error handling** - Toast notifications

### Backend API
- ✅ **JWT Authentication** - Bezpieczna autoryzacja
- ✅ **Password hashing** - bcrypt
- ✅ **Input validation** - express-validator
- ✅ **MongoDB integration** - Mongoose ODM
- ✅ **API documentation** - Swagger/OpenAPI
- ✅ **CORS handling** - Cross-origin requests
- ✅ **Error handling** - Centralized error responses

### API Gateway
- ✅ **Request routing** - Proxy do mikrousług
- ✅ **Simple architecture** - Express + Axios (stabilne)
- ✅ **CORS configuration** - Frontend integration
- ✅ **Logging** - Request/response tracking

## 🔧 Development

### Struktura projektu
```
mikrouslugi/
├── frontend/             # React.js frontend (port 3003)
├── services/
│   ├── auth-service/     # Serwis autoryzacji (port 3001)
│   └── product-service/  # Serwis produktów (port 3002)
├── gateway/              # API Gateway (port 3000)
│   └── simple-gateway.js # Prosty, stabilny proxy
├── shared/               # Wspólne utilities
├── docs/                 # Dokumentacja i Postman collections
├── start-local.sh        # 🚀 Uruchomienie lokalnie 
├── stop-local.sh         # 🛑 Zatrzymanie serwisów
├── docker-compose.yml    # Docker orchestration
└── README.md
```

## 📚 Dokumentacja

- **[Setup Guide](docs/SETUP.md)** - Szczegółowa instrukcja instalacji
- **[Frontend Guide](docs/FRONTEND-GUIDE.md)** - Kompletny przewodnik po interfejsie
- **[Architecture](docs/ARCHITECTURE.md)** - Opis architektury mikrousług
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Rozwiązywanie problemów

## 🎯 Quick Links

- **Frontend App**: http://localhost:3003
- **API Docs**: http://localhost:3000/api-docs  
- **GitHub Repo**: https://github.com/Danielomix/mikrouslugi

## 🤝 Wsparcie

Jeśli masz problemy:
1. Sprawdź [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
2. Uruchom `./stop-local.sh && ./start-local.sh` 
3. Sprawdź logi w `/tmp/*.log`

## 📖 Dokumentacja

- **Swagger UI**: http://localhost:3000/api-docs
- **Postman Collection**: `/docs/postman/`
- **API Spec**: `/docs/swagger/`

## 🔒 Bezpieczeństwo

- JWT tokens z expiration
- Bcrypt password hashing
- CORS configured
- Rate limiting
- Input validation

## 🚧 TODO

- [ ] Redis cache integration
- [ ] Message queue (RabbitMQ)
- [ ] Elasticsearch logging
- [ ] Kubernetes deployment
- [ ] Unit & Integration tests
- [ ] CI/CD pipeline

## 🤝 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details.