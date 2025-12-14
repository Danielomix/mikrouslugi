@echo off
REM 🧪 Test Mikrousług przez Newman (Postman CLI) - Windows
REM Skrypt do uruchamiania testów automatyzacji e-commerce

echo 🚀 Uruchamianie testów Postman przez terminal...
echo.

REM Sprawdzanie czy serwisy działają
echo 🔍 Sprawdzanie czy serwisy działają...

powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000/health' -UseBasicParsing -TimeoutSec 3 | Out-Null; Write-Host '  ✅ API Gateway - działa' -ForegroundColor Green } catch { Write-Host '  ❌ API Gateway - nie działa' -ForegroundColor Red; exit 1 }"

powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3001/health' -UseBasicParsing -TimeoutSec 3 | Out-Null; Write-Host '  ✅ Auth Service - działa' -ForegroundColor Green } catch { Write-Host '  ❌ Auth Service - nie działa' -ForegroundColor Red }"

powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3002/health' -UseBasicParsing -TimeoutSec 3 | Out-Null; Write-Host '  ✅ Product Service - działa' -ForegroundColor Green } catch { Write-Host '  ❌ Product Service - nie działa' -ForegroundColor Red }"

powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3003' -UseBasicParsing -TimeoutSec 3 | Out-Null; Write-Host '  ✅ Frontend - działa' -ForegroundColor Green } catch { Write-Host '  ❌ Frontend - nie działa' -ForegroundColor Red }"

echo.

REM Sprawdzenie czy pliki istnieją
if not exist "docs\postman\mikrouslugi-collection.json" (
    echo ❌ Nie znaleziono kolekcji Postman
    pause
    exit 1
)

if not exist "docs\postman\mikrouslugi-environment.json" (
    echo ❌ Nie znaleziono environment Postman  
    pause
    exit 1
)

echo 📁 Pliki znalezione:
echo   Collection: docs\postman\mikrouslugi-collection.json
echo   Environment: docs\postman\mikrouslugi-environment.json
echo.

REM Utworzenie folderu na wyniki testów
if not exist "test-results" mkdir test-results

echo 🎯 Wybierz rodzaj testów:
echo 1. Quick Health Check
echo 2. Authentication Tests
echo 3. Complete E-commerce Workflow  
echo 4. All Tests (Full Suite)
echo 5. Manual Command
echo.

set /p choice="Wybierz opcję (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🏥 Quick Health Check
    newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json --folder "Authentication" --delay-request 1000
    goto :end
)

if "%choice%"=="2" (
    echo.
    echo 🔐 Authentication Tests
    newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json --folder "Authentication" --delay-request 1000 --reporters cli,json --reporter-json-export test-results\auth-tests.json
    goto :end
)

if "%choice%"=="3" (
    echo.
    echo 🛒 Complete E-commerce Workflow
    echo Uruchamianie pełnego workflow...
    echo.
    
    echo 🔐 1/4 Authentication...
    newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json --folder "Authentication" --delay-request 1000
    timeout /t 3 >nul
    
    echo 📦 2/4 Products...
    newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json --folder "Products" --delay-request 1000
    timeout /t 3 >nul
    
    echo 🛒 3/4 Orders...
    newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json --folder "Orders" --delay-request 1000
    timeout /t 3 >nul
    
    echo 💳 4/4 Payments...
    newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json --folder "Payments" --delay-request 1000
    
    goto :end
)

if "%choice%"=="4" (
    echo.
    echo 🔥 All Tests (Full Suite)
    newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json --delay-request 1000 --reporters cli,json --reporter-json-export test-results\full-suite.json
    goto :end
)

if "%choice%"=="5" (
    echo.
    echo 💡 Manual Commands:
    echo   newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json
    echo   newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json --folder "Authentication"
    echo   newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json --folder "Products"
    echo   newman run docs\postman\mikrouslugi-collection.json -e docs\postman\mikrouslugi-environment.json --reporters cli,json
    goto :end
)

echo ❌ Nieprawidłowa opcja
pause
exit 1

:end
echo.
echo 🎉 Testy zakończone!
echo 📊 Wyniki zapisane w: test-results\
echo.
pause