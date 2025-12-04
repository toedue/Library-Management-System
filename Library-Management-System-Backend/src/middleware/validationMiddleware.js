const CONSTANTS = require("../constants");

// Email validation
const validateEmail = (email) => {
  return CONSTANTS.VALIDATION.EMAIL_REGEX.test(email);
};

// Password validation
const validatePassword = (password) => {
  return password && password.length >= CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH;
};

// Username validation
const validateUsername = (username) => {
  return username && username.trim().length >= CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH;
};

// Registration validation middleware
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || !validateUsername(username)) {
    errors.push("Username must be at least 3 characters long");
  }

  if (!email || !validateEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (!password || !validatePassword(password)) {
    errors.push(`Password must be at least ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors 
    });
  }

  next();
};

// Login validation middleware
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push("Email is required");
  } else if (!validateEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors 
    });
  }

  next();
};

// Book validation middleware
const validateBook = (req, res, next) => {
  const { title, author, isbn, totalCopies } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!author || author.trim().length === 0) {
    errors.push("Author is required");
  }

  if (!isbn || isbn.trim().length === 0) {
    errors.push("ISBN is required");
  }

  if (!totalCopies || totalCopies <= 0) {
    errors.push("Total copies must be greater than 0");
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors 
    });
  }

  next();
};

// Password reset validation
const validatePasswordReset = (req, res, next) => {
  const { password } = req.body;
  
  if (!password || !validatePassword(password)) {
    return res.status(400).json({ 
      message: CONSTANTS.MESSAGES.PASSWORD.MIN_LENGTH 
    });
  }

  next();
};

// Membership status validation
const validateMembershipStatus = (req, res, next) => {
  const { membershipStatus } = req.body;
  const validStatuses = Object.values(CONSTANTS.MEMBERSHIP_STATUS);
  
  if (!membershipStatus || !validStatuses.includes(membershipStatus)) {
    return res.status(400).json({ 
      message: "Invalid membership status" 
    });
  }

  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateRegistration,
  validateLogin,
  validateBook,
  validatePasswordReset,
  validateMembershipStatus
};
