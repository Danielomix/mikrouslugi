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
    return this.client.post('/api/auth/login', { email, password });
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

  // Health check
  async healthCheck() {
    return this.client.get('/health');
  }
}

const api = new ApiService();
export default api;