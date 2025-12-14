# 📧 Notification Service

Serwis powiadomień z obsługą różnych kanałów komunikacji i automatycznych notyfikacji.

## 📋 Funkcjonalności

- **Multi-channel notifications** - Email, SMS, Push, In-app
- **Template system** - Szablony powiadomień
- **Event-driven notifications** - Automatyczne powiadomienia
- **User preferences** - Preferencje użytkowników
- **Notification history** - Historia wysłanych powiadomień
- **Delivery tracking** - Śledzenie doręczeń

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

### **Chronione (wymagają JWT)**
- `GET /notifications` - Lista powiadomień użytkownika
- `GET /notifications/:id` - Szczegóły powiadomienia
- `POST /notifications/send` - Wysłanie powiadomienia
- `PUT /notifications/:id/read` - Oznacz jako przeczytane
- `DELETE /notifications/:id` - Usuń powiadomienie

### **User Preferences**
- `GET /preferences` - Preferencje użytkownika
- `PUT /preferences` - Aktualizacja preferencji

### **Templates**
- `GET /templates` - Lista szablonów
- `POST /templates` - Utworzenie szablonu (admin)

### **System**
- `GET /health` - Health check serwisu

## 📨 Typy powiadomień

### **Order Notifications**
- `order_created` - Zamówienie utworzone
- `order_confirmed` - Zamówienie potwierdzone
- `order_processing` - Zamówienie w trakcie
- `order_shipped` - Zamówienie wysłane
- `order_delivered` - Zamówienie dostarczone
- `order_cancelled` - Zamówienie anulowane

### **Payment Notifications**
- `payment_pending` - Płatność oczekuje
- `payment_completed` - Płatność zakończona
- `payment_failed` - Płatność nieudana
- `payment_refunded` - Zwrot płatności

### **System Notifications**
- `account_created` - Konto utworzone
- `password_reset` - Reset hasła
- `low_stock` - Niski stan magazynu
- `system_maintenance` - Konserwacja systemu

## 🔧 Konfiguracja

### **Environment Variables** (`.env`)
```bash
NODE_ENV=development
PORT=3006
MONGODB_URI=mongodb://localhost:27017/mikrouslugi_notifications
JWT_SECRET=mikro-uslugi-super-secret-key-2025

# Email Configuration
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@mikrouslugi.com

# SMS Configuration (Future)
SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=your-account-sid
SMS_AUTH_TOKEN=your-auth-token

# Push Notifications (Future)
FIREBASE_SERVER_KEY=your-firebase-key
```

### **Notification Channels**
```javascript
const CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app'
};

const PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};
```

## 🗄️ Database Schema

**Notification Model:**
```javascript
{
  userId: ObjectId,          // ID odbiorcy
  type: String,              // Typ powiadomienia
  channel: String,           // Kanał wysyłki
  title: String,             // Tytuł powiadomienia
  message: String,           // Treść powiadomienia
  data: Object,              // Dodatkowe dane
  status: String,            // Status: pending, sent, delivered, failed, read
  priority: String,          // Priorytet: low, normal, high, urgent
  scheduledFor: Date,        // Zaplanowane wysłanie
  sentAt: Date,              // Data wysłania
  deliveredAt: Date,         // Data doręczenia
  readAt: Date,              // Data przeczytania
  failureReason: String,     // Powód niepowodzenia
  retryCount: Number,        // Liczba prób
  createdAt: Date,
  updatedAt: Date
}
```

**UserPreferences Model:**
```javascript
{
  userId: ObjectId,          // ID użytkownika
  preferences: {
    email: {
      enabled: Boolean,
      types: [String]        // Typy powiadomień
    },
    sms: {
      enabled: Boolean,
      types: [String]
    },
    push: {
      enabled: Boolean,
      types: [String]
    },
    in_app: {
      enabled: Boolean,
      types: [String]
    }
  },
  timezone: String,          // Strefa czasowa
  language: String,          // Język
  quietHours: {
    enabled: Boolean,
    start: String,           // HH:mm
    end: String              // HH:mm
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Template Model:**
```javascript
{
  name: String,              // Nazwa szablonu
  type: String,              // Typ powiadomienia
  channel: String,           // Kanał
  subject: String,           // Temat (dla email)
  body: String,              // Treść z placeholderami
  variables: [String],       // Lista dostępnych zmiennych
  language: String,          // Język szablonu
  isActive: Boolean,         // Czy aktywny
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 API Examples

### **Lista powiadomień**
```bash
curl -X GET http://localhost:3006/notifications \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### **Wysłanie powiadomienia**
```bash
curl -X POST http://localhost:3006/notifications/send \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "type": "order_created",
    "channel": "email",
    "title": "Zamówienie zostało utworzone",
    "message": "Twoje zamówienie #12345 zostało pomyślnie utworzone.",
    "data": {
      "orderId": "12345",
      "amount": 299.99
    },
    "priority": "normal"
  }'
```

### **Preferencje użytkownika**
```bash
# Pobierz preferencje
curl -X GET http://localhost:3006/preferences \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Aktualizuj preferencje
curl -X PUT http://localhost:3006/preferences \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "email": {
        "enabled": true,
        "types": ["order_created", "payment_completed"]
      },
      "sms": {
        "enabled": false,
        "types": []
      }
    },
    "timezone": "Europe/Warsaw",
    "language": "pl"
  }'
