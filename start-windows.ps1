# Windows PowerShell script to start all microservices
# Make sure MongoDB is running before executing this script

Write-Host "Starting Mikrouslugi E-commerce System on Windows..." -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
try {
    $mongoTest = mongo --eval "db.stats()" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "MongoDB connection failed"
    }
    Write-Host "MongoDB is running ✓" -ForegroundColor Green
} catch {
    Write-Host "ERROR: MongoDB is not running!" -ForegroundColor Red
    Write-Host "Please start MongoDB first:" -ForegroundColor Yellow
    Write-Host "  - As Service: net start MongoDB" -ForegroundColor Yellow  
    Write-Host "  - Manual: mongod --dbpath C:\data\db" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Create log directory if it doesn't exist
if (-not (Test-Path -Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
}

Write-Host "Starting all services..." -ForegroundColor Green
Write-Host ""

# Function to start service in new PowerShell window
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$Path,
        [string]$Command
    )
    
    Write-Host "Starting $ServiceName..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; $Command"
    Start-Sleep -Seconds 2
}

# Start all services
Start-Service "Auth Service" "services\auth-service" "npm run dev"
Start-Service "Product Service" "services\product-service" "npm run dev"  
Start-Service "Order Service" "services\order-service" "npm run dev"
Start-Service "Payment Service" "services\payment-service" "npm run dev"
Start-Service "Notification Service" "services\notification-service" "npm run dev"
Start-Service "Inventory Service" "services\inventory-service" "npm run dev"
Start-Service "Analytics Service" "services\analytics-service" "npm run dev"
Start-Service "API Gateway" "api-gateway" "npm run dev"

# Wait a bit more for API Gateway
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "Frontend:    http://localhost:3003" -ForegroundColor White
Write-Host "API Gateway: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Health Check: Invoke-WebRequest http://localhost:3000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")