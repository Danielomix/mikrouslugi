const express = require('express');
const { body, validationResult, query, param } = require('express-validator');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3000/api';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3000/api';

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - userId
 *         - userEmail
 *         - items
 *         - shippingAddress
 *       properties:
 *         orderNumber:
 *           type: string
 *           description: Auto-generated order number
 *         userId:
 *           type: string
 *           description: User ID who placed the order
 *         userEmail:
 *           type: string
 *           description: User email
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               productName:
 *                 type: string
 *               productPrice:
 *                 type: number
 *               quantity:
 *                 type: number
 *               subtotal:
 *                 type: number
 *         totalAmount:
 *           type: number
 *           description: Total before shipping and discounts
 *         shippingCost:
 *           type: number
 *           default: 0
 *         discountAmount:
 *           type: number
 *           default: 0
 *         finalAmount:
 *           type: number
 *           description: Final amount to pay
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *           default: pending
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           default: pending
 *         paymentMethod:
 *           type: string
 *           enum: [card, bank_transfer, paypal, cash_on_delivery]
 *           default: card
 *         shippingAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 *               default: Poland
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user orders with filtering and pagination
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *         description: Filter by order status
 *       - name: paymentStatus
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         description: Filter by payment status
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of orders per page
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, [
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  query('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      status,
      paymentStatus,
      page = 1,
      limit = 10
    } = req.query;

    let query = { userId: req.user.userId };

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(query);
    const pages = Math.ceil(total / parseInt(limit));

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid order ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, bank_transfer, paypal, cash_on_delivery]
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, [
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.productId').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').optional().isIn(['card', 'bank_transfer', 'paypal', 'cash_on_delivery']),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').optional().trim(),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, paymentMethod, shippingAddress, notes } = req.body;

    // Fetch product details from Product Service
    const orderItems = [];
    for (const item of items) {
      try {
        const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/products/${item.productId}`);
        const product = productResponse.data.product;

        orderItems.push({
          productId: item.productId,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          subtotal: product.price * item.quantity
        });
      } catch (productError) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`,
          error: productError.response?.data?.message || 'Product service error'
        });
      }
    }

    // Calculate shipping cost (simple logic)
    const totalAmount = orderItems.reduce((total, item) => total + item.subtotal, 0);
    let shippingCost = 0;
    if (totalAmount < 100) {
      shippingCost = 15; // $15 shipping for orders under $100
    }

    const finalAmount = totalAmount + shippingCost;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const order = new Order({
      orderNumber,
      userId: req.user.userId,
      userEmail: req.user.email,
      items: orderItems,
      totalAmount,
      shippingCost,
      finalAmount,
      paymentMethod: paymentMethod || 'card',
      shippingAddress,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *               trackingNumber:
 *                 type: string
 *               estimatedDelivery:
 *                 type: string
 *                 format: date
 *               cancelReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/status', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid status'),
  body('trackingNumber').optional().trim(),
  body('estimatedDelivery').optional().isISO8601().withMessage('Invalid date format'),
  body('cancelReason').optional().isLength({ max: 300 }).withMessage('Cancel reason too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, trackingNumber, estimatedDelivery, cancelReason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.status = status;

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    
    if (status === 'cancelled') {
      order.cancelledAt = new Date();
      if (cancelReason) order.cancelReason = cancelReason;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Cancel order (only if pending)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelReason:
 *                 type: string
 *                 maxLength: 300
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Cannot cancel order
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('cancelReason').optional().isLength({ max: 300 }).withMessage('Cancel reason too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { cancelReason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled. Only pending orders can be cancelled.'
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    if (cancelReason) order.cancelReason = cancelReason;

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling order'
    });
  }
});

// System endpoint for automatic status updates (e.g., after payment completion)
router.put('/:id/system-status', [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      
      // AUTO: Update inventory when order is delivered
      try {
        for (const item of order.items) {
          // Remove reservation and decrease stock
          const inventoryResponse = await axios.put(`${INVENTORY_SERVICE_URL}/inventory/product/${item.productId}/deliver`, 
            { quantity: item.quantity },
            { timeout: 5000 }
          );
          
          // Update product stock using new system endpoint
          const productGetResponse = await axios.get(`${PRODUCT_SERVICE_URL}/products/${item.productId}`, 
            { timeout: 5000 });
          if (productGetResponse.data.success) {
            const currentStock = productGetResponse.data.product.stock;
            const newStock = Math.max(0, currentStock - item.quantity);
            
            const productResponse = await axios.put(`${PRODUCT_SERVICE_URL}/products/${item.productId}/system-stock`, 
              { stock: newStock },
              { timeout: 5000 }
            );
            
            console.log(`Updated product ${item.productId} stock from ${currentStock} to ${newStock}`);
          }
          
          console.log(`Delivered: Updated inventory and product stock for ${item.productId}`);
        }
      } catch (inventoryError) {
        console.error('Error updating inventory after delivery:', inventoryError.message);
      }
    }
    
    if (status === 'cancelled') {
      order.cancelledAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully (system)',
      order
    });

  } catch (error) {
    console.error('System order status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
});

module.exports = router;