const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailService = require("../services/emailService");
const crypto = require("crypto");
const { ENV } = require("../config/env");

class UserController {
  // Validation helper
  validateRequiredFields(fields) {
    for (const field of fields) {
      if (!field.value) {
        return { valid: false, message: field.message };
      }
    }
    return { valid: true };
  }

  // Response helper
  sendResponse(res, status, message, data = null) {
    const response = { message };
    if (data) response.data = data;
    return res.status(status).json(response);
  }

  // Check existing user helper
  async checkExistingUser(username, email) {
    return await User.findOne({ $or: [{ username }, { email }] });
    return res
      .status(400)
      .json({ message: "Username or email already exists" });
  }

  // Generate JWT helper
  generateToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  // Send role change email helper
  async sendRoleChangeEmail(user, action) {
    const subject = `Role Updated: You have been ${
      action === "promoted" ? "promoted to Admin" : "demoted to User"
    }`;
    const htmlContent = `<p>Hello ${
      user.username
    },</p><p>Your account role has been ${
      action === "promoted"
        ? "updated to <strong>Admin</strong>"
        : "changed to <strong>User</strong>"
    }.</p>`;

    try {
      await emailService.sendEmail(user.email, subject, htmlContent);
    } catch (e) {
      console.warn(`Failed to send ${action} email:`, e?.message || e);
    }
  }

  // Common user creation logic
  async createUser(userData, role, res) {
    const validation = this.validateRequiredFields([
      { value: userData.username, message: "Username is required" },
      { value: userData.email, message: "Email is required" },
      { value: userData.password, message: "Password is required" },
    ]);

    if (!validation.valid) {
      return this.sendResponse(res, 400, validation.message);
    }

    const existingUser = await this.checkExistingUser(
      userData.username,
      userData.email
    );
    if (existingUser) {
      return this.sendResponse(res, 400, "Username or email already exists");
    }

    const user = new User({ ...userData, role });
    await user.save();
    return user;
  }

  // ========== AUTHENTICATION ROUTES ==========

