#!/bin/bash

# Skrypt do uruchamiania mikrousług lokalnie
# Uruchamia wszystkie serwisy w tle z automatycznym restartowaniem

echo "🚀 Uruchamianie mikrousług lokalnie..."

# Ładowanie zmiennych środowiskowych
if [ -f .env ]; then
    echo "📁 Ładowanie .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  Brak pliku .env, używanie wartości domyślnych"
fi

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
lsof -ti:3003 | xargs kill -9 2>/dev/null || echo "Port 3003 jest wolny"
lsof -ti:3004 | xargs kill -9 2>/dev/null || echo "Port 3004 jest wolny"
lsof -ti:3005 | xargs kill -9 2>/dev/null || echo "Port 3005 jest wolny"
lsof -ti:3006 | xargs kill -9 2>/dev/null || echo "Port 3006 jest wolny"
lsof -ti:3007 | xargs kill -9 2>/dev/null || echo "Port 3007 jest wolny"
lsof -ti:3008 | xargs kill -9 2>/dev/null || echo "Port 3008 jest wolny"
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Port 3000 jest wolny"

# Uruchomienie Auth Service
echo "🔐 Uruchamianie Auth Service (port 3001)..."
(cd services/auth-service && npm run dev > /tmp/auth-service.log 2>&1 &)

# Czekanie na uruchomienie
sleep 2

# Uruchomienie Product Service
echo "📦 Uruchamianie Product Service (port 3002)..."
(cd services/product-service && npm run dev > /tmp/product-service.log 2>&1 &)

# Czekanie na uruchomienie
sleep 2

# Uruchomienie Order Service
echo "🛒 Uruchamianie Order Service (port 3004)..."
(cd services/order-service && npm start > /tmp/order-service.log 2>&1 &)

# Czekanie na uruchomienie
sleep 2

# Uruchomienie Payment Service
echo "💳 Uruchamianie Payment Service (port 3005)..."
(cd services/payment-service && npm start > /tmp/payment-service.log 2>&1 &)

# Czekanie na uruchomienie
sleep 2

# Uruchomienie Notification Service
echo "📧 Uruchamianie Notification Service (port 3006)..."
(cd services/notification-service && npm start > /tmp/notification-service.log 2>&1 &)

# Czekanie na uruchomienie
sleep 2

# Uruchomienie Inventory Service
echo "📊 Uruchamianie Inventory Service (port 3007)..."
(cd services/inventory-service && npm start > /tmp/inventory-service.log 2>&1 &)

# Czekanie na uruchomienie
sleep 2

# Uruchomienie Analytics Service
echo "📈 Uruchamianie Analytics Service (port 3008)..."
(cd services/analytics-service && npm start > /tmp/analytics-service.log 2>&1 &)

# Czekanie na uruchomienie
sleep 2

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
sleep 15

# Sprawdzenie statusu
echo ""
echo "📊 Status serwisów:"
echo "===================="

# Test Auth Service
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Auth Service:         http://localhost:3001 ✓"
else
    echo "❌ Auth Service:         http://localhost:3001 ✗"
fi

# Test Product Service 
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ Product Service:      http://localhost:3002 ✓"
else
    echo "❌ Product Service:      http://localhost:3002 ✗"
fi

# Test Order Service
if curl -s http://localhost:3004/health > /dev/null; then
    echo "✅ Order Service:        http://localhost:3004 ✓"
else
    echo "❌ Order Service:        http://localhost:3004 ✗"
fi

# Test Payment Service
if curl -s http://localhost:3005/health > /dev/null; then
    echo "✅ Payment Service:      http://localhost:3005 ✓"
else
    echo "❌ Payment Service:      http://localhost:3005 ✗"
fi

# Test Notification Service
if curl -s http://localhost:3006/health > /dev/null; then
    echo "✅ Notification Service: http://localhost:3006 ✓"
else
    echo "❌ Notification Service: http://localhost:3006 ✗"
fi

# Test Inventory Service
if curl -s http://localhost:3007/health > /dev/null; then
    echo "✅ Inventory Service:    http://localhost:3007 ✓"
else
    echo "❌ Inventory Service:    http://localhost:3007 ✗"
fi

# Test Analytics Service
if curl -s http://localhost:3008/health > /dev/null; then
    echo "✅ Analytics Service:    http://localhost:3008 ✓"
else
    echo "❌ Analytics Service:    http://localhost:3008 ✗"
fi

# Test API Gateway
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ API Gateway:          http://localhost:3000 ✓"
else
    echo "❌ API Gateway:          http://localhost:3000 ✗"
fi

# Test Frontend
if curl -s http://localhost:3003 > /dev/null; then
    echo "✅ Frontend:             http://localhost:3003 ✓"
else
    echo "❌ Frontend:             http://localhost:3003 ✗"
fi

echo ""
echo "🎯 Dostępne adresy:"
echo "==================="
echo "🌐 Frontend (React):       http://localhost:3003"
echo "🚪 API Gateway:            http://localhost:3000"
echo "📖 Gateway Dokumentacja:   http://localhost:3000/api-docs"
echo ""
echo "🔐 Auth Service:           http://localhost:3001"
echo "📦 Product Service:        http://localhost:3002"
echo "🛒 Order Service:          http://localhost:3004"
echo "💳 Payment Service:        http://localhost:3005"
echo "📧 Notification Service:   http://localhost:3006"
echo "📊 Inventory Service:      http://localhost:3007"
echo "📈 Analytics Service:      http://localhost:3008"

echo ""
echo "📝 Logi serwisów:"
echo "=================="
echo "Auth Service:        tail -f /tmp/auth-service.log"
echo "Product Service:     tail -f /tmp/product-service.log"
echo "Order Service:       tail -f /tmp/order-service.log"
echo "Payment Service:     tail -f /tmp/payment-service.log"
echo "Notification Service: tail -f /tmp/notification-service.log"
echo "Inventory Service:   tail -f /tmp/inventory-service.log"
echo "Analytics Service:   tail -f /tmp/analytics-service.log"
echo "API Gateway:         tail -f /tmp/gateway.log"
echo "Frontend:            tail -f /tmp/frontend.log"

echo ""
echo "⚠️  Aby zatrzymać wszystkie serwisy, uruchom:"
echo "./stop-local.sh"
echo ""
echo "🚀 Aplikacja z 8 mikrousługami powinna być dostępna za chwilę!"