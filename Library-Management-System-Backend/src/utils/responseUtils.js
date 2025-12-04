const CONSTANTS = require("../constants");

// Success response helper
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

// Error response helper
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

// Validation error response
const validationError = (res, errors) => {
  return errorResponse(res, 400, "Validation failed", errors);
};

// Unauthorized response
const unauthorizedResponse = (res, message = CONSTANTS.MESSAGES.AUTH.INVALID_TOKEN) => {
  return errorResponse(res, 401, message);
};

// Forbidden response
const forbiddenResponse = (res, message) => {
  return errorResponse(res, 403, message);
};

// Not found response
const notFoundResponse = (res, message = "Resource not found") => {
  return errorResponse(res, 404, message);
};

// Server error response
const serverErrorResponse = (res, message = CONSTANTS.MESSAGES.GENERAL.SERVER_ERROR) => {
  return errorResponse(res, 500, message);
};

module.exports = {
  successResponse,
  errorResponse,
  validationError,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse
};
