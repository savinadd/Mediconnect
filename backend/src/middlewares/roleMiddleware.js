const { ForbiddenError } = require('../utils/errors');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Forbidden: Access denied');
    }
    next();
  };
};

module.exports = { authorizeRoles };
