#!/bin/bash

# Skrypt do zatrzymywania mikrousług lokalnie

echo "🛑 Zatrzymywanie mikrousług..."

# Zatrzymanie procesów Node.js
echo "🔪 Zatrzymywanie procesów Node.js..."
killall node 2>/dev/null || echo "Brak procesów Node.js do zatrzymania"

# Sprawdzenie czy porty są wolne
echo "🔍 Sprawdzanie czy porty są wolne..."
sleep 2

if lsof -i:3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 nadal zajęty"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
else
    echo "✅ Port 3000 wolny"
fi

if lsof -i:3001 > /dev/null 2>&1; then
    echo "⚠️  Port 3001 nadal zajęty"
    lsof -ti:3001 | xargs kill -9 2>/dev/null
else
    echo "✅ Port 3001 wolny"
fi

if lsof -i:3002 > /dev/null 2>&1; then
    echo "⚠️  Port 3002 nadal zajęty"
    lsof -ti:3002 | xargs kill -9 2>/dev/null
else
    echo "✅ Port 3002 wolny"
fi

if lsof -i:3003 > /dev/null 2>&1; then
    echo "⚠️  Port 3003 nadal zajęty"
    lsof -ti:3003 | xargs kill -9 2>/dev/null
else
    echo "✅ Port 3003 wolny"
fi

# Czyszczenie logów
echo "🧹 Czyszczenie logów..."
rm -f /tmp/auth-service.log
rm -f /tmp/product-service.log
rm -f /tmp/gateway.log
rm -f /tmp/frontend.log

echo ""
echo "✅ Wszystkie mikrousługi zostały zatrzymane!"
echo ""