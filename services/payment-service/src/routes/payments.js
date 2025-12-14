const express = require('express');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - orderId
 *         - userId
 *         - amount
 *         - method
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         paymentId:
 *           type: string
 *           description: Auto-generated payment ID
 *         orderId:
 *           type: string
 *           description: ID of the order being paid for
 *         userId:
 *           type: string
 *           description: ID of the user making payment
 *         amount:
 *           type: number
 *           description: Payment amount
 *         currency:
 *           type: string
 *           enum: [USD, EUR, PLN]
 *           description: Payment currency
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded]
 *           description: Payment status
 *         method:
 *           type: string
 *           enum: [card, bank_transfer, paypal, cash_on_delivery]
 *           description: Payment method
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   type: object
 */
router.get('/', auth, async (req, res) => {
  try {
    // Only admin can view all payments
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: skip + payments.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /payments/user/{userId}:
 *   get:
 *     summary: Get user's payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's payment history
 */
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own payments, admins can view any user's payments
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).lean();
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Users can only view their own payments, admins can view any payment
    if (payment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *               - method
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, amount, currency, method, metadata } = req.body;

    // Validate required fields
    if (!orderId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, amount, and payment method are required'
      });
    }

    // Verify order exists and belongs to user
    try {
      const orderResponse = await axios.get(`${ORDER_SERVICE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': req.headers.authorization
        }
      });

      if (!orderResponse.data.success) {
        return res.status(400).json({
          success: false,
          message: 'Order not found or access denied'
        });
      }

      const order = orderResponse.data.order;
      if (order.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Order belongs to different user.'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Order validation failed',
        error: error.message
      });
    }

    // Create payment
    const payment = new Payment({
      orderId,
      userId: req.user.userId,
      amount,
      currency: currency || 'USD',
      method,
      metadata
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /payments/{id}/process:
 *   post:
 *     summary: Process payment (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stripePaymentIntentId:
 *                 type: string
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post('/:id/process', auth, async (req, res) => {
  try {
    // Only admin can process payments
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be processed if status is pending'
      });
    }

    // Update payment status to processing
    payment.status = 'processing';
    
    if (req.body.stripePaymentIntentId) {
      payment.stripePaymentIntentId = req.body.stripePaymentIntentId;
    }
    
    if (req.body.transactionId) {
      payment.transactionId = req.body.transactionId;
    }

    await payment.save();

    // Simulate payment processing (in real app, integrate with Stripe/PayPal)
    setTimeout(async () => {
      try {
        const updatedPayment = await Payment.findById(req.params.id);
        if (updatedPayment && updatedPayment.status === 'processing') {
          updatedPayment.status = 'completed';
          await updatedPayment.save();
          
          // AUTO: Update order status to 'processing' after successful payment
          try {
            const orderResponse = await axios.put(`${ORDER_SERVICE_URL}/orders/${updatedPayment.orderId}/system-status`, 
              { status: 'processing' },
              { timeout: 5000 }
            );
            console.log('Order status updated to processing after payment completion');
          } catch (orderError) {
            console.error('Error updating order status after payment:', orderError.message);
          }
        }
      } catch (error) {
        console.error('Error completing payment:', error);
      }
    }, 2000);

    res.json({
      success: true,
      message: 'Payment processing started',
      payment
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /payments/{id}/refund:
 *   post:
 *     summary: Refund payment (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed successfully
 */
router.post('/:id/refund', auth, async (req, res) => {
  try {
    // Only admin can process refunds
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { amount, reason } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid refund amount is required'
      });
    }

    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    if (payment.refundAmount + amount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount exceeds payment amount'
      });
    }

    // Update payment with refund info
    payment.refundAmount += amount;
    payment.refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    if (payment.refundAmount >= payment.amount) {
      payment.status = 'refunded';
    }

    if (reason) {
      payment.failureReason = reason;
    }

    await payment.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      payment
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update payment status (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               failureReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated successfully
 */
router.put('/:id', auth, async (req, res) => {
  try {
    // Only admin can update payments
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { status, failureReason } = req.body;
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (status) {
      payment.status = status;
    }
    
    if (failureReason) {
      payment.failureReason = failureReason;
    }

    await payment.save();

    res.json({
      success: true,
      message: 'Payment updated successfully',
      payment
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;