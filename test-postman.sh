#!/bin/bash

# 🧪 Test Mikrousług przez Newman (Postman CLI)
# Skrypt do uruchamiania testów automatyzacji e-commerce

echo "🚀 Uruchamianie testów Postman przez terminal..."
echo ""

# Kolory do outputu
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkcja sprawdzania czy serwisy działają
check_services() {
    echo -e "${BLUE}🔍 Sprawdzanie czy serwisy działają...${NC}"
    
    services=(
        "http://localhost:3000|API Gateway"
        "http://localhost:3001|Auth Service"
        "http://localhost:3002|Product Service"
        "http://localhost:3004|Order Service"
        "http://localhost:3005|Payment Service"
        "http://localhost:3003|Frontend"
    )
    
    for service in "${services[@]}"; do
        url=$(echo $service | cut -d'|' -f1)
        name=$(echo $service | cut -d'|' -f2)
        
        if curl -s --connect-timeout 3 --max-time 5 "$url/health" > /dev/null 2>&1; then
            echo -e "  ✅ ${GREEN}$name${NC} - działa"
        else
            echo -e "  ❌ ${RED}$name${NC} - nie działa"
            echo -e "${RED}Błąd: Uruchom system przed testami: ./start-local.sh${NC}"
            exit 1
        fi
    done
    echo ""
}

# Funkcja uruchamiania testów Newman
run_newman_tests() {
    local test_name="$1"
    local collection_path="$2"
    local environment_path="$3"
    local extra_args="$4"
    
    echo -e "${BLUE}🧪 Uruchamianie: $test_name${NC}"
    echo "Collection: $collection_path"
    echo "Environment: $environment_path"
    echo ""
    
    newman run "$collection_path" \
        -e "$environment_path" \
        --reporters cli,json \
        --reporter-json-export "test-results/$test_name-$(date +%Y%m%d-%H%M%S).json" \
        --delay-request 1000 \
        --timeout-request 30000 \
        $extra_args
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ $test_name - SUKCES${NC}"
    else
        echo -e "${RED}❌ $test_name - BŁĄD (kod: $exit_code)${NC}"
    fi
    echo ""
    return $exit_code
}

# Utworzenie folderu na wyniki testów
mkdir -p test-results

echo -e "${YELLOW}📋 Newman CLI dla mikrousług${NC}"
echo "=================================="

# Sprawdź serwisy
check_services

# Ścieżki do plików Postman
COLLECTION="docs/postman/mikrouslugi-collection.json"
ENVIRONMENT="docs/postman/mikrouslugi-environment.json"

if [ ! -f "$COLLECTION" ]; then
    echo -e "${RED}❌ Nie znaleziono kolekcji: $COLLECTION${NC}"
    exit 1
fi

if [ ! -f "$ENVIRONMENT" ]; then
    echo -e "${RED}❌ Nie znaleziono environment: $ENVIRONMENT${NC}"
    exit 1
fi

echo -e "${GREEN}📁 Pliki znalezione:${NC}"
echo "  Collection: $COLLECTION"
echo "  Environment: $ENVIRONMENT"
echo ""

# Menu wyboru testów
echo -e "${YELLOW}🎯 Wybierz rodzaj testów:${NC}"
echo "1. Authentication Tests"
echo "2. Products Tests"  
echo "3. Health Checks"
echo "4. All Tests (Full Suite)"
echo "5. Custom Test (podaj folder/request name)"
echo ""

read -p "Wybierz opcję (1-5): " choice

case $choice in
    1)
        echo -e "${BLUE}🔐 Authentication Tests${NC}"
        run_newman_tests "auth-tests" "$COLLECTION" "$ENVIRONMENT" "--folder Authentication"
        ;;
    2)
        echo -e "${BLUE}� Products Tests${NC}"
        run_newman_tests "products-tests" "$COLLECTION" "$ENVIRONMENT" "--folder Products"
        ;;
    3)
        echo -e "${BLUE}🏥 Health Checks${NC}"
        run_newman_tests "health-tests" "$COLLECTION" "$ENVIRONMENT" "--folder \"Health Checks\""
        ;;
    4)
        echo -e "${BLUE}🔥 All Tests (Full Suite)${NC}"
        run_newman_tests "full-suite" "$COLLECTION" "$ENVIRONMENT" ""
        ;;
    5)
        read -p "Podaj nazwę folderu lub request: " custom_name
        run_newman_tests "custom-$custom_name" "$COLLECTION" "$ENVIRONMENT" "--folder $custom_name"
        ;;
    *)
        echo -e "${RED}❌ Nieprawidłowa opcja${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Testy zakończone!${NC}"
echo -e "${BLUE}📊 Wyniki zapisane w: test-results/${NC}"
echo ""
echo -e "${YELLOW}💡 Przydatne komendy:${NC}"
echo "  newman run docs/postman/mikrouslugi-collection.json -e docs/postman/mikrouslugi-environment.json"
echo "  newman run docs/postman/mikrouslugi-collection.json -e docs/postman/mikrouslugi-environment.json --folder Authentication"
echo "  newman run docs/postman/mikrouslugi-collection.json -e docs/postman/mikrouslugi-environment.json --reporters cli,json"