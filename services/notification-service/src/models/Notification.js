const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'push', 'sms', 'in_app'],
    required: true
  },
  channel: {
    type: String,
    enum: ['order', 'payment', 'user', 'system', 'marketing', 'security'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  template: {
    type: String,
    default: null
  },
  templateData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  recipient: {
    email: String,
    phone: String,
    pushToken: String,
    userId: String
  },
  metadata: {
    orderId: String,
    paymentId: String,
    productId: String,
    campaignId: String,
    source: String
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 5
  },
  externalId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Generate notification ID before saving
notificationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = now.toTimeString().substr(0, 8).replace(/:/g, '');
    
    this.notificationId = `NOTIF-${year}${month}${day}-${time}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ type: 1, channel: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ priority: 1, status: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

// Instance method to mark as sent
notificationSchema.methods.markAsSent = async function(externalId = null) {
  this.status = 'sent';
  this.sentAt = new Date();
  if (externalId) {
    this.externalId = externalId;
  }
  await this.save();
  return this;
};

// Instance method to mark as delivered
notificationSchema.methods.markAsDelivered = async function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  await this.save();
  return this;
};

// Instance method to mark as failed
notificationSchema.methods.markAsFailed = async function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.retryCount += 1;
  await this.save();
  return this;
};

module.exports = mongoose.model('Notification', notificationSchema);