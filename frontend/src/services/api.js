import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.client.post('/api/auth/login', { email, password });
    if (response.success && response.token) {
      this.setAuthToken(response.token);
      console.log('Auth token set after login:', response.token.substring(0, 20) + '...');
    }
    return response;
  }

  async register(name, email, password) {
    return this.client.post('/api/auth/register', { name, email, password });
  }

  async verifyToken() {
    return this.client.post('/api/auth/verify');
  }

  async getProfile() {
    return this.client.get('/api/auth/profile');
  }

  // Product endpoints
  async getProducts(params = {}) {
    console.log('Making getProducts request with auth token:', this.client.defaults.headers.common['Authorization']?.substring(0, 30) + '...');
    return this.client.get('/api/products', { params });
  }

  async getProduct(id) {
    return this.client.get(`/api/products/${id}`);
  }

  async createProduct(productData) {
    return this.client.post('/api/products', productData);
  }

  async updateProduct(id, productData) {
    return this.client.put(`/api/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.client.delete(`/api/products/${id}`);
  }

  // Order endpoints
  async getOrders(params = {}) {
    return this.client.get('/api/orders', { params });
  }

  async getOrder(id) {
    return this.client.get(`/api/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.client.post('/api/orders', orderData);
  }

  async updateOrderStatus(id, status) {
    return this.client.put(`/api/orders/${id}/status`, { status });
  }

  // Payment endpoints
  async getPayments(params = {}) {
    return this.client.get('/api/payments', { params });
  }

  async createPayment(paymentData) {
    return this.client.post('/api/payments', paymentData);
  }

  async processPayment(id) {
    return this.client.post(`/api/payments/${id}/process`);
  }

  // Get all payments (admin only)
  async getPayments(params = {}) {
    return this.client.get('/api/payments', { params });
  }

  // Get user's payments
  async getUserPayments(userId) {
    return this.client.get(`/api/payments/user/${userId}`);
  }

  // Get payment by ID
  async getPaymentById(id) {
    return this.client.get(`/api/payments/${id}`);
  }

  // Inventory endpoints
  async getInventory(params = {}) {
    return this.client.get('/api/inventory', { params });
  }

  async checkStock(productId, quantity = 1) {
    return this.client.get(`/api/inventory/check-stock/${productId}`, { params: { quantity } });
  }

  async reserveStock(productId, quantity) {
    return this.client.post('/api/inventory/reserve', { productId, quantity });
  }

  async getLowStockItems() {
    return this.client.get('/api/inventory/low-stock');
  }

  // Notification endpoints
  async getNotifications(params = {}) {
    return this.client.get('/api/notifications', { params });
  }

  async getUserNotifications(userId) {
    return this.client.get(`/api/notifications/user/${userId}`);
  }

  async createNotification(notificationData) {
    return this.client.post('/api/notifications', notificationData);
  }

  // Analytics endpoints
  async getSalesAnalytics(period = 'month') {
    return this.client.get('/api/analytics/sales', { params: { period } });
  }

  async getDashboardData() {
    return this.client.get('/api/analytics/dashboard');
  }

  // Health check
  async healthCheck() {
    return this.client.get('/health');
  }
}

const api = new ApiService();
export default api;