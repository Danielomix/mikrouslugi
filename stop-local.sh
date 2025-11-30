#!/bin/bash

# Skrypt do zatrzymywania mikrousług lokalnie

echo "🛑 Zatrzymywanie mikrousług..."

# Zatrzymanie procesów Node.js
echo "🔪 Zatrzymywanie procesów Node.js..."
killall node 2>/dev/null || echo "Brak procesów Node.js do zatrzymania"

# Sprawdzenie czy porty są wolne
echo "🔍 Sprawdzanie czy porty są wolne..."
sleep 2

PORTS=(3000 3001 3002 3003 3004 3005 3006 3007 3008)
for port in "${PORTS[@]}"; do
    if lsof -i:$port > /dev/null 2>&1; then
        echo "⚠️  Port $port nadal zajęty - wymuszam zamknięcie"
        lsof -ti:$port | xargs kill -9 2>/dev/null
    else
        echo "✅ Port $port wolny"
    fi
done

# Czyszczenie logów
echo "🧹 Czyszczenie logów..."
rm -f /tmp/auth-service.log
rm -f /tmp/product-service.log
rm -f /tmp/order-service.log
rm -f /tmp/payment-service.log
rm -f /tmp/notification-service.log
rm -f /tmp/inventory-service.log
rm -f /tmp/analytics-service.log
rm -f /tmp/gateway.log
rm -f /tmp/frontend.log

echo ""
echo "✅ Wszystkie 8 mikrousług zostały zatrzymane!"
echo ""