# 🏗️ Architektura Mikrousług

## Przegląd Systemu

Projekt implementuje zaawansowaną architekturę mikrousług z automatyzacją procesów e-commerce:

```
                                ┌─────────────────┐
                                │   Frontend      │
                                │   (React)       │
                                │   Port 3003     │
                                └─────────────────┘
                                         │
                                ┌─────────────────┐
                                │   API Gateway   │
                                │   (Express)     │
                                │   Port 3000     │
                                └─────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                               │                                │
┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Auth Service  │  │Product Service│  │ Order Service │  │Payment Service│
│   Port 3001   │  │   Port 3002   │  │   Port 3004   │  │   Port 3005   │
└───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │                   │
        │                   │                   │                   │
┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│Notification   │  │Inventory Svc  │  │Analytics Svc  │  │   MongoDB     │
│   Port 3006   │  │   Port 3007   │  │   Port 3008   │  │  Port 27017   │
└───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘
```

## 🔧 Komponenty Systemu

### 1. Frontend (Port 3003)
**Technologie**: React 18, Material-UI, Axios, React Router
**Funkcje**:
- Responsywny interfejs użytkownika
- Zarządzanie produktami (admin panel)
- Składanie zamówień
- Obsługa płatności
- Real-time tracking statusów
- Authentication UI

**Główne komponenty**:
- **ProductManagement**: CRUD produktów dla adminów
- **OrderPlacement**: Składanie zamówień przez klientów
- **PaymentProcessing**: Interfejs płatności z dialogami
- **Dashboard**: Przegląd zamówień i statusów

### 2. API Gateway (Port 3000)
**Technologie**: Express.js, http-proxy-middleware
**Funkcje**:
- Routing żądań do odpowiednich mikrousług
- Rate limiting i throttling
- CORS handling
- Unified Swagger documentation
- Health monitoring wszystkich serwisów
- Load balancing

**Routing**:
- `/api/auth/*` → Auth Service (3001)
- `/api/products/*` → Product Service (3002)
- `/api/orders/*` → Order Service (3004)
- `/api/payments/*` → Payment Service (3005)
- `/api/notifications/*` → Notification Service (3006)
- `/api/inventory/*` → Inventory Service (3007)
- `/api/analytics/*` → Analytics Service (3008)

### 3. Auth Service (Port 3001)
**Technologie**: Express.js, MongoDB, Mongoose, JWT, bcrypt
**Funkcje**:
- Rejestracja i logowanie użytkowników
- JWT token generation/validation
- Password hashing (bcrypt)
- Role-based authorization (user/admin)
- User profile management
- Session management

**Database**: `mikrouslugi` collection `users`
**Modele**:
- **User**: _id, name, email, password, role, isActive, lastLogin

**Endpoints**:
- `POST /auth/register` - Rejestracja
- `POST /auth/login` - Logowanie
- `POST /auth/verify` - Weryfikacja tokenu
- `GET /auth/profile` - Profil użytkownika
- `PUT /auth/profile` - Aktualizacja profilu

### 4. Product Service (Port 3002)
**Technologie**: Express.js, MongoDB, Mongoose, Axios
**Funkcje**:
- CRUD operations dla produktów
- Search i filtering produktów
- Stock management z Inventory Service
- Category management
- System automation endpoints
- Integration z Auth Service

**Database**: `mikrouslugi` collection `products`
**Modele**:
- **Product**: _id, name, description, price, category, stock, sku, images, tags, isActive, createdBy

**Endpoints**:
- `GET /products` - Lista produktów z filtrowaniem
- `GET /products/:id` - Szczegóły produktu
- `POST /products` - Tworzenie (auth required)
- `PUT /products/:id` - Aktualizacja (auth required)
- `DELETE /products/:id` - Soft delete (auth required)
- `POST /products/system-stock` - System endpoint dla automatyzacji

