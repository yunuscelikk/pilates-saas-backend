const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    error = new AppError(messages.join('. '), 400);
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = Object.keys(err.fields || {}).join(', ');
    error = new AppError(`Duplicate value for: ${fields}`, 409);
  }

  // Sequelize foreign key constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new AppError('Referenced resource not found', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  const response = {
    success: false,
    error: message,
  };

  if (process.env.NODE_ENV === 'development' && !error.isOperational) {
    response.stack = err.stack;
    response.error = err.message;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