```

### **Oznacz jako przeczytane**
```bash
curl -X PUT http://localhost:3006/notifications/<NOTIFICATION_ID>/read \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 📧 Email Templates

### **Order Created Template**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Zamówienie utworzone</title>
</head>
<body>
  <h2>Dziękujemy za zamówienie!</h2>
  <p>Twoje zamówienie #{{orderId}} zostało pomyślnie utworzone.</p>
  
  <div class="order-details">
    <h3>Szczegóły zamówienia:</h3>
    <p><strong>Numer:</strong> {{orderId}}</p>
    <p><strong>Kwota:</strong> {{amount}} {{currency}}</p>
    <p><strong>Data:</strong> {{createdAt}}</p>
  </div>
  
  <p>Status zamówienia możesz sprawdzić <a href="{{orderUrl}}">tutaj</a>.</p>
</body>
</html>
```

### **Payment Completed Template**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Płatność potwierdzona</title>
</head>
<body>
  <h2>Płatność została potwierdzona</h2>
  <p>Płatność za zamówienie #{{orderId}} została pomyślnie przetworzona.</p>
  
  <div class="payment-details">
    <h3>Szczegóły płatności:</h3>
    <p><strong>Kwota:</strong> {{amount}} {{currency}}</p>
    <p><strong>Metoda:</strong> {{paymentMethod}}</p>
    <p><strong>ID transakcji:</strong> {{transactionId}}</p>
  </div>
</body>
</html>
```

## 🤖 Event Integration

### **Automatic Notifications**
```javascript
// Integracja z Order Service
app.post('/webhook/order-status', (req, res) => {
  const { orderId, status, userId } = req.body;
  
  // Automatyczne powiadomienie o zmianie statusu
  await sendNotification({
    userId,
    type: `order_${status}`,
    channel: 'email',
    data: { orderId, status }
  });
});
```

### **Payment Webhooks**
```javascript
// Integracja z Payment Service
app.post('/webhook/payment-status', (req, res) => {
  const { paymentId, status, userId, orderId } = req.body;
  
  await sendNotification({
    userId,
    type: `payment_${status}`,
    channel: 'email',
    data: { paymentId, orderId, status }
  });
});
```

## 💡 Features

### **Smart Delivery**
- **User preferences** - Respect user notification preferences
- **Quiet hours** - Skip notifications during quiet hours
- **Channel fallback** - Try alternative channels if primary fails
- **Retry mechanism** - Automatic retries for failed notifications

### **Template Engine**
```javascript
// Dynamic template rendering
function renderTemplate(template, data) {
  return template.body.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}
```

### **Batch Processing**
```javascript
// Send notifications in batches
async function sendBatchNotifications(notifications) {
  const batches = chunkArray(notifications, 50);
  
  for (const batch of batches) {
    await Promise.all(batch.map(sendSingleNotification));
    await sleep(1000); // Rate limiting
  }
}
```

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3006/health
```

### **Notification Stats**
```bash
# Statistics
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/notifications/stats

# Failed notifications
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3006/notifications?status=failed"
```

### **Delivery Reports**
```bash
# Daily delivery report
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/reports/daily

# Channel performance
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/reports/channels
```

## 🔄 Integration Points

### **Z Order Service**
- Powiadomienia o statusach zamówień
- Webhooks przy zmianie statusu

### **Z Payment Service**
- Powiadomienia o płatnościach
- Potwierdzenia transakcji

### **Z User Service**
- Powiadomienia o koncie
- Preferencje użytkowników

### **Z Inventory Service**
- Alerty o niskich stanach
- Powiadomienia o dostępności

## 🚨 Error Handling

- `400` - Bad Request (błędne dane)
- `401` - Unauthorized (brak tokenu)
- `403` - Forbidden (brak uprawnień)
- `404` - Not Found (powiadomienie nie istnieje)
- `422` - Unprocessable Entity (błędny szablon)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## 🔧 Troubleshooting

### **Problem z doręczeniem email**
```bash
# Sprawdź konfigurację email
curl http://localhost:3006/health/email

# Sprawdź kolejkę powiadomień
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3006/notifications?status=pending"
```

### **Problem z szablonami**
```bash
# Lista dostępnych szablonów
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/templates

# Test szablonu
curl -X POST http://localhost:3006/templates/test \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"templateId": "order_created", "data": {"orderId": "test"}}'
```

### **Problem z preferencjami**
```bash
# Sprawdź preferencje użytkownika
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/preferences

# Reset do domyślnych
curl -X POST http://localhost:3006/preferences/reset \
  -H "Authorization: Bearer $TOKEN"
```

## 🛡️ Security

- **JWT Verification** - Ochrona wszystkich endpoints
- **User Isolation** - Użytkownicy widzą tylko swoje powiadomienia
- **Template Validation** - Walidacja szablonów
- **Rate Limiting** - Ochrona przed spam-em
- **Content Filtering** - Filtrowanie treści

## 🎯 Future Enhancements

- **Push notifications** - Powiadomienia mobilne
- **SMS integration** - Integracja z Twilio/SMS
- **Rich notifications** - Bogate powiadomienia z obrazkami
- **A/B testing** - Testowanie szablonów
- **Analytics** - Analityka doręczeń
- **WhatsApp/Telegram** - Dodatkowe kanały

---

**Port**: 3006  
**Database**: `mikrouslugi_notifications`  
**Collections**: `notifications`, `preferences`, `templates`