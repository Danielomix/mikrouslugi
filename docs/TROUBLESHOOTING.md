# 🛠️ Rozwiązywanie Problemów

## Najczęstsze Problemy i Rozwiązania

### 🚫 Problem: "Nie mogę się zalogować przez frontend"
**Rozwiązanie:**
```bash
# 1. Zatrzymaj wszystkie procesy
./stop-local.sh

# 2. Uruchom ponownie
./start-local.sh

# 3. Sprawdź czy wszystkie serwisy działają
curl http://localhost:3000/health
curl http://localhost:3001/health  
curl http://localhost:3002/health
```

### 🚫 Problem: "Filtrowanie produktów nie działa"
**Rozwiązanie:** 
- ✅ **NAPRAWIONE!** - Używamy teraz prostego API Gateway (`simple-gateway.js`)
- API Gateway bazujące na `http-proxy-middleware` było problematyczne
- Nowe rozwiązanie: Express + Axios = stabilne

### 🚫 Problem: "Port już zajęty" 
**Rozwiązanie:**
```bash
# Zabij wszystkie procesy Node.js
killall node

# Wyczyść konkretny port (np. 3000)
lsof -ti:3000 | xargs kill -9

# Uruchom ponownie
./start-local.sh
```

### 🚫 Problem: "MongoDB nie działa"
**Rozwiązanie:**
```bash
# MacOS z Homebrew
brew services start mongodb/brew/mongodb-community

# Sprawdź status
brew services list | grep mongodb

# Restart jeśli potrzebny
brew services restart mongodb/brew/mongodb-community
```

### 🚫 Problem: "Cannot find module"
**Rozwiązanie:**
```bash
# Reinstaluj wszystkie zależności
npm run install-all

# Lub manualnie w każdym serwisie
cd services/auth-service && npm install
cd services/product-service && npm install  
cd gateway && npm install
cd frontend && npm install
```

## 🔧 Architektura - Co działa

### ✅ Działające rozwiązania:
- **API Gateway**: `simple-gateway.js` - Express + Axios
- **Uruchomienie**: `start-local.sh` - bash scripts
- **Frontend**: React + Material-UI + JWT auth
- **Backend**: Node.js + Express + MongoDB

### ❌ Problematyczne (usunięte):
- `http-proxy-middleware` - timeouty i błędy 304
- Złożone proxy configurations
- nodemon w gateway (niepotrzebne)

## 📊 Status Funkcji

| Funkcja | Status | Notatki |
|---------|--------|---------|
| Rejestracja użytkowników | ✅ Działa | JWT + bcrypt |
| Logowanie | ✅ Działa | Token handling |
| Dashboard | ✅ Działa | Statystyki produktów |
| Lista produktów | ✅ Działa | Paginacja + filtrowanie |
| Wyszukiwanie | ✅ Działa | Nazwa, opis, SKU |
| Filtrowanie | ✅ Działa | Kategoria, cena |
| Dodawanie produktów | ✅ Działa | Walidacja SKU |
| Edycja produktów | ✅ Działa | Full CRUD |
| Usuwanie produktów | ✅ Działa | Confirmation dialog |
| API Gateway proxy | ✅ Działa | simple-gateway.js |

## 🚀 Najlepsze Praktyki

1. **Zawsze używaj `start-local.sh`** - najbardziej niezawodne
2. **Sprawdzaj logi** w `/tmp/` jeśli problemy
3. **Testuj API bezpośrednio** - `curl` commands w README
4. **Frontend błędy** - sprawdź console przeglądarki (F12)
5. **Port conflicts** - używaj `./stop-local.sh` przed restart