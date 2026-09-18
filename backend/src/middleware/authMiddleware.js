const { verifyToken } = require('../utils/token');

/**
 * Middleware to authenticate requests using JWT Bearer Token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Access token is missing or malformed.',
      errors: ['NO_TOKEN_PROVIDED']
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, email, role, name }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      errors: [err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN']
    });
  }
};

/**
 * Role-based authorization middleware generator
 * Example usage: requireRole('student') or requireRole('recruiter', 'admin')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. User not authenticated.',
        errors: ['UNAUTHENTICATED']
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. You do not have required permissions (${allowedRoles.join(', ')}).`,
        errors: ['ROLE_NOT_AUTHORIZED']
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
