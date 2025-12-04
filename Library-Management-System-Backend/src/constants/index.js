// Application Constants
const CONSTANTS = {
  // JWT Configuration
  JWT: {
    EXPIRES_IN: "1h",
    SALT_ROUNDS: 10
  },

  // Password Reset
  PASSWORD_RESET: {
    TOKEN_EXPIRY_MINUTES: 10,
    MIN_LENGTH: 6
  },

  // User Roles
  ROLES: {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin", 
    USER: "user"
  },

  // Membership Status
  MEMBERSHIP_STATUS: {
    PENDING: "pending",
    APPROVED: "approved",
    SUSPENDED: "suspended"
  },

  // Maintenance Tasks
  MAINTENANCE: {
    INTERVAL_HOURS: 2,
    INTERVAL_MS: 2 * 60 * 60 * 1000
  },

  // Fine Configuration
  FINE: {
    DAILY_RATE: 10, // Fine amount per day overdue (in currency)
    CURRENCY: "ETB" // Ethiopian Birr
  },

  // Email Templates
  EMAIL: {
    SUBJECTS: {
      PASSWORD_RESET: "Password Reset Request - ASTUMSJ Library"
    }
  },

  // HTTP Status Messages
  MESSAGES: {
    AUTH: {
      TOKEN_REQUIRED: "Authorization token required",
      INVALID_TOKEN: "Invalid or expired token",
      USER_NOT_FOUND: "User not found",
      INVALID_CREDENTIALS: "Invalid email or password",
      LOGIN_SUCCESS: "Login successful",
      REGISTRATION_SUCCESS: "User registered successfully"
    },
    USER: {
      REQUIRED_FIELDS: "Username, email, and password are required",
      EMAIL_EXISTS: "Email already registered",
      MEMBERSHIP_UPDATE_SUCCESS: "Membership status updated successfully",
      PROFILE_NOT_FOUND: "User not found",
      ADMIN_ONLY: "Only administrators can view all users",
      MEMBERSHIP_ADMIN_ONLY: "Only administrators can update membership status"
    },
    BOOK: {
      ISBN_EXISTS: "Book with this ISBN already exists",
      NOT_FOUND: "Book not found",
      INVALID_ID: "Invalid Book ID",
      ADD_SUCCESS: "Book added successfully",
      UPDATE_SUCCESS: "Book updated",
      DELETE_SUCCESS: "Book deleted successfully",
      INVALID_COPIES: "Total copies must be greater than 0",
      AVAILABLE_EXCEEDS_TOTAL: "Available copies cannot be greater than total copies",
      NEGATIVE_AVAILABLE: "Available copies cannot be negative",
      NEGATIVE_TOTAL: "Total copies cannot be negative"
    },
    PASSWORD: {
      EMAIL_REQUIRED: "Email is required",
      RESET_SENT: "If an account with that email exists, a password reset link has been sent.",
      INVALID_TOKEN: "Invalid or expired reset token",
      RESET_SUCCESS: "Password has been reset successfully",
      MIN_LENGTH: "Password must be at least 6 characters long"
    },
    GENERAL: {
      SERVER_ERROR: "Internal server error",
      API_RUNNING: "Library Management System API is running"
    },
    FINE: {
      HAS_OUTSTANDING: "You have outstanding fines. Please pay them before borrowing books.",
      NOT_FOUND: "Fine not found",
      SUBMIT_SUCCESS: "Fine payment submitted successfully",
      APPROVE_SUCCESS: "Fine payment approved successfully",
      REJECT_SUCCESS: "Fine payment rejected"
    }
  },

  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

module.exports = CONSTANTS;
