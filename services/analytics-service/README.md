# 📊 Analytics Service

Serwis analityczny z raportowaniem, metrykami i insights dla całej platformy e-commerce.

## 📋 Funkcjonalności

- **Real-time analytics** - Metryki w czasie rzeczywistym
- **Business metrics** - KPI biznesowe i sprzedażowe
- **User behavior tracking** - Analiza zachowań użytkowników
- **Performance monitoring** - Monitoring wydajności serwisów
- **Custom dashboards** - Personalizowane dashboardy
- **Data aggregation** - Agregacja danych z wszystkich serwisów

## 🚀 Quick Start

```bash
# Instalacja zależności
npm install

# Uruchomienie serwisu
npm start

# Development mode
npm run dev
```

## 🌐 Endpoints

### **Analytics Dashboard**
- `GET /analytics/dashboard` - Główny dashboard
- `GET /analytics/summary` - Podsumowanie kluczowych metryk
- `GET /analytics/real-time` - Dane w czasie rzeczywistym

### **Business Metrics**
- `GET /analytics/sales` - Analiza sprzedaży
- `GET /analytics/revenue` - Analiza przychodów
- `GET /analytics/orders` - Statystyki zamówień
- `GET /analytics/products` - Analiza produktów
- `GET /analytics/customers` - Analiza klientów

### **Performance Metrics**
- `GET /analytics/services` - Metryki serwisów
- `GET /analytics/performance` - Wydajność systemu
- `GET /analytics/errors` - Analiza błędów
- `GET /analytics/uptime` - Dostępność serwisów

### **Reports**
- `GET /analytics/reports` - Lista dostępnych raportów
- `POST /analytics/reports` - Generowanie raportów
- `GET /analytics/reports/:id` - Pobranie raportu

### **Data Export**
- `GET /analytics/export/sales` - Export danych sprzedaży
- `GET /analytics/export/users` - Export danych użytkowników
- `POST /analytics/export/custom` - Custom export

## 🔧 Konfiguracja

### **Environment Variables** (`.env`)
```bash
NODE_ENV=development
PORT=3008
MONGODB_URI=mongodb://localhost:27017/mikrouslugi_analytics
JWT_SECRET=mikro-uslugi-super-secret-key-2025

# Data Sources
AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3000/api
PAYMENT_SERVICE_URL=http://localhost:3005
INVENTORY_SERVICE_URL=http://localhost:3007

# Analytics Configuration
AGGREGATION_INTERVAL=300000
RETENTION_DAYS=90
REAL_TIME_BUFFER=1000
```

## 🗄️ Database Schema

**Analytics Event Model:**
```javascript
{
  eventType: String,         // Typ zdarzenia
  service: String,           // Nazwa serwisu
  userId: ObjectId,          // ID użytkownika (optional)
  sessionId: String,         // ID sesji
  metadata: Object,          // Dodatkowe dane
  timestamp: Date,           // Czas zdarzenia
  processed: Boolean,        // Czy przetworzony
  createdAt: Date
}
```

