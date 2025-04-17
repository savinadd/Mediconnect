class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode   = statusCode;
      this.isOperational = true;  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // 400
  class BadRequestError extends AppError {
    constructor(message = "Bad request") {
      super(message, 400);
    }
  }
  
  // 401
  class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
      super(message, 401);
    }
  }
  
  // 403
  class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
      super(message, 403);
    }
  }
  
  // 404
  class NotFoundError extends AppError {
    constructor(message = "Not Found") {
      super(message, 404);
    }
  }
  
  // 422 for validation failures
  class ValidationError extends AppError {
    constructor(errors) {
     
      super("Validation failed", 422);
      this.errors = errors;
    }
  }
  
  module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
  };
  