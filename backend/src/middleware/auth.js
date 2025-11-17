import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';

// Verify JWT token middleware
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from httpOnly cookie or Authorization header
    const token = req.cookies.accessToken || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // User is always active in current schema (no is_active field)

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Optional authentication middleware
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken ||
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (!error && user) {
      req.user = user;
    }
  } catch (error) {
  }
  next();
};

// Role-based authorization middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Check if user is admin
export const requireAdmin = authorizeRoles('admin');

// Check if user is tutor or admin
export const requireTutorOrAdmin = authorizeRoles('tutor', 'admin');

// Check if user is student, tutor, or admin (any authenticated user)
export const requireAuthenticated = authorizeRoles('student', 'tutor', 'admin');

// Alias for authenticate
export const authenticate = authenticateToken;

// Alias for tutor authorization
export const authorizeTutor = authorizeRoles('tutor', 'admin');

// Alias for admin authorization
export const authorizeAdmin = authorizeRoles('admin');