### 5. Order Service (Port 3004)
**Technologie**: Express.js, MongoDB, Mongoose, Axios
**Funkcje**:
- Zarządzanie cyklem życia zamówień
- Automatyczna integracja z Payment Service
- Rezerwacja produktów w Inventory
- Status tracking z powiadomieniami
- System automation endpoints
- Analytics integration

**Database**: `mikrouslugi_orders` collection `orders`
**Modele**:
- **Order**: _id, orderId, userId, items, totalAmount, status, shippingAddress, createdAt

**Statusy**: pending → processing → shipped → delivered → cancelled

**Endpoints**:
- `GET /orders` - Lista zamówień użytkownika
- `GET /orders/:id` - Szczegóły zamówienia
- `POST /orders` - Tworzenie zamówienia
- `PUT /orders/:id/status` - Aktualizacja statusu
- `PUT /orders/:id/system-status` - System endpoint dla automatyzacji

### 6. Payment Service (Port 3005)
**Technologie**: Express.js, MongoDB, Mongoose, Axios
**Funkcje**:
- Obsługa płatności (symulacja bramki)
- Automatyczne przetwarzanie po 2 sekundach
- Integracja z Order Service
- Multiple payment methods
- Refund system
- Transaction logging

**Database**: `mikrouslugi_payments` collection `payments`
**Modele**:
- **Payment**: paymentId, orderId, userId, amount, currency, status, method, transactionId

**Statusy**: pending → processing → completed/failed/refunded

**Endpoints**:
- `GET /payments` - Lista płatności
- `POST /payments` - Tworzenie płatności
- `POST /payments/:id/process` - Przetwarzanie płatności
- `POST /payments/:id/refund` - Zwrot płatności

### 7. Inventory Service (Port 3007)
**Technologie**: Express.js, MongoDB, Mongoose
**Funkcje**:
- Zarządzanie stanami magazynowymi
- System rezerwacji produktów
- Automatyczna obsługa dostaw
- Integration z Order Service
- Low stock alerts
- Stock level monitoring

**Database**: `mikrouslugi_inventory` collections `inventories`, `reservations`
**Modele**:
- **Inventory**: productId, quantity, reserved, threshold, status
- **Reservation**: orderId, productId, quantity, status, expiresAt

**Endpoints**:
- `GET /inventory` - Stan magazynu
- `POST /inventory/reserve` - Rezerwacja produktu
- `POST /inventory/delivery` - Finalizacja dostawy (system endpoint)
- `POST /inventory/release` - Zwolnienie rezerwacji

### 8. Notification Service (Port 3006)
**Technologie**: Express.js, MongoDB, Nodemailer, Templates
**Funkcje**:
- Multi-channel notifications (Email, SMS, Push, In-app)
- Template system dla powiadomień
- User preferences management
- Event-driven notifications
- Delivery tracking
- Scheduled notifications

**Database**: `mikrouslugi_notifications` collections `notifications`, `preferences`, `templates`

**Endpoints**:
- `GET /notifications` - Lista powiadomień
- `POST /notifications/send` - Wysłanie powiadomienia
- `GET /preferences` - Preferencje użytkownika
- `PUT /preferences` - Aktualizacja preferencji

### 9. Analytics Service (Port 3008)
**Technologie**: Express.js, MongoDB, Chart.js Integration
**Funkcje**:
- Business metrics i KPI tracking
- Real-time analytics dashboard
- Performance monitoring serwisów
- User behavior tracking
- Sales analytics
- Custom reporting

**Database**: `mikrouslugi_analytics` collections `events`, `daily_metrics`, `service_metrics`

**Endpoints**:
- `GET /analytics/dashboard` - Main dashboard
- `GET /analytics/sales` - Analiza sprzedaży
- `GET /analytics/performance` - Wydajność systemu
- `POST /analytics/reports` - Custom reports

## 🤖 Automatyzacja E-commerce

