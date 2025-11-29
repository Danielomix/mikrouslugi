const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check service health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
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
 *                   example: product-service
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   example: connected
 *       500:
 *         description: Service is unhealthy
 */
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    // Check auth service connectivity
    let authServiceStatus = 'unknown';
    try {
      const axios = require('axios');
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      await axios.get(`${authServiceUrl}/health`, { timeout: 3000 });
      authServiceStatus = 'connected';
    } catch (error) {
      authServiceStatus = 'disconnected';
    }

    if (dbState !== 1) {
      return res.status(500).json({
        status: 'unhealthy',
        service: 'product-service',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        authService: authServiceStatus,
        error: 'Database not connected'
      });
    }

    res.json({
      status: 'healthy',
      service: 'product-service',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      authService: authServiceStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      service: 'product-service',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;