**Daily Metrics Model:**
```javascript
{
  date: Date,                // Data (YYYY-MM-DD)
  metrics: {
    orders: {
      total: Number,
      completed: Number,
      cancelled: Number,
      revenue: Number
    },
    payments: {
      total: Number,
      completed: Number,
      failed: Number,
      amount: Number
    },
    users: {
      new: Number,
      active: Number,
      returning: Number
    },
    products: {
      viewed: Number,
      purchased: Number,
      top_sellers: [Object]
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Service Metrics Model:**
```javascript
{
  service: String,           // Nazwa serwisu
  date: Date,               // Data
  metrics: {
    requests: Number,        // Liczba żądań
    errors: Number,          // Liczba błędów
    avg_response_time: Number, // Średni czas odpowiedzi
    uptime: Number,          // Dostępność (%)
    memory_usage: Number,    // Zużycie pamięci
    cpu_usage: Number        // Zużycie CPU
  },
  createdAt: Date
}
```

## 📊 Kluczowe Metryki

### **Business KPIs**
```javascript
const BUSINESS_METRICS = {
  // Revenue
  totalRevenue: 'Całkowity przychód',
  dailyRevenue: 'Dzienny przychód',
  monthlyRevenue: 'Miesięczny przychód',
  
  // Orders
  totalOrders: 'Całkowita liczba zamówień',
  completionRate: 'Wskaźnik ukończenia zamówień',
  avgOrderValue: 'Średnia wartość zamówienia',
  
  // Products
  topProducts: 'Najpopularniejsze produkty',
  inventoryTurnover: 'Rotacja zapasów',
  outOfStock: 'Produkty niedostępne',
  
  // Users
  activeUsers: 'Aktywni użytkownicy',
  newUsers: 'Nowi użytkownicy',
  userRetention: 'Retencja użytkowników'
};
```

### **Technical Metrics**
```javascript
const TECHNICAL_METRICS = {
  // Performance
  responseTime: 'Czas odpowiedzi',
  throughput: 'Przepustowość',
  errorRate: 'Wskaźnik błędów',
  
  // Infrastructure
  uptime: 'Dostępność',
  memoryUsage: 'Zużycie pamięci',
  cpuUsage: 'Zużycie CPU'
};
```

## 🔍 API Examples

### **Dashboard Overview**
```bash
curl -X GET http://localhost:3008/analytics/dashboard \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### **Sales Analytics**
```bash
# Analiza sprzedaży za ostatnie 30 dni
curl -X GET "http://localhost:3008/analytics/sales?period=30d" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Revenue trend
curl -X GET "http://localhost:3008/analytics/revenue?groupBy=day&limit=7" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### **Real-time Metrics**
```bash
# Metryki w czasie rzeczywistym
curl -X GET http://localhost:3008/analytics/real-time \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Active users
curl -X GET http://localhost:3008/analytics/users/active \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### **Custom Report Generation**
```bash
curl -X POST http://localhost:3008/analytics/reports \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Sales Report",
    "type": "sales",
    "period": {
      "start": "2024-12-01",
      "end": "2024-12-31"
    },
    "filters": {
      "status": "completed",
      "minAmount": 100
    },
    "format": "pdf"
  }'
```

### **Data Export**
```bash
# Export sales data do CSV
curl -X GET "http://localhost:3008/analytics/export/sales?format=csv&period=30d" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  --output sales_report.csv
```

## 📈 Dashboard Endpoints

### **Main Dashboard**
```javascript
GET /analytics/dashboard
{
  "overview": {
    "totalRevenue": 125430.50,
    "totalOrders": 342,
    "activeUsers": 89,
    "completionRate": 94.2
  },
  "trends": {
    "revenue": [/* daily revenue for last 7 days */],
    "orders": [/* daily orders for last 7 days */],
    "users": [/* daily active users for last 7 days */]
  },
  "topProducts": [/* top 5 products */],
  "recentActivity": [/* last 10 events */]
}
```

### **Sales Analytics**
```javascript
GET /analytics/sales?period=30d
{
  "summary": {
    "totalSales": 89234.50,
    "orderCount": 245,
    "avgOrderValue": 364.22,
    "growthRate": 12.5
  },
  "daily": [
    {
      "date": "2024-12-13",
      "sales": 3245.50,
      "orders": 8,
      "avgValue": 405.69
    }
  ],
  "categories": [/* sales by category */],
  "topProducts": [/* best selling products */]
}
```

### **Performance Monitoring**
```javascript
GET /analytics/performance
{
  "services": [
    {
      "name": "auth-service",
      "status": "healthy",
      "uptime": 99.95,
      "avgResponseTime": 245,
      "errorRate": 0.1,
      "lastCheck": "2024-12-13T15:30:00Z"
    }
  ],
  "system": {
    "totalRequests": 125430,
    "successRate": 99.2,
    "avgResponseTime": 350,
    "peakHour": "14:00"
  }
}
```

## 🤖 Data Collection

### **Event Tracking**
```javascript
// Automatic event collection from services
const trackEvent = async (eventType, service, data) => {
  await AnalyticsEvent.create({
    eventType,
    service,
    userId: data.userId,
    sessionId: data.sessionId,
    metadata: data,
    timestamp: new Date()
  });
};

// Examples of tracked events
trackEvent('order_created', 'order-service', { orderId, amount, userId });
trackEvent('payment_completed', 'payment-service', { paymentId, amount });
trackEvent('product_viewed', 'product-service', { productId, userId });
```

