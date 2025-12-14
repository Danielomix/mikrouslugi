# 🚀 Jak używać Postman przez terminal (Newman CLI)

## 🛠️ Instalacja Newman

```bash
# Globalnie dla wszystkich projektów
npm install -g newman

# Sprawdzenie wersji
newman --version
```

## 📋 Podstawowe komendy

### **1. Uruchomienie całej kolekcji**
```bash
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json
```

### **2. Uruchomienie konkretnego folderu**
```bash
# Tylko testy Authentication
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --folder "Authentication"

# Tylko testy Products  
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --folder "Products"

# Tylko testy Payments
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --folder "Payments"
```

### **3. Zaawansowane opcje**
```bash
# Z opóźnieniem między requestami
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --delay-request 1000

# Z zapisem wyników do JSON
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --reporters cli,json \
  --reporter-json-export test-results.json

# Z timeoutem
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --timeout-request 30000
```

## 🎯 Przygotowane skrypty

### **macOS/Linux:**
```bash
# Uruchom interaktywny skrypt testowy
./test-postman.sh

# Bezpośrednie uruchomienie
chmod +x test-postman.sh
./test-postman.sh
```

### **Windows:**
```cmd
# Uruchom w Command Prompt
test-postman.bat

# Lub w PowerShell
.\test-postman.bat
```

## 🧪 Scenariusze testowe

### **Scenario 1: Quick Health Check**
```bash
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --folder "Authentication" \
  --delay-request 500
```

### **Scenario 2: Complete E-commerce Workflow**
```bash
# 1. Authentication (ustawi token)
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --folder "Authentication"

# 2. Products (utworzy produkty)
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --folder "Products"

# 3. Orders (utworzy zamówienia)
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --folder "Orders"

# 4. Payments (uruchomi automatyzację)
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --folder "Payments"
```

### **Scenario 3: Full Test Suite**
```bash
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --reporters cli,json \
  --reporter-json-export full-test-results.json \
  --delay-request 1000
```

## 📊 Analiza wyników

### **Format output:**
```
newman

Mikrousługi API

❏ Authentication
↳ Register User
  POST http://localhost:3000/api/auth/register [201 Created, 1.2kB, 245ms]
↳ Login User  
  POST http://localhost:3000/api/auth/login [200 OK, 1.1kB, 156ms]
↳ Get Profile
  GET http://localhost:3000/api/auth/profile [200 OK, 892B, 89ms]

┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
│                requests │               3 │               0 │
│            test-scripts │               2 │               0 │
│              assertions │               4 │               0 │
│ total run duration: 1.2s                                   │
│ total data received: 3.1kB (approx)                       │
│ average response time: 163ms [min: 89ms, max: 245ms]      │
└─────────────────────────┴─────────────────┴─────────────────┘
```

### **Błędy i debugging:**
```bash
# Szczegółowe błędy
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --verbose

# Z większym timeout dla wolnych serwisów
newman run docs/postman/mikrouslugi-collection.json \
  -e docs/postman/mikrouslugi-environment.json \
  --timeout-request 60000
```

## 🔧 Przed uruchomieniem testów

### **1. Upewnij się, że system działa:**
```bash
# macOS/Linux
./start-local.sh

# Windows
start-windows.bat

# Sprawdź health
curl http://localhost:3000/health
curl http://localhost:3001/health
```

### **2. Sprawdź dostępność plików:**
```bash
ls -la docs/postman/
# Powinny być:
# mikrouslugi-collection.json
# mikrouslugi-environment.json
```

## 💡 Przydatne aliasy

### **Dla ~/.bashrc lub ~/.zshrc:**
```bash
alias newman-auth='newman run docs/postman/mikrouslugi-collection.json -e docs/postman/mikrouslugi-environment.json --folder "Authentication"'

alias newman-full='newman run docs/postman/mikrouslugi-collection.json -e docs/postman/mikrouslugi-environment.json --delay-request 1000'

alias newman-workflow='./test-postman.sh'
```

## 🎯 Automatyzacja w CI/CD

### **GitHub Actions example:**
```yaml
- name: Run Newman Tests
  run: |
    newman run docs/postman/mikrouslugi-collection.json \
      -e docs/postman/mikrouslugi-environment.json \
      --reporters cli,junit \
      --reporter-junit-export test-results.xml
```

## 🚀 Quick Start

1. **Uruchom system**: `./start-local.sh` 
2. **Zainstaluj Newman**: `npm install -g newman`
3. **Uruchom testy**: `./test-postman.sh`
4. **Wybierz opcję**: Authentication, Products, Full workflow
5. **Zobacz wyniki**: W terminalu + folder `test-results/`

**Newman pozwala na pełną automatyzację testów Postman z terminala!** 🎯