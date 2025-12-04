const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const CONSTANTS = require("../constants");
const { ENV } = require("../config/env");

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, { 
    expiresIn: CONSTANTS.JWT.EXPIRES_IN 
  });
};

// Generate password reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Calculate reset token expiry
const getResetTokenExpiry = () => {
  return Date.now() + (CONSTANTS.PASSWORD_RESET.TOKEN_EXPIRY_MINUTES * 60 * 1000);
};

// Generate reset URL
const generateResetUrl = (token) => {
  return `${ENV.FRONTEND_URL}/reset-password/${token}`;
};

module.exports = {
  generateToken,
  generateResetToken,
  getResetTokenExpiry,
  generateResetUrl
};
