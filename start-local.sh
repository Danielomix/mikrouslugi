#!/bin/bash

# Skrypt do uruchamiania mikrousług lokalnie
# Uruchamia wszystkie serwisy w tle z automatycznym restartowaniem

echo "🚀 Uruchamianie mikrousług lokalnie..."

# Sprawdzenie czy MongoDB działa
if ! pgrep -f mongod > /dev/null; then
    echo "⚠️  MongoDB nie działa. Uruchamianie..."
    brew services start mongodb/brew/mongodb-community
    sleep 3
else
    echo "✅ MongoDB już działa"
fi

# Sprawdzenie czy porty są wolne i zatrzymanie starych procesów
echo "🔍 Sprawdzanie portów..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "Port 3001 jest wolny"
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "Port 3002 jest wolny"
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Port 3000 jest wolny"
lsof -ti:3003 | xargs kill -9 2>/dev/null || echo "Port 3003 jest wolny"

# Uruchomienie Auth Service
echo "🔐 Uruchamianie Auth Service (port 3001)..."
(cd services/auth-service && npm run dev > /tmp/auth-service.log 2>&1 &)

# Czekanie na uruchomienie
sleep 3

# Uruchomienie Product Service
echo "📦 Uruchamianie Product Service (port 3002)..."
(cd services/product-service && npm run dev > /tmp/product-service.log 2>&1 &)

# Czekanie na uruchomienie
sleep 3

# Uruchomienie API Gateway
echo "🚪 Uruchamianie API Gateway (port 3000)..."
(cd gateway && npm run dev > /tmp/gateway.log 2>&1 &)

# Czekanie na uruchomienie
sleep 3

# Uruchomienie Frontend
echo "🌐 Uruchamianie Frontend (port 3003)..."
(cd frontend && npm start > /tmp/frontend.log 2>&1 &)

# Czekanie na uruchomienie wszystkich serwisów
echo "⏳ Czekanie na uruchomienie wszystkich serwisów..."
sleep 10

# Sprawdzenie statusu
echo ""
echo "📊 Status serwisów:"
echo "===================="

# Test Auth Service
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Auth Service:     http://localhost:3001 ✓"
else
    echo "❌ Auth Service:     http://localhost:3001 ✗"
fi

# Test Product Service 
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ Product Service:  http://localhost:3002 ✓"
else
    echo "❌ Product Service:  http://localhost:3002 ✗"
fi

# Test API Gateway
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ API Gateway:      http://localhost:3000 ✓"
else
    echo "❌ API Gateway:      http://localhost:3000 ✗"
fi

# Test Frontend
if curl -s http://localhost:3003 > /dev/null; then
    echo "✅ Frontend:         http://localhost:3003 ✓"
else
    echo "❌ Frontend:         http://localhost:3003 ✗"
fi

echo ""
echo "🎯 Dostępne adresy:"
echo "==================="
echo "🌐 Frontend (React):  http://localhost:3003"
echo "🚪 API Gateway:       http://localhost:3000"
echo "📖 API Dokumentacja:  http://localhost:3000/api-docs"
echo "🔐 Auth Service:      http://localhost:3001"
echo "📦 Product Service:   http://localhost:3002"

echo ""
echo "📝 Logi serwisów:"
echo "=================="
echo "Auth Service:    tail -f /tmp/auth-service.log"
echo "Product Service: tail -f /tmp/product-service.log"
echo "API Gateway:     tail -f /tmp/gateway.log"
echo "Frontend:        tail -f /tmp/frontend.log"

echo ""
echo "⚠️  Aby zatrzymać wszystkie serwisy, uruchom:"
echo "killall node"
echo ""
echo "🚀 Aplikacja powinna być dostępna za chwilę!"