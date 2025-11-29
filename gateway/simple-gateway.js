const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

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

// API overview
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Simple Gateway for Testing',
    auth_service: AUTH_SERVICE_URL,
    product_service: PRODUCT_SERVICE_URL
  });
});

app.listen(PORT, () => {
  console.log(`Simple Gateway running on port ${PORT}`);
  console.log(`Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`Product Service: ${PRODUCT_SERVICE_URL}`);
});

module.exports = app;