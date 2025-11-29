# 🏗️ Architektura Mikrousług

## Przegląd Systemu

Projekt implementuje architekturę mikrousług z następującymi komponentami:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Auth Service   │    │ Product Service │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 3002)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                       ┌─────────────────┐
                       │    MongoDB      │
                       │   (Port 27017)  │
                       └─────────────────┘
```

## 🔧 Komponenty Systemu

### 1. API Gateway (Port 3000)
**Technologie**: Express.js, http-proxy-middleware
**Funkcje**:
- Routing żądań do odpowiednich mikrousług
- Rate limiting i throttling
- CORS handling
- Unified Swagger documentation
- Health monitoring wszystkich serwisów
- Centralized logging

**Endpoints**:
- `/api/auth/*` → Auth Service
- `/api/products/*` → Product Service
- `/health` → Health checks
- `/api-docs` → Swagger documentation

### 2. Auth Service (Port 3001)
**Technologie**: Express.js, MongoDB, Mongoose, JWT, bcrypt
**Funkcje**:
- Rejestracja i logowanie użytkowników
- JWT token generation/validation
- Password hashing (bcrypt)
- User profile management
- Role-based authorization

**Modele**:
- **User**: _id, name, email, password, role, isActive, lastLogin

**Endpoints**:
- `POST /auth/register` - Rejestracja
- `POST /auth/login` - Logowanie
- `POST /auth/verify` - Weryfikacja tokenu
- `GET /auth/profile` - Profil użytkownika

### 3. Product Service (Port 3002)
**Technologie**: Express.js, MongoDB, Mongoose, axios
**Funkcje**:
- CRUD operations dla produktów
- Search i filtering
- Stock management
- Category management
- Integration z Auth Service

**Modele**:
- **Product**: _id, name, description, price, category, stock, sku, images, tags, isActive, createdBy

**Endpoints**:
- `GET /products` - Lista produktów z filtrowaniem
- `GET /products/:id` - Szczegóły produktu
- `POST /products` - Tworzenie (auth required)
- `PUT /products/:id` - Aktualizacja (auth required)
- `DELETE /products/:id` - Soft delete (auth required)

### 4. MongoDB Database
**Kolekcje**:
- `users` - Dane użytkowników (Auth Service)
- `products` - Katalog produktów (Product Service)

## 🔄 Przepływ Danych

### Autentykacja
```
Client → API Gateway → Auth Service → MongoDB
   ↓
JWT Token ← API Gateway ← Auth Service
```

### Operacje na produktach
```
Client + JWT → API Gateway → Product Service → Auth Service (verify)
                    ↓              ↓
                MongoDB ← Product Service
                    ↓
               Response → API Gateway → Client
```

## 🛡️ Bezpieczeństwo

### Authentication Flow
1. **Registration/Login**: Client → Auth Service
2. **Token Generation**: JWT z user info (id, email, role)
3. **Token Verification**: Product Service → Auth Service
4. **Authorization**: Role-based access control

### Security Features
- **Password Hashing**: bcrypt (salt rounds: 12)
- **JWT Tokens**: Signed with secret, expiration time
- **Rate Limiting**: Per IP, per endpoint
- **CORS Protection**: Configured origins
- **Helmet.js**: Security headers
- **Input Validation**: express-validator, Joi schemas
- **SQL Injection Prevention**: Mongoose ORM

## 📡 Inter-Service Communication

### Authentication Verification
```javascript
Product Service → HTTP POST → Auth Service /auth/verify
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, user: {...} }
```

### Service Discovery
- Hardcoded URLs w Docker Compose
- Environment variables per service
- Health check endpoints

## 🔍 Monitoring & Observability

### Health Checks
```
/health endpoints na każdym serwisie:
- Database connectivity
- Service dependencies
- Memory usage
- Uptime
```

### Logging
- **Morgan**: HTTP request logging
- **Winston**: Structured logging (shared utility)
- **Docker logs**: Container-level logging

### Error Handling
- Centralized error middleware
- Structured error responses
- Service-specific error codes

## 📊 Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  name: String (2-50 chars),
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum ['user', 'admin'],
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  _id: ObjectId,
  name: String (2-100 chars),
  description: String (1-1000 chars),
  price: Number (positive),
  category: Enum [categories],
  stock: Number (≥0),
  sku: String (unique, uppercase),
  images: [{ url: String, alt: String }],
  tags: [String],
  isActive: Boolean,
  createdBy: String (User ID),
  updatedBy: String (User ID),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment Architecture

### Docker Compose Setup
```yaml
services:
  mongodb:     # Database
  auth-service:    # Authentication
  product-service: # Product management  
  api-gateway:     # Request routing
```

### Networking
- **Bridge Network**: mikrouslugi-network
- **Service Discovery**: Docker DNS
- **Port Mapping**: Host → Container ports

### Volumes
- **MongoDB Data**: Persistent storage
- **Development**: Hot reload volumes

## 🔮 Future Enhancements

### Planned Features
- [ ] Redis cache integration
- [ ] Message queue (RabbitMQ/Apache Kafka)
- [ ] Elasticsearch logging
- [ ] Kubernetes deployment
- [ ] Service mesh (Istio)
- [ ] Distributed tracing
- [ ] Circuit breakers
- [ ] Config management service

### Scalability Considerations
- **Horizontal Scaling**: Multiple instances per service
- **Load Balancing**: Nginx/HAProxy
- **Database Sharding**: MongoDB replica sets
- **Caching Strategy**: Redis for session/data caching
- **CDN Integration**: Static assets delivery