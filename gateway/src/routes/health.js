const express = require('express');
const axios = require('axios');
const router = express.Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API Gateway health and all connected services
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Gateway and all services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 service:
 *                   type: string
 *                   example: api-gateway
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         url:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *                     product:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         url:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *       503:
 *         description: Gateway or some services are unhealthy
 */
router.get('/', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    services: {}
  };

  // Check auth service
  try {
    const startTime = Date.now();
    const authResponse = await axios.get(`${AUTH_SERVICE_URL}/health`, { timeout: 3000 });
    const responseTime = Date.now() - startTime;
    
    health.services.auth = {
      status: 'healthy',
      url: AUTH_SERVICE_URL,
      responseTime: `${responseTime}ms`,
      details: authResponse.data
    };
  } catch (error) {
    health.services.auth = {
      status: 'unhealthy',
      url: AUTH_SERVICE_URL,
      error: error.code || error.message
    };
    health.status = 'degraded';
  }

  // Check product service
  try {
    const startTime = Date.now();
    const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/health`, { timeout: 3000 });
    const responseTime = Date.now() - startTime;
    
    health.services.product = {
      status: 'healthy',
      url: PRODUCT_SERVICE_URL,
      responseTime: `${responseTime}ms`,
      details: productResponse.data
    };
  } catch (error) {
    health.services.product = {
      status: 'unhealthy',
      url: PRODUCT_SERVICE_URL,
      error: error.code || error.message
    };
    health.status = 'degraded';
  }

  // Determine overall health status
  const unhealthyServices = Object.values(health.services).filter(service => service.status === 'unhealthy');
  
  if (unhealthyServices.length === Object.keys(health.services).length) {
    health.status = 'unhealthy';
    return res.status(503).json(health);
  } else if (unhealthyServices.length > 0) {
    health.status = 'degraded';
    return res.status(200).json(health); // Still responding, but degraded
  }

  res.json(health);
});

/**
 * @swagger
 * /health/auth:
 *   get:
 *     summary: Check auth service health specifically
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Auth service is healthy
 *       503:
 *         description: Auth service is unavailable
 */
router.get('/auth', async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/health`, { timeout: 5000 });
    res.json({
      service: 'auth-service',
      status: 'healthy',
      url: AUTH_SERVICE_URL,
      details: response.data
    });
  } catch (error) {
    res.status(503).json({
      service: 'auth-service',
      status: 'unhealthy',
      url: AUTH_SERVICE_URL,
      error: error.code || error.message
    });
  }
});

/**
 * @swagger
 * /health/products:
 *   get:
 *     summary: Check product service health specifically
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Product service is healthy
 *       503:
 *         description: Product service is unavailable
 */
router.get('/products', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/health`, { timeout: 5000 });
    res.json({
      service: 'product-service',
      status: 'healthy',
      url: PRODUCT_SERVICE_URL,
      details: response.data
    });
  } catch (error) {
    res.status(503).json({
      service: 'product-service',
      status: 'unhealthy',
      url: PRODUCT_SERVICE_URL,
      error: error.code || error.message
    });
  }
});

module.exports = router;