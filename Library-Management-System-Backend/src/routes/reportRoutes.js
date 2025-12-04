const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  exportBorrowingReport,
  exportPaymentReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get(
  "/borrowings/pdf",
  authMiddleware,
  authorizeRoles("admin", "super_admin"),
  exportBorrowingReport
);

router.get(
  "/payments/pdf",
  authMiddleware,
  authorizeRoles("admin", "super_admin"),
  exportPaymentReport
);

module.exports = router;


