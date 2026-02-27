const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const AppError = require('../utils/AppError');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      throw AppError.unauthorized('User not found or inactive');
    }

    req.user = user;
    req.studioId = user.studio_id;
    next();
  } catch (error) {
    if (error.isOperational) return next(error);
    next(AppError.unauthorized('Invalid token'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
