# 🚀 Instrukcja Uruchomienia Mikrousług

## Wymagania
- **Node.js 18+** (wymagany do lokalnego developmentu)
- **MongoDB** (instalacja przez Homebrew: `brew install mongodb-community`)
- **Docker** i **Docker Compose** (opcjonalne do konteneryzacji)
- **Git** do klonowania repozytorium

## 🛠️ Szybkie Uruchomienie (REKOMENDOWANE)

### 1. Klonowanie i przygotowanie projektu
```bash
git clone https://github.com/Danielomix/mikrouslugi.git
cd mikrouslugi

# Instalacja wszystkich zależności
npm run install-all
```

### 2. Uruchomienie lokalnie (bez Docker)
```bash
# Uruchom wszystkie serwisy jedną komendą
./start-local.sh

# Zatrzymaj wszystkie serwisy
./stop-local.sh
```

### 3. Alternatywnie: Docker Compose
```bash
# Opcja z konteneryzacją
docker-compose up --build

# Lub używając npm scripts
npm run dev
```

### 4. Weryfikacja działania
Sprawdź czy wszystkie serwisy działają:
```bash
# Health check wszystkich serwisów
curl http://localhost:3000/health

# Sprawdzenie poszczególnych serwisów
curl http://localhost:3000/health/auth
curl http://localhost:3000/health/products
```

## 📋 Dostępne Endpointy

### 🌐 Frontend Web App (Port 3003)
- **Aplikacja**: http://localhost:3003
- **Dashboard**: http://localhost:3003/dashboard
- **Logowanie**: http://localhost:3003/login
- **Rejestracja**: http://localhost:3003/register
- **Produkty**: http://localhost:3003/products

### API Gateway (Port 3000)
- **Dokumentacja**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **API Overview**: http://localhost:3000/api

### Auth Service (Przez Gateway)
- `POST /api/auth/register` - Rejestracja użytkownika
- `POST /api/auth/login` - Logowanie użytkownika
- `POST /api/auth/verify` - Weryfikacja tokenu
- `GET /api/auth/profile` - Profil użytkownika

### Product Service (Przez Gateway)
- `GET /api/products` - Lista produktów (z filtrowaniem)
- `POST /api/products` - Tworzenie produktu (auth wymagane)
- `GET /api/products/:id` - Szczegóły produktu
- `PUT /api/products/:id` - Aktualizacja produktu (auth wymagane)
- `DELETE /api/products/:id` - Usuwanie produktu (auth wymagane)

## 🧪 Testowanie

### 🌐 Interfejs Web (Najłatwiejszy sposób!)
1. Otwórz przeglądarkę: http://localhost:3003
2. Zarejestruj nowe konto lub zaloguj się
3. Korzystaj z intuicyjnego interfejsu do zarządzania produktami

### Użycie Postman
1. Importuj kolekcję: `docs/postman/mikrouslugi-collection.json`
2. Importuj environment: `docs/postman/mikrouslugi-environment.json`
3. Uruchom testy w kolejności: Register → Login → Products

### Przykładowe wywołania cURL

#### Rejestracja użytkownika
```bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jan Kowalski",
    "email": "jan@example.com",
    "password": "password123"
  }'
```

#### Logowanie
```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "jan@example.com",
    "password": "password123"
  }'
```

#### Lista produktów
```bash
curl http://localhost:3000/api/products
```

#### Tworzenie produktu (wymagany token)
```bash
curl -X POST http://localhost:3000/api/products \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{
    "name": "Laptop Gaming",
    "description": "Wydajny laptop do gier",
    "price": 2999.99,
    "category": "Electronics",
    "stock": 10,
    "sku": "LAP-001",
    "tags": ["gaming", "laptop", "electronics"]
  }'
```

## 🐳 Zarządzanie Kontenerami

### Podstawowe komendy
```bash
# Uruchomienie w tle
docker-compose up -d

# Zatrzymanie wszystkich serwisów
docker-compose down

# Zatrzymanie i usunięcie volumes
docker-compose down -v

# Przebudowa kontenerów
docker-compose up --build

# Logi wszystkich serwisów
docker-compose logs -f

# Logi konkretnego serwisu
docker-compose logs -f auth-service
docker-compose logs -f product-service
docker-compose logs -f api-gateway
```

### Dostęp do kontenerów
```bash
# Wejście do kontenera auth-service
docker-compose exec auth-service sh

# Wejście do MongoDB
docker-compose exec mongodb mongosh mongodb://admin:password@localhost:27017/mikrouslugi?authSource=admin
```

## 📊 Monitorowanie

### MongoDB
- **URL**: mongodb://localhost:27017
- **Username**: admin
- **Password**: password
- **Database**: mikrouslugi

### Logi
```bash
# Wszystkie logi w czasie rzeczywistym
docker-compose logs -f

# Tylko błędy
docker-compose logs -f | grep ERROR

# Logi konkretnego serwisu
docker-compose logs -f [service-name]
```

### Health Checks
```bash
# Gateway + wszystkie serwisy
curl http://localhost:3000/health

# Tylko auth service
curl http://localhost:3001/health

# Tylko product service  
curl http://localhost:3002/health
```

## 🔧 Development Mode

### Lokalne uruchomienie (bez Dockera)
```bash
# 1. Uruchom tylko MongoDB
docker-compose up mongodb -d

# 2. Zainstaluj zależności
npm run install-all

# 3. Uruchom serwisy lokalnie (w osobnych terminalach)
cd services/auth-service && npm run dev
cd services/product-service && npm run dev  
cd gateway && npm run dev
```

### Environment Variables
Skopiuj pliki `.env.example` do `.env` w każdym serwisie i dostosuj wartości.

## 🔒 Konfiguracja Bezpieczeństwa

### Zmiana haseł produkcyjnych
1. **MongoDB**: Zmień hasła w `docker-compose.yml`
2. **JWT Secret**: Ustaw mocny klucz w zmiennych środowiskowych
3. **CORS**: Dostosuj `ALLOWED_ORIGINS` do swoich domen

## 🚨 Rozwiązywanie Problemów

### Serwis nie startuje
```bash
# Sprawdź logi
docker-compose logs [service-name]

# Sprawdź status kontenerów
docker-compose ps

# Restart konkretnego serwisu
docker-compose restart [service-name]
```

### Problemy z bazą danych
```bash
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