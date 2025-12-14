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
    
    try {
      // Fetch real data from payment and order services
      const [paymentsResponse, ordersResponse] = await Promise.all([
        axios.get(`${PAYMENT_SERVICE_URL}/payments`, {
          headers: { 'Authorization': req.headers.authorization },
          params: { limit: 100 }  // Get more payments for analytics
        }),
        axios.get(`${ORDER_SERVICE_URL}/orders`, {
          headers: { 'Authorization': req.headers.authorization },
          params: { limit: 100 }  // Get more orders for analytics
        })
      ]);

      const payments = paymentsResponse.data.success ? paymentsResponse.data.payments : [];
      const orders = ordersResponse.data.success ? ordersResponse.data.orders : [];

      // Calculate real analytics
      const completedPayments = payments.filter(p => p.status === 'completed');
      const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate sales trend (last 7 days)
      const salesTrend = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate === dateStr;
        });
        
        const dayRevenue = completedPayments.filter(payment => {
          const paymentDate = new Date(payment.createdAt).toISOString().split('T')[0];
          return paymentDate === dateStr;
        }).reduce((sum, p) => sum + p.amount, 0);

        salesTrend.push({
          date: dateStr,
          orders: dayOrders.length,
          revenue: dayRevenue
        });
      }

      const analyticsData = {
        period,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        salesTrend,
        completedPayments: completedPayments.length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        failedPayments: payments.filter(p => p.status === 'failed').length
      };

      res.json({
        success: true,
        analytics: analyticsData
      });
    } catch (serviceError) {
      console.error('Error fetching data from services:', serviceError.message);
      
      // Fallback to basic data if services are unavailable
      const fallbackData = {
        period,
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        salesTrend: [],
        error: 'Unable to fetch real-time data from payment/order services'
      };
      
      res.json({
        success: true,
        analytics: fallbackData
      });
    }
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

    try {
      // Fetch real data from all services
      const [paymentsResponse, ordersResponse, productsResponse] = await Promise.all([
        axios.get(`${PAYMENT_SERVICE_URL}/payments`, {
          headers: { 'Authorization': req.headers.authorization },
          params: { limit: 100 }
        }).catch(err => ({ data: { success: false, payments: [] } })),
        
        axios.get(`${ORDER_SERVICE_URL}/orders`, {
          headers: { 'Authorization': req.headers.authorization },
          params: { limit: 100 }
        }).catch(err => ({ data: { success: false, orders: [] } })),
        
        axios.get(`${PRODUCT_SERVICE_URL}/products`, {
          headers: { 'Authorization': req.headers.authorization },
          params: { limit: 100 }
        }).catch(err => ({ data: { success: false, products: [] } }))
      ]);

      const payments = paymentsResponse.data.success ? paymentsResponse.data.payments : [];
      const orders = ordersResponse.data.success ? ordersResponse.data.orders : [];
      const products = productsResponse.data.success ? productsResponse.data.products : [];

      // Calculate metrics
      const completedPayments = payments.filter(p => p.status === 'completed');
      const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Today's metrics
      const today = new Date().toISOString().split('T')[0];
      const todaysOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === today;
      });
      
      const todaysRevenue = completedPayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt).toISOString().split('T')[0];
        return paymentDate === today;
      }).reduce((sum, p) => sum + p.amount, 0);

      // Low stock alerts (products with stock <= 2)
      const lowStockProducts = products.filter(p => p.stock <= 2);

      // Recent activity from orders and payments
      const recentActivity = [];
      
      // Add recent orders
      orders.slice(0, 3).forEach(order => {
        recentActivity.push({
          type: 'order',
          message: `New order ${order.orderNumber || order._id}`,
          timestamp: order.createdAt,
          amount: order.totalAmount
        });
      });
      
      // Add recent payments
      payments.slice(0, 3).forEach(payment => {
        recentActivity.push({
          type: 'payment',
          message: `Payment ${payment.status} for ${payment.paymentId}`,
          timestamp: payment.updatedAt,
          amount: payment.amount
        });
      });

      // Sort by timestamp desc and take top 5
      recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const dashboardData = {
        overview: {
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalPayments: payments.length
        },
        recentActivity: recentActivity.slice(0, 5),
        metrics: {
          ordersToday: todaysOrders.length,
          revenueToday: Math.round(todaysRevenue * 100) / 100,
          pendingPayments: payments.filter(p => p.status === 'pending').length,
          lowStockAlerts: lowStockProducts.length
        },
        paymentStats: {
          completed: payments.filter(p => p.status === 'completed').length,
          pending: payments.filter(p => p.status === 'pending').length,
          failed: payments.filter(p => p.status === 'failed').length,
          processing: payments.filter(p => p.status === 'processing').length
        }
      };

      res.json({
        success: true,
        dashboard: dashboardData
      });
    } catch (serviceError) {
      console.error('Error fetching data from services:', serviceError.message);
      
      // Fallback data if services unavailable
      const fallbackData = {
        overview: {
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalPayments: 0
        },
        recentActivity: [],
        metrics: {
          ordersToday: 0,
          revenueToday: 0,
          pendingPayments: 0,
          lowStockAlerts: 0
        },
        error: 'Unable to fetch real-time data from services'
      };
      
      res.json({
        success: true,
        dashboard: fallbackData
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Test endpoint without auth for debugging
router.get('/test-dashboard', async (req, res) => {
  try {
    const dashboardData = {
      overview: {
        totalProducts: 5, // From our earlier products
        totalOrders: 1,
        totalRevenue: 43000, // 25000 + 18000 completed payments
        totalPayments: 4
      },
      paymentStats: {
        completed: 2,
        pending: 1,
        failed: 1,
        processing: 0
      },
      metrics: {
        ordersToday: 1,
        revenueToday: 43000,
        pendingPayments: 1,
        lowStockAlerts: 2  // Products with low stock
      }
    };

    res.json({
      success: true,
      dashboard: dashboardData,
      message: "Test endpoint - real implementation uses service integration"
    });
  } catch (error) {
    console.error('Error fetching test dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;