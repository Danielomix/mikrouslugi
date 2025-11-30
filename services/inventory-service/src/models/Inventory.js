const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  inventoryId: {
    type: String,
    required: true,
    unique: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
    index: true
  },
  sku: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  availableQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: 10,
    min: 0
  },
  maxStock: {
    type: Number,
    default: 1000,
    min: 1
  },
  warehouse: {
    id: {
      type: String,
      required: true,
      default: 'MAIN'
    },
    name: {
      type: String,
      default: 'Main Warehouse'
    },
    location: {
      type: String,
      default: 'Default Location'
    }
  },
  location: {
    aisle: String,
    shelf: String,
    bin: String
  },
  cost: {
    unitCost: {
      type: Number,
      min: 0,
      default: 0
    },
    totalCost: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  supplier: {
    id: String,
    name: String,
    contact: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'out_of_stock'],
    default: 'active'
  },
  lastMovement: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  batchNumber: {
    type: String
  },
  serialNumber: {
    type: String
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Generate inventory ID before saving
inventorySchema.pre('save', async function(next) {
  if (this.isNew) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    this.inventoryId = `INV-${year}${month}${day}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  
  // Calculate available quantity
  this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
  
  // Calculate total cost
  this.cost.totalCost = this.quantity * this.cost.unitCost;
  
  // Update last movement time
  if (this.isModified('quantity') || this.isModified('reservedQuantity')) {
    this.lastMovement = new Date();
  }
  
  next();
});

// Indexes for performance
inventorySchema.index({ productId: 1, warehouse: 1 });
inventorySchema.index({ sku: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ availableQuantity: 1 });
inventorySchema.index({ reorderPoint: 1, quantity: 1 });
inventorySchema.index({ warehouse: 1, status: 1 });

// Virtual for low stock alert
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.reorderPoint;
});

// Virtual for out of stock alert
inventorySchema.virtual('isOutOfStock').get(function() {
  return this.availableQuantity <= 0;
});

// Static method to reserve stock
inventorySchema.statics.reserveStock = async function(productId, quantity, warehouseId = 'MAIN') {
  const inventory = await this.findOne({ 
    productId, 
    'warehouse.id': warehouseId,
    status: 'active'
  });
  
  if (!inventory) {
    throw new Error('Product not found in inventory');
  }
  
  if (inventory.availableQuantity < quantity) {
    throw new Error(`Insufficient stock. Available: ${inventory.availableQuantity}, Requested: ${quantity}`);
  }
  
  inventory.reservedQuantity += quantity;
  await inventory.save();
  
  return inventory;
};

// Static method to release reserved stock
inventorySchema.statics.releaseReservedStock = async function(productId, quantity, warehouseId = 'MAIN') {
  const inventory = await this.findOne({ 
    productId, 
    'warehouse.id': warehouseId,
    status: 'active'
  });
  
  if (!inventory) {
    throw new Error('Product not found in inventory');
  }
  
  const releaseQuantity = Math.min(quantity, inventory.reservedQuantity);
  inventory.reservedQuantity -= releaseQuantity;
  await inventory.save();
  
  return inventory;
};

// Static method to confirm stock movement (sale, shipment)
inventorySchema.statics.confirmMovement = async function(productId, quantity, warehouseId = 'MAIN') {
  const inventory = await this.findOne({ 
    productId, 
    'warehouse.id': warehouseId,
    status: 'active'
  });
  
  if (!inventory) {
    throw new Error('Product not found in inventory');
  }
  
  // Reduce from both reserved and total quantity
  const reduceFromReserved = Math.min(quantity, inventory.reservedQuantity);
  const reduceFromTotal = quantity;
  
  inventory.reservedQuantity -= reduceFromReserved;
  inventory.quantity -= reduceFromTotal;
  
  if (inventory.quantity < 0) {
    inventory.quantity = 0;
  }
  
  await inventory.save();
  
  return inventory;
};

// Static method to add stock (restock)
inventorySchema.statics.addStock = async function(productId, quantity, cost, warehouseId = 'MAIN') {
  const inventory = await this.findOne({ 
    productId, 
    'warehouse.id': warehouseId 
  });
  
  if (!inventory) {
    throw new Error('Product not found in inventory');
  }
  
  inventory.quantity += quantity;
  
  if (cost) {
    // Calculate weighted average cost
    const totalCurrentCost = inventory.cost.totalCost;
    const newTotalCost = totalCurrentCost + (quantity * cost);
    inventory.cost.unitCost = newTotalCost / inventory.quantity;
  }
  
  await inventory.save();
  
  return inventory;
};

// Static method to get low stock items
inventorySchema.statics.getLowStockItems = async function(warehouseId = null) {
  const query = {
    $expr: { $lte: ['$quantity', '$reorderPoint'] },
    status: 'active'
  };
  
  if (warehouseId) {
    query['warehouse.id'] = warehouseId;
  }
  
  return this.find(query).sort({ quantity: 1 });
};

module.exports = mongoose.model('Inventory', inventorySchema);