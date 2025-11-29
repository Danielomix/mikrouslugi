const Joi = require('joi');

const schemas = {
  // User validation schemas
  user: {
    register: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  },

  // Product validation schemas
  product: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().min(1).max(1000).required(),
      price: Joi.number().positive().required(),
      category: Joi.string().valid('Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Food', 'Other').required(),
      stock: Joi.number().min(0).default(0),
      sku: Joi.string().pattern(/^[A-Z0-9-]+$/).required(),
      tags: Joi.array().items(Joi.string()),
      images: Joi.array().items(Joi.object({
        url: Joi.string().uri().required(),
        alt: Joi.string().allow('')
      }))
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(100),
      description: Joi.string().min(1).max(1000),
      price: Joi.number().positive(),
      category: Joi.string().valid('Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Food', 'Other'),
      stock: Joi.number().min(0),
      sku: Joi.string().pattern(/^[A-Z0-9-]+$/),
      tags: Joi.array().items(Joi.string()),
      images: Joi.array().items(Joi.object({
        url: Joi.string().uri().required(),
        alt: Joi.string().allow('')
      }))
    })
  },

  // Query validation schemas
  query: {
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10)
    }),
    productSearch: Joi.object({
      search: Joi.string().allow(''),
      category: Joi.string().valid('Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Food', 'Other'),
      minPrice: Joi.number().min(0),
      maxPrice: Joi.number().min(0),
      inStockOnly: Joi.boolean(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().valid('name', 'price', 'createdAt', 'stock').default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  }
};

const validate = (data, schema) => {
  const result = schema.validate(data, { abortEarly: false });
  
  if (result.error) {
    const errors = result.error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return { isValid: false, errors };
  }
  
  return { isValid: true, value: result.value };
};

module.exports = {
  schemas,
  validate
};