# Mikrousługi - Node.js Microservices Architecture

Kompleksowy projekt mikrousług zbudowany przy użyciu Node.js, Express.js, MongoDB i Docker.

## 🏗️ Architektura

- **Backend**: Node.js + Express.js
- **Baza danych**: MongoDB z Mongoose ORM
- **Autoryzacja**: JWT tokens z bcrypt
- **Komunikacja**: REST API (HTTP + JSON)
- **API Gateway**: Express Gateway
- **Konteneryzacja**: Docker + Docker Compose
- **Dokumentacja**: Swagger/OpenAPI

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
- Routing żądań do odpowiednich serwisów
- Rate limiting
- Authentication middleware
- Centralized logging

## 📦 Wymagania

- Node.js 18+
- Docker & Docker Compose
- MongoDB (w kontenerze)

## 🛠️ Instalacja

1. **Klonuj repozytorium**:
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

## 🐳 Docker Commands

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
# Rejestracja
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

## 📊 Monitoring

- **Logi**: `docker-compose logs -f [service-name]`
- **Zdravotní kontroly**: Każdy serwis ma `/health` endpoint
- **MongoDB**: Dostępny na `localhost:27017`

## 🔧 Development

### Struktura projektu
```
mikrouslugi/
├── frontend/             # React.js frontend
├── services/
│   ├── auth-service/     # Serwis autoryzacji
│   └── product-service/  # Serwis produktów
├── gateway/              # API Gateway
├── shared/               # Wspólne utilities
├── docs/                 # Dokumentacja i Postman
├── docker-compose.yml    # Docker orchestration
└── README.md
```

### Environment Variables
Skopiuj `.env.example` do `.env` w każdym serwisie i dostosuj wartości.

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