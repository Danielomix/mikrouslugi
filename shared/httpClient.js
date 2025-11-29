const axios = require('axios');

class HttpClient {
  constructor(baseURL, timeout = 5000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[HTTP] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[HTTP] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(`[HTTP] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        } else if (error.request) {
          console.error('[HTTP] No response received:', error.config?.url);
        } else {
          console.error('[HTTP] Request setup error:', error.message);
        }
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

  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const errorData = {
        status: error.response.status,
        message: error.response.data?.message || 'Server error',
        data: error.response.data
      };
      return new Error(JSON.stringify(errorData));
    } else if (error.request) {
      // Request was made but no response received
      return new Error('No response from server');
    } else {
      // Something else happened
      return error;
    }
  }
}

// Factory functions for different services
const createAuthClient = () => {
  const baseURL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  return new HttpClient(baseURL);
};

const createProductClient = () => {
  const baseURL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
  return new HttpClient(baseURL);
};

module.exports = {
  HttpClient,
  createAuthClient,
  createProductClient
};