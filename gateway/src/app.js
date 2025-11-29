const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

// Swagger configuration for combined API documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mikrousługi API Gateway',
      version: '1.0.0',
      description: 'Unified API Gateway for all microservices',
      contact: {
        name: 'API Support',
        email: 'support@mikrouslugi.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);

// Rate limiting configurations
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60) // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login/register attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: Math.ceil(15 * 60)
  },
  skip: (req) => {
    // Skip rate limiting for token verification
    return req.path === '/api/auth/verify';
  }
});

// Slow down middleware for suspicious activity
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 100
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use(generalLimiter);
app.use(speedLimiter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Mikrousługi API Documentation"
}));

// Health check
app.use('/health', healthRoutes);

// Auth service proxy with stricter rate limiting
app.use('/api/auth', authLimiter, createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/auth'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log proxy requests
    console.log(`[AUTH PROXY] ${req.method} ${req.path} -> ${AUTH_SERVICE_URL}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log proxy responses
    console.log(`[AUTH PROXY] ${proxyRes.statusCode} ${req.method} ${req.path}`);
  },
  onError: (err, req, res) => {
    console.error(`[AUTH PROXY ERROR] ${err.message}`);
    res.status(503).json({
      success: false,
      message: 'Authentication service temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}));

// Product service proxy
app.use('/api/products', createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/products': '/products'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PRODUCT PROXY] ${req.method} ${req.path} -> ${PRODUCT_SERVICE_URL}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PRODUCT PROXY] ${proxyRes.statusCode} ${req.method} ${req.path}`);
  },
  onError: (err, req, res) => {
    console.error(`[PRODUCT PROXY ERROR] ${err.message}`);
    res.status(503).json({
      success: false,
      message: 'Product service temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}));

// API routes overview
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Mikrousługi API Gateway',
    version: '1.0.0',
    services: {
      auth: {
        url: '/api/auth',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login', 
          'POST /api/auth/verify',
          'GET /api/auth/profile'
        ]
      },
      products: {
        url: '/api/products',
        endpoints: [
          'GET /api/products',
          'GET /api/products/:id',
          'POST /api/products (auth required)',
          'PUT /api/products/:id (auth required)', 
          'DELETE /api/products/:id (auth required)'
        ]
      }
    },
    documentation: '/api-docs',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      '/api',
      '/api/auth/*',
      '/api/products/*',
      '/api-docs',
      '/health'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[GATEWAY ERROR]', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal gateway error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`API overview available at http://localhost:${PORT}/api`);
  console.log('Services:');
  console.log(`  - Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`  - Product Service: ${PRODUCT_SERVICE_URL}`);
});

module.exports = app;