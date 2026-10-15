import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware
 * 
 * Intercepts incoming requests, extracts the JWT from the "Authorization: Bearer <token>"
 * header, verifies its cryptographic signature, and attaches the decoded user payload
 * to `req.user`. If token is missing, invalid, or expired, returns a 401 Unauthorized response.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Format: "Bearer <token>"
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired token.',
    });
  }
};
