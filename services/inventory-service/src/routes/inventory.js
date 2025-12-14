const express = require('express');
const Inventory = require('../models/Inventory');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

/**
 * @swagger
 * components:
 *   schemas:
 *     Inventory:
 *       type: object
 *       required:
 *         - productId
 *         - sku
 *         - name
 *         - quantity
 *       properties:
 *         _id:
 *           type: string
 *         inventoryId:
 *           type: string
 *         productId:
 *           type: string
 *         sku:
 *           type: string
 *         name:
 *           type: string
 *         quantity:
 *           type: number
 *         reservedQuantity:
 *           type: number
 *         availableQuantity:
 *           type: number
 *         reorderPoint:
 *           type: number
 *         maxStock:
 *           type: number
 *         status:
 *           type: string
 *           enum: [active, inactive, discontinued, out_of_stock]
 */

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.warehouse) query['warehouse.id'] = req.query.warehouse;
    if (req.query.lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$reorderPoint'] };
    }

    const items = await Inventory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Inventory.countDocuments(query);

    res.json({
      success: true,
      items,
      pagination: {
        current: page,
        total: total,
        pages: Math.ceil(total / limit),
        hasNext: skip + items.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get inventory by product ID
router.get('/product/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const warehouseId = req.query.warehouse || 'MAIN';

    const inventory = await Inventory.findOne({ 
      productId, 
      'warehouse.id': warehouseId 
    }).lean();

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in inventory'
      });
    }

    res.json({
      success: true,
      inventory
    });
  } catch (error) {
    console.error('Error fetching inventory by product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Check stock availability
router.get('/check-stock/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const requestedQuantity = parseInt(req.query.quantity) || 1;
    const warehouseId = req.query.warehouse || 'MAIN';

    const inventory = await Inventory.findOne({ 
      productId, 
      'warehouse.id': warehouseId,
      status: 'active' 
    }).lean();

    if (!inventory) {
      return res.json({
        success: true,
        available: false,
        message: 'Product not found in inventory',
        availableQuantity: 0
      });
    }

    const available = inventory.availableQuantity >= requestedQuantity;

    res.json({
      success: true,
      available,
      availableQuantity: inventory.availableQuantity,
      requestedQuantity,
      message: available ? 'Stock available' : 'Insufficient stock'
    });
  } catch (error) {
    console.error('Error checking stock:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Reserve stock
router.post('/reserve', auth, async (req, res) => {
  try {
    const { productId, quantity, warehouseId = 'MAIN' } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and positive quantity are required'
      });
    }

    const inventory = await Inventory.reserveStock(productId, quantity, warehouseId);

    res.json({
      success: true,
      message: 'Stock reserved successfully',
      inventory
    });
  } catch (error) {
    console.error('Error reserving stock:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Release reserved stock
router.post('/release', auth, async (req, res) => {
  try {
    const { productId, quantity, warehouseId = 'MAIN' } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and positive quantity are required'
      });
    }

    const inventory = await Inventory.releaseReservedStock(productId, quantity, warehouseId);

    res.json({
      success: true,
      message: 'Reserved stock released successfully',
      inventory
    });
  } catch (error) {
    console.error('Error releasing reserved stock:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Add stock (restock)
router.post('/add-stock', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { productId, quantity, cost, warehouseId = 'MAIN' } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and positive quantity are required'
      });
    }

    const inventory = await Inventory.addStock(productId, quantity, cost, warehouseId);

    res.json({
      success: true,
      message: 'Stock added successfully',
      inventory
    });
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Create inventory item
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { inventoryId, productId, sku, name, quantity, reorderPoint, maxStock, warehouse, location, cost, supplier } = req.body;

    if (!productId || !sku || !name) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, SKU, and name are required'
      });
    }

    const inventory = new Inventory({
      inventoryId: inventoryId || `INV-${Date.now()}-${sku}`,
      productId,
      sku,
      name,
      quantity: quantity || 0,
      reorderPoint: reorderPoint || 10,
      maxStock: maxStock || 1000,
      warehouse: warehouse || { id: 'MAIN', name: 'Main Warehouse' },
      location: location || {},
      cost: cost || {},
      supplier: supplier || {}
    });

    await inventory.save();

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      inventory
    });
  } catch (error) {
    console.error('Error creating inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get low stock items
router.get('/low-stock', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const warehouseId = req.query.warehouse;
    const lowStockItems = await Inventory.getLowStockItems(warehouseId);

    res.json({
      success: true,
      items: lowStockItems,
      count: lowStockItems.length
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update inventory item
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { quantity, name, reorderPoint, maxStock } = req.body;
    const updateData = {};

    if (quantity !== undefined) updateData.quantity = quantity;
    if (name !== undefined) updateData.name = name;
    if (reorderPoint !== undefined) updateData.reorderPoint = reorderPoint;
    if (maxStock !== undefined) updateData.maxStock = maxStock;

    // Update availableQuantity when quantity changes
    if (quantity !== undefined) {
      const currentInventory = await Inventory.findById(req.params.id);
      if (currentInventory) {
        updateData.availableQuantity = quantity - (currentInventory.reservedQuantity || 0);
      }
    }

    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      inventory
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// System endpoint: Update inventory when order is delivered (remove reservation)
router.put('/product/:productId/deliver', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const inventoryItem = await Inventory.findOne({ productId });
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Remove reservation and decrease total quantity
    inventoryItem.reservedQuantity = Math.max(0, inventoryItem.reservedQuantity - quantity);
    inventoryItem.quantity = Math.max(0, inventoryItem.quantity - quantity);
    inventoryItem.lastMovement = new Date();

    await inventoryItem.save();

    res.json({
      success: true,
      message: 'Inventory updated for delivery',
      inventory: inventoryItem
    });
  } catch (error) {
    console.error('Error updating inventory for delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;