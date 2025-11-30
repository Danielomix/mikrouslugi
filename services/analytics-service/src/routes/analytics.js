const express = require('express');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

/**
 * @swagger
 * /analytics/sales:
 *   get:
 *     summary: Get sales analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: Sales analytics data
 */
router.get('/sales', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const period = req.query.period || 'month';
    
    // Mock analytics data (in real implementation, aggregate from order/payment services)
    const analyticsData = {
      period,
      totalRevenue: 15750.50,
      totalOrders: 125,
      averageOrderValue: 126.00,
      topProducts: [
        { name: 'Product A', sales: 45, revenue: 4500 },
        { name: 'Product B', sales: 32, revenue: 3200 },
        { name: 'Product C', sales: 28, revenue: 2800 }
      ],
      salesTrend: [
        { date: '2024-01-01', orders: 25, revenue: 3150 },
        { date: '2024-01-02', orders: 30, revenue: 3780 },
        { date: '2024-01-03', orders: 22, revenue: 2772 }
      ]
    };

    res.json({
      success: true,
      analytics: analyticsData
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview data
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Mock dashboard data
    const dashboardData = {
      overview: {
        totalUsers: 1250,
        totalProducts: 85,
        totalOrders: 325,
        totalRevenue: 42500.75
      },
      recentActivity: [
        { type: 'order', message: 'New order #ORD-20240101-001', timestamp: new Date() },
        { type: 'user', message: 'New user registration', timestamp: new Date() },
        { type: 'payment', message: 'Payment completed for order #ORD-20240101-001', timestamp: new Date() }
      ],
      metrics: {
        ordersToday: 12,
        revenueToday: 1520.50,
        newUsersToday: 3,
        lowStockAlerts: 5
      }
    };

    res.json({
      success: true,
      dashboard: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;