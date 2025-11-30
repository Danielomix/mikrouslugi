const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3007';
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3008';

// Middleware
app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'simple-gateway',
    timestamp: new Date().toISOString()
  });
});

// Manual auth proxy
app.all('/api/auth/*', async (req, res) => {
  try {
    const path = req.path.replace('/api/auth', '/auth');
    const url = `${AUTH_SERVICE_URL}${path}`;
    
    console.log(`[AUTH PROXY] ${req.method} ${req.path} -> ${url}`);
    
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
        ...req.headers
      },
      timeout: 10000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[AUTH PROXY ERROR]`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Auth service error',
      error: error.message 
    });
  }
});

// Manual products proxy
app.all('/api/products*', async (req, res) => {
  try {
    const path = req.path.replace('/api/products', '/products');
    const url = `${PRODUCT_SERVICE_URL}${path}`;
    
    console.log(`[PRODUCT PROXY] ${req.method} ${req.path} -> ${url}`);
    
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[PRODUCT PROXY ERROR]`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Product service error',
      error: error.message 
    });
  }
});

// Manual orders proxy
app.all('/api/orders*', async (req, res) => {
  try {
    const path = req.path.replace('/api/orders', '/orders');
    const url = `${ORDER_SERVICE_URL}${path}`;
    
    console.log(`[ORDER PROXY] ${req.method} ${req.path} -> ${url}`);
    
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[ORDER PROXY ERROR]`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Order service error',
      error: error.message 
    });
  }
});

// Manual payments proxy
app.all('/api/payments*', async (req, res) => {
  try {
    const path = req.path.replace('/api/payments', '/payments');
    const url = `${PAYMENT_SERVICE_URL}${path}`;
    
    console.log(`[PAYMENT PROXY] ${req.method} ${req.path} -> ${url}`);
    
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[PAYMENT PROXY ERROR]`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Payment service error',
      error: error.message 
    });
  }
});

// Manual notifications proxy
app.all('/api/notifications*', async (req, res) => {
  try {
    const path = req.path.replace('/api/notifications', '/notifications');
    const url = `${NOTIFICATION_SERVICE_URL}${path}`;
    
    console.log(`[NOTIFICATION PROXY] ${req.method} ${req.path} -> ${url}`);
    
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[NOTIFICATION PROXY ERROR]`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Notification service error',
      error: error.message 
    });
  }
});

// Manual inventory proxy
app.all('/api/inventory*', async (req, res) => {
  try {
    const path = req.path.replace('/api/inventory', '/inventory');
    const url = `${INVENTORY_SERVICE_URL}${path}`;
    
    console.log(`[INVENTORY PROXY] ${req.method} ${req.path} -> ${url}`);
    
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[INVENTORY PROXY ERROR]`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Inventory service error',
      error: error.message 
    });
  }
});

// Manual analytics proxy
app.all('/api/analytics*', async (req, res) => {
  try {
    const path = req.path.replace('/api/analytics', '/analytics');
    const url = `${ANALYTICS_SERVICE_URL}${path}`;
    
    console.log(`[ANALYTICS PROXY] ${req.method} ${req.path} -> ${url}`);
    
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[ANALYTICS PROXY ERROR]`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Analytics service error',
      error: error.message 
    });
  }
});

// API overview
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Simple Gateway for All 8 Microservices',
    services: {
      auth_service: AUTH_SERVICE_URL,
      product_service: PRODUCT_SERVICE_URL,
      order_service: ORDER_SERVICE_URL,
      payment_service: PAYMENT_SERVICE_URL,
      notification_service: NOTIFICATION_SERVICE_URL,
      inventory_service: INVENTORY_SERVICE_URL,
      analytics_service: ANALYTICS_SERVICE_URL
    }
  });
});

app.listen(PORT, () => {
  console.log(`Simple Gateway running on port ${PORT}`);
  console.log(`Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`Product Service: ${PRODUCT_SERVICE_URL}`);
  console.log(`Order Service: ${ORDER_SERVICE_URL}`);
  console.log(`Payment Service: ${PAYMENT_SERVICE_URL}`);
  console.log(`Notification Service: ${NOTIFICATION_SERVICE_URL}`);
  console.log(`Inventory Service: ${INVENTORY_SERVICE_URL}`);
  console.log(`Analytics Service: ${ANALYTICS_SERVICE_URL}`);
  console.log(`\nAvailable routes:`);
  console.log(`  /api/auth/*`);
  console.log(`  /api/products/*`);
  console.log(`  /api/orders/*`);
  console.log(`  /api/payments/*`);
  console.log(`  /api/notifications/*`);
  console.log(`  /api/inventory/*`);
  console.log(`  /api/analytics/*`);
});

module.exports = app;