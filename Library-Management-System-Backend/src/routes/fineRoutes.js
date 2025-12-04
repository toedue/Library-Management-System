const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { upload, uploadToCloudinary } = require("../middleware/cloudinaryUploadMiddleware");
const {
  getMyFines,
  getAllFines,
  submitFinePayment,
  getMyFinePayments,
  getAllFinePayments,
  approveFinePayment,
  rejectFinePayment,
} = require("../controllers/fineController");

const router = express.Router();

// User endpoints - Get their own fines
router.get("/my-fines", authMiddleware, getMyFines);

// User endpoints - Get their own fine payment history
router.get("/my-payments", authMiddleware, getMyFinePayments);

// User endpoint - Submit fine payment with image proof
router.post(
  "/submit-payment",
  authMiddleware,
  upload.single("paymentProof"),
  uploadToCloudinary,
  submitFinePayment
);

// Admin endpoints - Get all fines
router.get("/", authMiddleware, authorizeRoles("admin", "super_admin"), getAllFines);

// Admin endpoints - Get all fine payments
router.get("/payments", authMiddleware, authorizeRoles("admin", "super_admin"), getAllFinePayments);

// Admin endpoints - Approve fine payment
router.post(
  "/payments/:finePaymentId/approve",
  authMiddleware,
  authorizeRoles("admin", "super_admin"),
  approveFinePayment
);

// Admin endpoints - Reject fine payment
router.post(
  "/payments/:finePaymentId/reject",
  authMiddleware,
  authorizeRoles("admin", "super_admin"),
  rejectFinePayment
);

module.exports = router;


