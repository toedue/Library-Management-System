const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const CONSTANTS = require("../constants");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(CONSTANTS.ROLES),
      default: CONSTANTS.ROLES.USER,
    },
    membershipStatus: {
      type: String,
      enum: Object.values(CONSTANTS.MEMBERSHIP_STATUS),
      default: CONSTANTS.MEMBERSHIP_STATUS.PENDING,
    },
    membershipExpiryDate: { type: Date },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetTokenExpiry: { type: Date },
    hasOutstandingFine: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure we never expose password in JSON responses
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

userSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

// Hash password before saving if modified/new
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, CONSTANTS.JWT.SALT_ROUNDS);
    next();
  } catch (err) {
    next(err);
  }
});

// Hash password on findOneAndUpdate if provided
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (!update) return next();

  const password = update.password || (update.$set && update.$set.password);
  if (!password) return next();

  try {
    const hashed = await bcrypt.hash(password, CONSTANTS.JWT.SALT_ROUNDS);
    if (update.password) update.password = hashed;
    if (update.$set && update.$set.password) update.$set.password = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create reset token
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  console.log( resetToken, this.passwordResetToken );
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