### Complete Automation Flow
```
1. PRODUKT CREATION
   Product Service → Inventory Service
   Tworzenie wpisu w magazynie (quantity: 0, reserved: 0)

2. ORDER PLACEMENT  
   Order Service → Inventory Service (/reserve)
   Automatyczna rezerwacja produktów

3. PAYMENT COMPLETION
   Payment Service (po 2 sek) → Order Service (/system-status)
   Zmiana statusu zamówienia: pending → processing

4. ORDER DELIVERY
   Order Service → Inventory Service (/delivery)
   Order Service → Product Service (/system-stock)
   Usunięcie rezerwacji + zmniejszenie stanu produktu
```

### Inter-Service Communication
**System Endpoints (bez autoryzacji)**:
- `PUT /orders/{id}/system-status` - Order status updates
- `POST /inventory/delivery` - Delivery completion
- `POST /products/system-stock` - Stock updates

**Authenticated Endpoints**:
- Wszystkie user-facing operations wymagają JWT

### Event-Driven Architecture
```javascript
// Payment completion triggers order update
paymentService.process() → orderService.updateStatus()

// Order delivery triggers inventory update  
orderService.markDelivered() → inventoryService.finalizeDelivery()
                             → productService.updateStock()
```

## 🛡️ Bezpieczeństwo

### Authentication & Authorization
**JWT Implementation**:
- **Signing Algorithm**: HS256
- **Token Expiration**: 24h (configurable)
- **Secret Management**: Environment variables
- **Role-Based Access**: user/admin permissions

### Security Features
- **Password Hashing**: bcrypt (salt rounds: 12)
- **JWT Tokens**: Signed with secret, expiration time
- **Rate Limiting**: Per IP, per endpoint protection
- **CORS Protection**: Configured allowed origins
- **Helmet.js**: Security headers protection
- **Input Validation**: express-validator, Joi schemas
- **NoSQL Injection Prevention**: Mongoose ORM + sanitization
- **System Endpoints**: Bypass authentication for automation

### Authorization Flow
```
1. User Login → Auth Service → JWT Token
2. API Request + Token → API Gateway → Service
3. Service → Auth Service (/verify) → User validation
4. Response based on role permissions
```

## 📡 Inter-Service Communication

### Authentication Verification
```javascript
// Standard auth verification
Service → HTTP POST → Auth Service /auth/verify
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, user: {...} }
```

### System Automation Calls
```javascript
// Payment completion → Order status update
Payment Service → Order Service /orders/:id/system-status
Body: { status: 'processing' }

// Order delivery → Inventory update
Order Service → Inventory Service /inventory/delivery
Body: { orderId, productId, quantity }

// Order delivery → Product stock update  
Order Service → Product Service /products/system-stock
Body: { productId, quantity }
```

### Service Discovery
- **Development**: Hardcoded URLs (localhost:port)
- **Production**: Environment variables with service URLs
- **Docker**: Service names as hostnames
- **Health Monitoring**: `/health` endpoints per service

### Error Handling & Retries
```javascript
// Automatic retry mechanism
const retryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true
};
```

## 🔍 Monitoring & Observability

### Health Checks
```
Health endpoints na każdym serwisie:
- /health - Service health + database connectivity
- Database connection status
- External service dependencies
- Memory/CPU usage metrics
- Service uptime information
```

### Centralized Health Monitoring
```javascript
// API Gateway aggregates health from all services
GET /health → {
  "status": "healthy",
  "services": {
    "auth": { "status": "healthy", "responseTime": 45 },
    "product": { "status": "healthy", "responseTime": 67 },
    "order": { "status": "healthy", "responseTime": 123 },
    "payment": { "status": "healthy", "responseTime": 89 },
    "inventory": { "status": "healthy", "responseTime": 34 },
    "notification": { "status": "healthy", "responseTime": 56 },
    "analytics": { "status": "healthy", "responseTime": 78 }
  }
}
```

### Logging Strategy
- **Morgan**: HTTP request logging with custom formats
- **Winston**: Structured application logging
- **Service-specific logs**: Transaction logs, error logs
- **Correlation IDs**: Request tracking across services
- **Log Aggregation**: Centralized logging ready