  // Register new user
  register = async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res
          .status(400)
          .json({ message: "Username, email, and password are required" });
      }

      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Username or email already exists" });
      }

      const user = new User({ username, email, password, role: "user" });
      await user.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      this.sendResponse(res, 500, error.message);
    }
  };

  // Create Super Admin
  createSuperAdmin = async (req, res) => {
    try {
      const existingSuperAdmin = await User.findOne({ role: "super_admin" });
      if (existingSuperAdmin) {
        return this.sendResponse(
          res,
          400,
          "Super Admin already exists. Only one Super Admin is allowed."
        );
      }

      const { username, email, password } = req.body;
      const superAdmin = await this.createUser(
        { username, email, password },
        "super_admin",
        res
      );

      if (superAdmin) {
        this.sendResponse(res, 201, "Super Admin created successfully", {
          user: {
            id: superAdmin._id,
            username: superAdmin.username,
            email: superAdmin.email,
            role: superAdmin.role,
          },
        });
      }
    } catch (error) {
      this.sendResponse(res, 500, error.message);
    }
  };

  // Login - FIXED RESPONSE STRUCTURE (flat structure)
  login = async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if ((!username && !email) || !password) {
        return this.sendResponse(
          res,
          400,
          "Username or email and password are required"
        );
      }

      // Build query properly without null values
      let query = {};
      if (username && email) {
        query = { $or: [{ username }, { email }] };
      } else if (username) {
        query = { username };
      } else if (email) {
        query = { email };
      }

      const user = await User.findOne(query).select("+password");

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return this.sendResponse(res, 401, "Invalid credentials");
      }

      const token = this.generateToken(user);

      // ✅ FIXED: Return flat structure that frontend expects
      res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      this.sendResponse(res, 500, error.message);
    }
  };

  // Forgot password - send reset email
  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          message: "If the email exists, a reset link has been sent",
        });
      }

      // Generate reset token and expiry
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      // Send email with proper template
      const resetUrl = `${ENV.FRONTEND_URL}/reset-password/${resetToken}`;
      const { subject, html } = emailService.generatePasswordResetEmail(
        user.email,
        user.username,
        resetUrl
      );

      const emailResult = await emailService.sendEmail(user.email, subject, html);
      
      if (!emailResult.success) {
        console.error("Failed to send password reset email:", emailResult.error);
        // Still return success to user for security (don't reveal if email exists)
      }

      res.json({ message: "If the email exists, a reset link has been sent" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Validate reset token
  validateResetToken = async (req, res) => {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return this.sendResponse(res, 400, "Invalid or expired reset token", {
          valid: false,
        });
      }

      this.sendResponse(res, 200, "Token is valid", {
        valid: true,
        email: user.email,
      });
    } catch (error) {
      console.error("Token validation error:", error);
      this.sendResponse(res, 500, "Error validating token", { valid: false });
    }
  };

  // Reset password - validate token and update password
  resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }

      // Find user with valid reset token
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      // Update user password and clear reset token
      user.password = password;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;

      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Get profile
  getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        membershipStatus: user.membershipStatus || null,
        membershipExpiryDate: user.membershipExpiryDate || null,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Delete profile
  deleteProfile = async (req, res) => {
    try {
      await User.findByIdAndDelete(req.user._id);
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // ========== ADMIN ROUTES ==========

  // Create admin
  createAdmin = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const admin = await this.createUser(
        { username, email, password },
        "admin",
        res
      );

      if (admin) {
        this.sendResponse(res, 201, "Admin created successfully");
      }
    } catch (error) {
      this.sendResponse(res, 500, error.message);
    }
  };

  // Promote to admin
  promoteToAdmin = async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === "admin") {
        return res.status(400).json({ message: "User is already an admin" });
      }

      if (user.role === "super_admin") {
        return res.status(400).json({ message: "Cannot promote super admin" });
      }

      user.role = "admin";
      await user.save();

      // Send email notification (best-effort)
      try {
        await emailService.sendEmail(
          user.email,
          "Role Updated: You have been promoted to Admin",
          `<p>Hello ${user.username},</p><p>Your account role has been updated to <strong>Admin</strong>.</p>`
        );
      } catch (e) {
        console.warn("Failed to send promotion email:", e?.message || e);
      }

      res.json({
        message: "User promoted to admin successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Demote to user
  demoteToUser = async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== "admin") {
        return res.status(400).json({ message: "Can only demote admin users" });
      }

      user.role = "user";
      await user.save();

      // Send email notification (best-effort)
      try {
        await emailService.sendEmail(
          user.email,
          "Role Updated: You have been demoted to User",
          `<p>Hello ${user.username},</p><p>Your account role has been changed to <strong>User</strong>.</p>`
        );
      } catch (e) {
        console.warn("Failed to send demotion email:", e?.message || e);
      }

      res.json({
        message: "Admin demoted to user successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Delete user (Super Admin)
  deleteUser = async (req, res) => {
    try {
      const { userId } = req.params;

      if (userId === req.user._id.toString()) {
        return res
          .status(400)
          .json({ message: "Cannot delete your own account" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await User.findByIdAndDelete(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Get all users (Super Admin)
  getAllUsers = async (req, res) => {
    try {
      const users = await User.find({}).select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Update membership status
  updateMembership = async (req, res) => {
    try {
      const { userId } = req.params;
      const { membershipStatus } = req.body;

      if (!membershipStatus) {
        return res
          .status(400)
          .json({ message: "membershipStatus is required" });
      }

      if (!["pending", "approved", "suspended"].includes(membershipStatus)) {
        return res.status(400).json({ message: "Invalid membership status" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.membershipStatus = membershipStatus;
      await user.save();

      res.json({
        message: "Membership status updated successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          membershipStatus: user.membershipStatus,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Delete regular user (Admin)
  deleteRegularUser = async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== "user") {
        return res
          .status(403)
          .json({ message: "Can only delete regular users" });
      }

      await User.findByIdAndDelete(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Get users for admin
  getUsersForAdmin = async (req, res) => {
    try {
      const users = await User.find({
        role: { $in: ["user", "admin"] },
      }).select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

module.exports = new UserController();