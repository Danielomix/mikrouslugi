const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [100, 'Product name must not exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description must not exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be a positive number']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    enum: {
      values: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Food', 'Other'],
      message: 'Category must be one of: Electronics, Clothing, Books, Home, Sports, Food, Other'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String, // User ID from auth service
    required: [true, 'Creator ID is required']
  },
  updatedBy: {
    type: String // User ID from auth service
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ isActive: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Instance method to update stock
productSchema.methods.updateStock = function(quantity) {
  if (this.stock + quantity < 0) {
    throw new Error('Insufficient stock');
  }
  this.stock += quantity;
  return this.save();
};

// Instance method to check if in stock
productSchema.methods.isInStock = function(quantity = 1) {
  return this.stock >= quantity;
};

// Static method to find by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Static method for text search
productSchema.statics.searchProducts = function(searchTerm, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    inStockOnly = false,
    limit = 10,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  let query = {
    $and: [
      { isActive: true },
      {
        $or: [
          { $text: { $search: searchTerm } },
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  };

  // Add filters
  if (category) query.$and.push({ category });
  if (minPrice !== undefined) query.$and.push({ price: { $gte: minPrice } });
  if (maxPrice !== undefined) query.$and.push({ price: { $lte: maxPrice } });
  if (inStockOnly) query.$and.push({ stock: { $gt: 0 } });

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(query)
    .sort(sortOptions)
    .limit(limit)
    .skip(skip)
    .lean();
};

// Transform output
productSchema.methods.toJSON = function() {
  const product = this.toObject({ virtuals: true });
  delete product.__v;
  return product;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;