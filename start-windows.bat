@echo off
REM Windows Batch script to start all microservices
REM Make sure MongoDB is running before executing this script

echo Starting Mikrouslugi E-commerce System on Windows...
echo.

REM Check if MongoDB is running
mongo --eval "db.stats()" >nul 2>&1
if errorlevel 1 (
    echo ERROR: MongoDB is not running!
    echo Please start MongoDB first:
    echo   - As Service: net start MongoDB
    echo   - Manual: mongod --dbpath C:\data\db
    pause
    exit /b 1
)

echo MongoDB is running ✓
echo.

REM Create log directory if it doesn't exist
if not exist logs mkdir logs

echo Starting all services...
echo.

REM Start Auth Service
echo Starting Auth Service...
start "Auth Service" cmd /k "cd services\auth-service && npm run dev"
timeout /t 2 /nobreak >nul

REM Start Product Service  
echo Starting Product Service...
start "Product Service" cmd /k "cd services\product-service && npm run dev"
timeout /t 2 /nobreak >nul

REM Start Order Service
echo Starting Order Service...
start "Order Service" cmd /k "cd services\order-service && npm run dev"  
timeout /t 2 /nobreak >nul

REM Start Payment Service
echo Starting Payment Service...
start "Payment Service" cmd /k "cd services\payment-service && npm run dev"
timeout /t 2 /nobreak >nul

REM Start Notification Service
echo Starting Notification Service...
start "Notification Service" cmd /k "cd services\notification-service && npm run dev"
timeout /t 2 /nobreak >nul

REM Start Inventory Service
echo Starting Inventory Service...
start "Inventory Service" cmd /k "cd services\inventory-service && npm run dev"
timeout /t 2 /nobreak >nul

REM Start Analytics Service
echo Starting Analytics Service...
start "Analytics Service" cmd /k "cd services\analytics-service && npm run dev"
timeout /t 2 /nobreak >nul

REM Start API Gateway
echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && npm run dev"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting React Frontend...
start "React Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo All services are starting...
echo.
echo URLs:
echo Frontend:    http://localhost:3003
echo API Gateway: http://localhost:3000
echo.
echo Health Check: curl http://localhost:3000/health
echo.
echo Press any key to continue...
pause >nul