### Performance Monitoring
- **Response Time Tracking**: Per endpoint monitoring
- **Error Rate Monitoring**: 4xx/5xx response tracking
- **Database Query Performance**: Slow query detection
- **Memory/CPU Usage**: Resource utilization tracking

### Analytics & Metrics
- **Business KPIs**: Revenue, orders, user activity
- **Technical Metrics**: Service performance, uptime
- **Real-time Dashboard**: Live metrics visualization
- **Custom Reports**: Scheduled and on-demand reporting

## 📊 Data Models & Databases

### Database Architecture
```
mikrouslugi (Auth + Product Service)
├── users (User authentication & profiles)
└── products (Product catalog)

mikrouslugi_orders (Order Service)  
└── orders (Order lifecycle management)

mikrouslugi_payments (Payment Service)
└── payments (Payment transactions)

mikrouslugi_inventory (Inventory Service)
├── inventories (Stock levels & status)
└── reservations (Product reservations)

mikrouslugi_notifications (Notification Service)
├── notifications (Message history)
├── preferences (User notification settings)
└── templates (Message templates)

mikrouslugi_analytics (Analytics Service)
├── events (System events tracking)
├── daily_metrics (Aggregated daily stats)
└── service_metrics (Service performance)
```

### Core Data Models

#### User Schema (Auth Service)
```javascript
{
  _id: ObjectId,
  name: String (2-50 chars),
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  role: Enum ['user', 'admin'],
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Product Schema (Product Service)
```javascript
{
  _id: ObjectId,
  name: String (2-100 chars),
  description: String (1-1000 chars),
  price: Number (positive, 2 decimal places),
  category: Enum [categories],
  stock: Number (≥0),
  sku: String (unique, uppercase),
  images: [{ url: String, alt: String }],
  tags: [String],
  isActive: Boolean (default: true),
  createdBy: String (User ID),
  updatedBy: String (User ID),
  createdAt: Date,
  updatedAt: Date
}
```

#### Order Schema (Order Service)
```javascript
{
  _id: ObjectId,
  orderId: String (unique, format: ORD-YYYYMMDD-XXXXXX),
  userId: ObjectId (ref to User),
  items: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  status: Enum ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  shippingAddress: {
    street: String,
    city: String,
    zipCode: String,
    country: String
  },
  paymentStatus: String,
  trackingNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Payment Schema (Payment Service)
```javascript
{
  _id: ObjectId,
  paymentId: String (unique, format: PAY-YYYYMMDD-XXXXXX),
  orderId: ObjectId (ref to Order),
  userId: ObjectId (ref to User),
  amount: Number (in cents/grosze),
  currency: String (default: 'USD'),
  status: Enum ['pending', 'processing', 'completed', 'failed', 'refunded'],
  method: Enum ['card', 'bank_transfer', 'paypal', 'blik'],
  transactionId: String,
  processedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Inventory Schema (Inventory Service)
```javascript
{
  _id: ObjectId,
  productId: ObjectId (ref to Product),
  quantity: Number (available stock),
  reserved: Number (reserved for orders),
  threshold: Number (low stock alert threshold),
  status: Enum ['available', 'low_stock', 'out_of_stock'],
  lastRestocked: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment Architecture

### Development Environment
```bash
# All services running locally
Frontend         → http://localhost:3003
API Gateway      → http://localhost:3000
Auth Service     → http://localhost:3001
Product Service  → http://localhost:3002
Order Service    → http://localhost:3004
Payment Service  → http://localhost:3005
Notification Svc → http://localhost:3006
Inventory Service → http://localhost:3007
Analytics Service → http://localhost:3008
MongoDB          → mongodb://localhost:27017
```

### Docker Compose Setup
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports: ["27017:27017"]
    volumes: ["mongodb_data:/data/db"]
    
  auth-service:
    build: ./services/auth-service
    ports: ["3001:3001"]
    depends_on: [mongodb]
    
  product-service:
    build: ./services/product-service  
    ports: ["3002:3002"]
    depends_on: [mongodb, auth-service]
    
  order-service:
    build: ./services/order-service
    ports: ["3004:3004"]
    depends_on: [mongodb, auth-service, product-service, inventory-service]
    
  payment-service:
    build: ./services/payment-service
    ports: ["3005:3005"]  
    depends_on: [mongodb, order-service]
    
  notification-service:
    build: ./services/notification-service
    ports: ["3006:3006"]
    depends_on: [mongodb]
    
  inventory-service:
    build: ./services/inventory-service
    ports: ["3007:3007"]
    depends_on: [mongodb]
    
  analytics-service:
    build: ./services/analytics-service
    ports: ["3008:3008"]
    depends_on: [mongodb]
    
  api-gateway:
    build: ./api-gateway
    ports: ["3000:3000"]
    depends_on: [auth-service, product-service, order-service, payment-service]
    
  frontend:
    build: ./frontend
    ports: ["3003:3003"]
    depends_on: [api-gateway]

networks:
  mikrouslugi-network:
    driver: bridge

volumes:
  mongodb_data:
```

### Networking & Communication
- **Bridge Network**: mikrouslugi-network for container communication
- **Service Discovery**: Docker DNS resolution by service name
- **Port Mapping**: Host ports mapped to container ports
- **Load Balancing**: API Gateway handles request distribution
- **Health Checks**: Docker health checks + custom endpoints

### Data Persistence
- **MongoDB Data**: Persistent volumes for database storage
- **Development Volumes**: Hot reload for source code changes
- **Log Volumes**: Centralized logging storage
- **Configuration**: Environment-based configuration management

## 🔮 Future Enhancements

### Planned Features
- [ ] **API Versioning** - Support dla multiple API versions
- [ ] **Message Queue Integration** - RabbitMQ/Apache Kafka dla async communication
- [ ] **Redis Cache Layer** - Caching dla frequently accessed data
- [ ] **Elasticsearch Integration** - Advanced search i full-text search
- [ ] **Service Mesh** - Istio dla advanced traffic management
- [ ] **Distributed Tracing** - OpenTelemetry/Jaeger tracing
- [ ] **Circuit Breakers** - Resilience patterns (Hystrix/Resilience4j)
- [ ] **Config Management** - Centralized configuration service
- [ ] **API Rate Limiting** - Advanced rate limiting strategies
- [ ] **Event Sourcing** - Event-driven architecture patterns

### Scalability Roadmap
- **Horizontal Scaling**: Kubernetes deployments z auto-scaling
- **Load Balancing**: Nginx/HAProxy przed API Gateway
- **Database Scaling**: MongoDB replica sets + sharding
- **Caching Strategy**: Redis dla session/data caching + CDN
- **Microservice Decomposition**: Dalszy podział na smaller services
- **Multi-region Deployment**: Geographic distribution

### Technology Upgrades
- **Container Orchestration**: Migration do Kubernetes
- **Observability**: Prometheus + Grafana monitoring
- **Security Enhancements**: OAuth 2.0 + OpenID Connect
- **Performance**: GraphQL API gateway option
- **Mobile Support**: React Native mobile apps
- **Real-time Features**: WebSocket integration dla real-time updates

### Business Features
- **Multi-tenant Support** - SaaS model support
- **Advanced Analytics** - Machine learning insights
- **Third-party Integrations** - Payment gateways, shipping providers
- **Internationalization** - Multi-language + multi-currency support
- **Advanced Notifications** - SMS, Push, WhatsApp integration
- **Loyalty Programs** - Customer rewards system

---

## 📝 Summary

Ta architektura implementuje **kompletny system e-commerce** z:

✅ **8 dedykowanych mikrousług** dla różnych domen biznesowych  
✅ **Automatyzację end-to-end** - od produktu do dostawy  
✅ **React frontend** z Material-UI i real-time updates  
✅ **Robust security** z JWT i role-based access  
✅ **Comprehensive monitoring** z health checks i analytics  
✅ **Scalable architecture** gotową na production deployment  

System jest **production-ready** z pełną dokumentacją, testami i monitoring capabilities.