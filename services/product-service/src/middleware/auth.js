const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * Authentication middleware that verifies JWT tokens with the auth service
 * Expects token in Authorization header as "Bearer <token>"
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Check if header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is empty.'
      });
    }

    // Verify token with auth service
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/auth/verify`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout
      });

      if (!response.data.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      }

      // Token is valid, attach user info to request
      req.user = {
        userId: response.data.user._id,
        email: response.data.user.email,
        role: response.data.user.role,
        name: response.data.user.name
      };
      
      next();

    } catch (authError) {
      console.error('Auth service verification error:', authError.message);
      
      // Handle different types of auth service errors
      if (authError.response && authError.response.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token.'
        });
      }

      if (authError.code === 'ECONNREFUSED' || authError.code === 'ETIMEDOUT') {
        return res.status(503).json({
          success: false,
          message: 'Authentication service temporarily unavailable.'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error verifying authentication.'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

/**
 * Admin authorization middleware
 * Must be used after auth middleware
 */
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

module.exports = auth;