### **Health Check Integration**
```javascript
// Collect service health metrics
const collectHealthMetrics = async () => {
  const services = ['auth', 'product', 'order', 'payment', 'inventory'];
  
  for (const service of services) {
    const health = await checkServiceHealth(service);
    await ServiceMetric.create({
      service,
      date: new Date(),
      metrics: {
        uptime: health.uptime,
        responseTime: health.responseTime,
        memoryUsage: health.memory,
        cpuUsage: health.cpu
      }
    });
  }
};
```

## 📊 Reports & Exports

### **Automated Reports**
```javascript
const REPORT_SCHEDULES = {
  daily: {
    time: '08:00',
    reports: ['daily_summary', 'service_health']
  },
  weekly: {
    day: 'monday',
    time: '09:00',
    reports: ['weekly_sales', 'user_activity']
  },
  monthly: {
    day: 1,
    time: '10:00',
    reports: ['monthly_revenue', 'product_performance']
  }
};
```

### **Export Formats**
- **CSV** - Dane tabelaryczne
- **JSON** - Structured data
- **PDF** - Formatted reports
- **Excel** - Spreadsheets

## 🔄 Integration Points

### **Service Integrations**
```javascript
// Collect data from all services
const DATA_SOURCES = {
  auth: {
    endpoint: '/health',
    metrics: ['active_users', 'registrations', 'logins']
  },
  product: {
    endpoint: '/analytics',
    metrics: ['views', 'purchases', 'inventory']
  },
  order: {
    endpoint: '/metrics',
    metrics: ['orders', 'revenue', 'completion_rate']
  },
  payment: {
    endpoint: '/stats',
    metrics: ['payments', 'success_rate', 'revenue']
  }
};
```

### **Real-time Updates**
```javascript
// WebSocket integration for real-time updates
io.on('connection', (socket) => {
  // Send real-time metrics
  setInterval(() => {
    socket.emit('metrics_update', {
      activeUsers: getActiveUsers(),
      currentRevenue: getCurrentRevenue(),
      systemStatus: getSystemStatus()
    });
  }, 5000);
});
```

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3008/health
```

### **System Status**
```bash
# Overall system health
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3008/analytics/system/status

# Service availability
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3008/analytics/services/availability
```

### **Performance Metrics**
```bash
# Response time trends
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3008/analytics/performance?metric=response_time&period=24h"

# Error rate analysis
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3008/analytics/errors?period=7d"
```

## 🚨 Error Handling

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (report/metric not found)
- `422` - Unprocessable Entity (invalid date range)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## 🔧 Troubleshooting

### **Missing Data**
```bash
# Check data collection status
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3008/analytics/status/collection

# Verify service connections
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3008/analytics/status/services
```

### **Performance Issues**
```bash
# Check aggregation status
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3008/analytics/status/aggregation

# Monitor processing queue
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3008/analytics/queue/status
```

### **Report Generation**
```bash
# Check report queue
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3008/analytics/reports/queue

# Retry failed reports
curl -X POST http://localhost:3008/analytics/reports/retry \
  -H "Authorization: Bearer $TOKEN"
```

## 🛡️ Security

- **JWT Authentication** - Secure access to analytics
- **Role-based Access** - Different levels for users/admins
- **Data Privacy** - Anonymized sensitive data
- **Rate Limiting** - Prevent data extraction abuse
- **Audit Logging** - Track access to analytics data

## 🎯 Future Enhancements

- **Machine Learning** - Predictive analytics
- **Custom Alerts** - Threshold-based notifications
- **Data Visualization** - Interactive charts
- **API Rate Analytics** - Detailed API usage metrics
- **Customer Segmentation** - Advanced user analytics
- **Anomaly Detection** - Automatic issue detection

---

**Port**: 3008  
**Database**: `mikrouslugi_analytics`  
**Collections**: `events`, `daily_metrics`, `service_metrics`, `reports`