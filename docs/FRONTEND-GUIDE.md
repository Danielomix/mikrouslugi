# 🖥️ Przewodnik Frontend React Application

## � Przegląd Frontend

Frontend aplikacji mikrousług to nowoczesna aplikacja React z Material-UI, która zapewnia intuicyjny interfejs do zarządzania całym systemem e-commerce.

## �️ Architektura Frontend

### **Tech Stack**
- **React 18** - Nowoczesny framework UI
- **Material-UI (MUI)** - Design system i komponenty
- **React Router v6** - Client-side routing
- **Axios** - HTTP client do komunikacji z API
- **React Hooks** - State management
- **CSS-in-JS** - Styled components

### **Struktura Aplikacji**
```
frontend/
├── src/
│   ├── components/           # Reusable components
│   │   ├── ProductManagement.js  # Admin product CRUD
│   │   └── PaymentDialog.js      # Payment processing
│   ├── pages/               # Page components
│   │   ├── Dashboard.js     # Main dashboard
│   │   ├── Login.js         # Authentication
│   │   └── Register.js      # User registration
│   ├── services/            # API communication
│   │   ├── api.js          # Axios configuration
│   │   ├── auth.js         # Authentication services
│   │   ├── products.js     # Product API calls
│   │   ├── orders.js       # Order management
│   │   └── payments.js     # Payment processing
│   ├── utils/               # Utility functions
│   │   └── constants.js    # App constants
│   ├── App.js              # Main app component
│   └── index.js            # App entry point
├── public/                 # Static assets
├── package.json           # Dependencies
└── .env                   # Environment variables
```

### 1️⃣ Pierwsze kroki
1. **Uruchom aplikację**: `./start-local.sh`
2. **Otwórz przeglądarkę**: http://localhost:3003
3. **Zarejestruj konto** lub zaloguj się (test@test.com / test123)
4. **Sprawdź Dashboard** - zobaczysz statystyki

### 2️⃣ Testowe dane 
Po uruchomieniu masz dostęp do:

## 🚀 Uruchomienie Frontend

### **Development Mode**
```bash
# Przejdź do katalogu frontend
cd frontend

# Zainstaluj zależności
npm install

# Uruchom development server
npm start

# Aplikacja dostępna: http://localhost:3003
```

### **Production Build**
```bash
# Zbuduj aplikację dla production
npm run build

# Serve static files
npx serve -s build -l 3003
```

## 🔐 System Autentykacji

### **Login Flow**
1. **Login Page** - Formularz logowania z walidacją
2. **JWT Token** - Przechowywany w localStorage
3. **Protected Routes** - Automatyczne przekierowanie dla niezalogowanych
4. **Token Expiry** - Automatyczny logout po wygaśnięciu
5. **Role-based Access** - Admin vs User permissions

### **Przykład użycia**
```javascript
// Login component
const handleLogin = async (email, password) => {
  try {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    navigate('/dashboard');
  } catch (error) {
    setError('Nieprawidłowe dane logowania');
  }
};
```

## 🛍️ Zarządzanie Produktami (Admin)

### **Product Management Interface**
- **Lista produktów** - Tabela z sortowaniem i filtrowaniem
- **Dodawanie produktów** - Modal form z walidacją
- **Edycja produktów** - Inline editing lub modal
- **Usuwanie produktów** - Soft delete z potwierdzeniem
- **Upload obrazów** - Drag & drop interface
- **Bulk operations** - Massowe operacje

### **Komponenty**
```javascript
// ProductManagement.js - główny komponent
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Fetch products
  useEffect(() => {
    loadProducts();
  }, []);
  
  // CRUD operations
  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      showError('Błąd ładowania produktów');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <ProductToolbar onAdd={() => setOpenDialog(true)} />
      <ProductTable 
        products={products} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ProductDialog 
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
      />
    </Container>
  );
};
```

## 🛒 Składanie Zamówień (Customer)

### **Order Flow**
1. **Product Browse** - Przeglądanie katalogu produktów
2. **Shopping Cart** - Koszyk z dodawaniem/usuwaniem
3. **Checkout Form** - Formularz zamówienia z adresem dostawy
4. **Order Review** - Przegląd przed złożeniem
5. **Payment Selection** - Wybór metody płatności
6. **Order Confirmation** - Potwierdzenie i tracking

### **Order Components**
```javascript
// OrderPlacement component
const OrderPlacement = () => {
  const [cart, setCart] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({});
  const [step, setStep] = useState(0);
  
  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        items: cart,
        shippingAddress,
        totalAmount: calculateTotal(cart)
      };
      
      const order = await orderService.createOrder(orderData);
      navigate(`/payment/${order._id}`);
    } catch (error) {
      showError('Błąd podczas składania zamówienia');
    }
  };
  
  return (
    <Stepper activeStep={step}>
      <Step label="Koszyk" />
      <Step label="Dostawa" />
      <Step label="Podsumowanie" />
    </Stepper>
  );
};
```

## 💳 System Płatności

