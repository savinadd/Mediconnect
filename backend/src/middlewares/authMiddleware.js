const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const authenticateToken = (req, res, next) => {
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const headerToken =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const token = cookieToken || headerToken;

  if (!token) {
    throw new UnauthorizedError('Access token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    throw new ForbiddenError('Invalid or expired token');
  }
};

module.exports = { authenticateToken };
