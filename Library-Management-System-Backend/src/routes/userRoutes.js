const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const userController = require("../controllers/userController");

// Public routes
router.post("/register", userController.register);
// router.post("/super-admin", userController.createSuperAdmin);
router.post("/login", userController.login);

// Password reset flow
router.post("/forgot-password", userController.forgotPassword);
router.get("/reset-password/:token", userController.validateResetToken);
router.post("/reset-password/:token", userController.resetPassword);

// Protected routes
router.get("/profile", authMiddleware, userController.getProfile);
router.delete("/profile", authMiddleware, userController.deleteProfile);

// Super Admin routes
router.post(
  "/admin",
  authMiddleware,
  authorizeRoles("super_admin"),
  userController.createAdmin
);
router.put(
  "/promote/:userId",
  authMiddleware,
  authorizeRoles("super_admin"),
  userController.promoteToAdmin
);
router.put(
  "/demote/:userId",
  authMiddleware,
  authorizeRoles("super_admin"),
  userController.demoteToUser
);
router.delete(
  "/:userId",
  authMiddleware,
  authorizeRoles("super_admin"),
  userController.deleteUser
);
router.get(
  "/all",
  authMiddleware,
  authorizeRoles("super_admin"),
  userController.getAllUsers
);

// Admin & Super Admin routes
router.put(
  "/membership/:userId",
  authMiddleware,
  authorizeRoles("admin", "super_admin"),
  userController.updateMembership
);
// Admin routes
router.delete(
  "/user/:userId",
  authMiddleware,
  authorizeRoles("admin"),
  userController.deleteRegularUser
);
router.get(
  "/users",
  authMiddleware,
  authorizeRoles("admin"),
  userController.getUsersForAdmin
);


module.exports = router;