### **Payment Flow**
1. **Payment Dialog** - Modal z metodami płatności
2. **Payment Processing** - Real-time status updates
3. **Automatic Order Update** - Status changes after payment
4. **Receipt & Confirmation** - PDF receipt generation

### **Payment Component**
```javascript
const PaymentDialog = ({ orderId, amount, onComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  
  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Create payment
      const payment = await paymentService.createPayment({
        orderId,
        amount,
        method: paymentMethod
      });
      
      // Process payment (triggers automation)
      await paymentService.processPayment(payment._id);
      
      // Wait for completion (2 seconds)
      setTimeout(() => {
        setProcessing(false);
        onComplete();
        showSuccess('Płatność zakończona pomyślnie!');
      }, 2500);
      
    } catch (error) {
      setProcessing(false);
      showError('Błąd podczas przetwarzania płatności');
    }
  };
  
  return (
    <Dialog open={true} maxWidth="md" fullWidth>
      <DialogTitle>Płatność za zamówienie</DialogTitle>
      <DialogContent>
        <PaymentMethodSelector 
          value={paymentMethod}
          onChange={setPaymentMethod}
        />
        <OrderSummary orderId={orderId} amount={amount} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePayment} disabled={processing}>
          {processing ? <CircularProgress size={20} /> : 'Zapłać'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

## 📊 Dashboard i Analytics

### **Admin Dashboard**
- **Key Metrics** - Revenue, orders, customers
- **Charts & Graphs** - Sales trends, top products
- **Recent Activity** - Latest orders, payments
- **System Health** - Service status monitoring
- **Quick Actions** - Fast access to common tasks

### **Customer Dashboard**  
- **Order History** - Lista zamówień z statusami
- **Order Tracking** - Real-time status updates
- **Profile Management** - Edycja danych osobowych
- **Notification Preferences** - Ustawienia powiadomień

### **Dashboard Components**
```javascript
const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      const [metricsData, ordersData, healthData] = await Promise.all([
        analyticsService.getDashboard(),
        orderService.getRecentOrders(),
        gatewayService.getHealth()
      ]);
      
      setMetrics(metricsData);
      setRecentOrders(ordersData);
      setSystemHealth(healthData);
    } catch (error) {
      showError('Błąd ładowania danych dashboard');
    }
  };
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <MetricCard 
          title="Całkowity przychód"
          value={formatCurrency(metrics.totalRevenue)}
          change="+12.5%"
          icon={<AttachMoneyIcon />}
        />
      </Grid>
      
      <Grid item xs={12} md={9}>
        <SalesChart data={metrics.salesTrend} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <RecentOrdersTable orders={recentOrders} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <SystemHealthPanel health={systemHealth} />
      </Grid>
    </Grid>
  );
};
```

## 🎨 UI/UX Design

### **Material-UI Theming**
```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});
```

### **Responsive Design**
- **Mobile-first approach** - Optimized for mobile devices
- **Breakpoints** - sm, md, lg, xl breakpoints
- **Flexible layouts** - Grid system with auto-sizing
- **Touch-friendly** - Large touch targets

## 🧪 Testing Frontend

### **Manual Testing Checklist**
- [ ] **Registration** - Nowe konto, walidacja pól
- [ ] **Login/Logout** - Prawidłowe logowanie i wylogowywanie
- [ ] **Product CRUD** - Dodawanie, edycja, usuwanie produktów (admin)
- [ ] **Order Flow** - Składanie zamówienia end-to-end
- [ ] **Payment Processing** - Pełny flow płatności z automatyzacją
- [ ] **Dashboard** - Wszystkie metryki i dane
- [ ] **Responsive** - Desktop, tablet, mobile
- [ ] **Error Handling** - Błędy sieciowe i walidacji

### **User Scenarios**

#### **Admin Scenario**
```bash
1. Zaloguj się jako admin (admin@example.com / admin123456)
2. Przejdź do zarządzania produktami
3. Dodaj nowy produkt z wszystkimi danymi
4. Edytuj istniejący produkt
5. Sprawdź dashboard z metrykami
6. Sprawdź system health w prawym górnym rogu
```

#### **Customer Scenario**
```bash
1. Zarejestruj nowe konto klienta
2. Przeglądaj katalog produktów
3. Dodaj produkt do koszyka
4. Złóż zamówienie z adresem dostawy
5. Przeprowadź płatność (symulacja)
6. Sprawdź status zamówienia na dashboardzie
```

---

## ✅ Frontend Ready for Production!

Frontend aplikacji jest w pełni funkcjonalny z:

🎨 **Modern UI** - Material-UI design system  
🔐 **Authentication** - JWT-based z role management  
🛍️ **E-commerce Features** - Complete shopping flow  
💳 **Payment Processing** - Real-time payment handling  
📊 **Analytics Dashboard** - Business metrics i monitoring  
📱 **Responsive Design** - Mobile-first approach  
🚀 **Performance Optimized** - Code splitting i memoization  

**Aplikacja dostępna**: `http://localhost:3003`