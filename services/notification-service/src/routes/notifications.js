const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 1025,
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - channel
 *         - title
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         notificationId:
 *           type: string
 *           description: Auto-generated notification ID
 *         userId:
 *           type: string
 *           description: ID of the user to notify
 *         type:
 *           type: string
 *           enum: [email, push, sms, in_app]
 *           description: Type of notification
 *         channel:
 *           type: string
 *           enum: [order, payment, user, system, marketing, security]
 *           description: Notification channel/category
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message
 *         status:
 *           type: string
 *           enum: [pending, sent, delivered, failed, cancelled]
 *           description: Notification status
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *           description: Notification priority
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications (admin only)
 *     tags: [Notifications]
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
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *         description: Filter by channel
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', auth, async (req, res) => {
  try {
    // Only admin can view all notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    if (req.query.channel) query.channel = req.query.channel;
    if (req.query.userId) query.userId = req.query.userId;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      notifications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: skip + notifications.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /notifications/user/{userId}:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type
 *     responses:
 *       200:
 *         description: User's notifications
 */
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own notifications, admins can view any user's notifications
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let query = { userId };
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *       404:
 *         description: Notification not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).lean();
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Users can only view their own notifications, admins can view any notification
    if (notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - channel
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *               channel:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               priority:
 *                 type: string
 *               recipient:
 *                 type: object
 *               metadata:
 *                 type: object
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
router.post('/', auth, async (req, res) => {
  try {
    const { userId, type, channel, title, message, priority, recipient, metadata, scheduledAt } = req.body;

    // Validate required fields
    if (!userId || !type || !channel || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'UserId, type, channel, title, and message are required'
      });
    }

    // Only admin can create notifications for other users
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create notification
    const notification = new Notification({
      userId,
      type,
      channel,
      title,
      message,
      priority: priority || 'normal',
      recipient: recipient || {},
      metadata: metadata || {},
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null
    });

    await notification.save();

    // If not scheduled and type is email, try to send immediately
    if (!scheduledAt && type === 'email' && recipient?.email) {
      try {
        await sendEmailNotification(notification);
      } catch (error) {
        console.error('Failed to send email:', error);
        await notification.markAsFailed(error.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /notifications/send-email:
 *   post:
 *     summary: Send email notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               html:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 */
router.post('/send-email', auth, async (req, res) => {
  try {
    // Only admin can send direct emails
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { to, subject, message, html } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'To, subject, and message are required'
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mikrouslugi.com',
      to,
      subject,
      text: message,
      html: html || message
    };

    const info = await emailTransporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /notifications/{id}/send:
 *   post:
 *     summary: Send pending notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
router.post('/:id/send', auth, async (req, res) => {
  try {
    // Only admin can manually send notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending notifications can be sent'
      });
    }

    // Send notification based on type
    if (notification.type === 'email' && notification.recipient.email) {
      try {
        await sendEmailNotification(notification);
        res.json({
          success: true,
          message: 'Email notification sent successfully',
          notification
        });
      } catch (error) {
        await notification.markAsFailed(error.message);
        res.status(500).json({
          success: false,
          message: 'Failed to send email notification',
          error: error.message
        });
      }
    } else {
      // For other types (push, sms, in_app), mark as sent
      await notification.markAsSent();
      res.json({
        success: true,
        message: 'Notification marked as sent',
        notification
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /notifications/{id}/cancel:
 *   post:
 *     summary: Cancel pending notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification cancelled successfully
 */
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Users can cancel their own notifications, admins can cancel any
    if (notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (notification.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending notifications can be cancelled'
      });
    }

    notification.status = 'cancelled';
    await notification.save();

    res.json({
      success: true,
      message: 'Notification cancelled successfully',
      notification
    });
  } catch (error) {
    console.error('Error cancelling notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Helper function to send email notifications
async function sendEmailNotification(notification) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@mikrouslugi.com',
    to: notification.recipient.email,
    subject: notification.title,
    text: notification.message,
    html: `<h3>${notification.title}</h3><p>${notification.message}</p>`
  };

  const info = await emailTransporter.sendMail(mailOptions);
  await notification.markAsSent(info.messageId);
  return info;
}

module.exports = router;