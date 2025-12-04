const Fine = require("../models/Fine");
const FinePayment = require("../models/FinePayment");
const User = require("../models/User");
const Borrow = require("../models/Borrow");
const CONSTANTS = require("../constants");

// Get user's outstanding fines
const getMyFines = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all unpaid fines for the user with book details
    const fines = await Fine.find({
      user: userId,
      isPaid: false,
    })
      .populate("book", "title author ISBN")
      .populate("borrow", "borrowDate dueDate status")
      .sort({ calculatedAt: -1 })
      .lean();

    const totalAmount = fines.reduce((sum, fine) => sum + fine.amount, 0);

    res.json({
      fines,
      totalAmount,
      count: fines.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all fines (Admin only)
const getAllFines = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.max(parseInt(req.query.limit || "10"), 1);

    // Get all fines with user and book details
    const totalCount = await Fine.countDocuments({});
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);
    
    const fines = await Fine.find({})
      .populate("user", "username email")
      .populate("book", "title author ISBN")
      .populate("borrow", "borrowDate dueDate status")
      .sort({ calculatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Calculate summary stats
    const paidCount = await Fine.countDocuments({ isPaid: true });
    const unpaidCount = await Fine.countDocuments({ isPaid: false });
    const totalPaid = await Fine.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalUnpaid = await Fine.aggregate([
      { $match: { isPaid: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      fines,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
      stats: {
        paidCount,
        unpaidCount,
        totalPaid: totalPaid[0]?.total || 0,
        totalUnpaid: totalUnpaid[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit fine payment (User submits proof)
const submitFinePayment = async (req, res) => {
  try {
    const userId = req.user._id;
    let { fineIds } = req.body;

    // Handle fineIds from FormData - multer may send as array or string
    if (!fineIds) {
      return res.status(400).json({ message: "Fine IDs array is required" });
    }

    // Normalize fineIds to an array of valid ObjectId-like strings
    const normalizedIds = [];

    const pushId = (id) => {
      if (!id || typeof id !== "string") return;
      const trimmed = id.trim();
      if (!trimmed) return;
      normalizedIds.push(trimmed);
    };

    if (Array.isArray(fineIds)) {
      for (const entry of fineIds) {
        if (typeof entry === "string") {
          const s = entry.trim();
          if (!s) continue;
          // Try parse JSON array if it looks like one
          if (s.startsWith("[") && s.endsWith("]")) {
            try {
              const arr = JSON.parse(s);
              if (Array.isArray(arr)) {
                arr.forEach((x) => pushId(String(x)));
                continue;
              }
            } catch (_) {
              // Ignore parse error and try other strategies
            }
          }
          // Support comma-separated
          if (s.includes(",")) {
            s.split(",").forEach((x) => pushId(x));
            continue;
          }
          pushId(s);
        } else if (entry) {
          pushId(String(entry));
        }
      }
    } else if (typeof fineIds === "string") {
      const s = fineIds.trim();
      if (s.startsWith("[") && s.endsWith("]")) {
        try {
          const arr = JSON.parse(s);
          if (Array.isArray(arr)) {
            arr.forEach((x) => pushId(String(x)));
          }
        } catch (_) {
          s.split(",").forEach((x) => pushId(x));
        }
      } else if (s.includes(",")) {
        s.split(",").forEach((x) => pushId(x));
      } else {
        pushId(s);
      }
    } else if (fineIds) {
      pushId(String(fineIds));
    }

    // De-duplicate and validate ObjectId format
    const uniqueIds = Array.from(new Set(normalizedIds));
    const mongoose = require("mongoose");
    const validFineIds = uniqueIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    fineIds = validFineIds;

    if (fineIds.length === 0) {
      return res.status(400).json({ message: "Fine IDs array is required" });
    }

    // Verify all fines belong to the user and are unpaid
    const fines = await Fine.find({
      _id: { $in: fineIds },
      user: userId,
      isPaid: false,
    });

    if (fines.length !== fineIds.length) {
      return res.status(400).json({
        message: "Some fines are not found or already paid",
      });
    }

    // Calculate total amount
    const totalAmount = fines.reduce((sum, fine) => sum + fine.amount, 0);

    // Get bank account number and copy number from request body
    const { bankAccountNumber, copyNumber } = req.body;

    if (!bankAccountNumber || !copyNumber) {
      return res.status(400).json({ 
        message: "Bank account number and copy number are required" 
      });
    }

    // Create fine payment
    const finePayment = new FinePayment({
      user: userId,
      fines: fineIds,
      totalAmount,
      status: "waiting_for_approval",
      bankAccountNumber,
      copyNumber,
      proof: req.cloudinaryResult
        ? {
            url: req.cloudinaryResult.url,
            publicId: req.cloudinaryResult.publicId,
            thumbnailUrl: req.cloudinaryResult.thumbnailUrl,
          }
        : undefined,
      submittedAt: new Date(),
    });

    await finePayment.save();

    res.status(201).json({
      message: CONSTANTS.MESSAGES.FINE.SUBMIT_SUCCESS,
      finePayment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's fine payment history
const getMyFinePayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.max(parseInt(req.query.limit || "5"), 1);

    const totalCount = await FinePayment.countDocuments({ user: userId });
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);
    
    const finePayments = await FinePayment.find({ user: userId })
      .populate("fines", "amount daysOverdue")
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      finePayments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all fine payments (Admin only)
const getAllFinePayments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.max(parseInt(req.query.limit || "10"), 1);

    const totalCount = await FinePayment.countDocuments({});
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);
    
    const finePayments = await FinePayment.find({})
      .populate("user", "username email")
      .populate("fines", "amount daysOverdue")
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      finePayments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve fine payment (Admin only)
const approveFinePayment = async (req, res) => {
  try {
    const { finePaymentId } = req.params;
    
    const finePayment = await FinePayment.findById(finePaymentId)
      .populate("fines");

    if (!finePayment) {
      return res.status(404).json({ 
        message: CONSTANTS.MESSAGES.FINE.NOT_FOUND 
      });
    }

    if (finePayment.status === "approved") {
      return res.status(400).json({ 
        message: "This fine payment has already been approved" 
      });
    }

    // Update fine payment status
    finePayment.status = "approved";
    finePayment.approvedAt = new Date();
    await finePayment.save();

    // Mark all fines as paid
    await Fine.updateMany(
      { _id: { $in: finePayment.fines } },
      { 
        $set: { 
          isPaid: true,
          paidAt: new Date()
        } 
      }
    );

    // Check if user has any remaining outstanding fines
    const remainingUnpaidFines = await Fine.countDocuments({
      user: finePayment.user,
      isPaid: false,
    });

    // Update user's hasOutstandingFine flag
    await User.findByIdAndUpdate(finePayment.user, {
      hasOutstandingFine: remainingUnpaidFines > 0,
    });

    res.json({
      message: CONSTANTS.MESSAGES.FINE.APPROVE_SUCCESS,
      finePayment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject fine payment (Admin only)
const rejectFinePayment = async (req, res) => {
  try {
    const { finePaymentId } = req.params;
    const { reason } = req.body;

    const finePayment = await FinePayment.findById(finePaymentId);

    if (!finePayment) {
      return res.status(404).json({ 
        message: CONSTANTS.MESSAGES.FINE.NOT_FOUND 
      });
    }

    if (finePayment.status === "approved") {
      return res.status(400).json({ 
        message: "Cannot reject an already approved fine payment" 
      });
    }

    // Update fine payment status
    finePayment.status = "rejected";
    finePayment.rejectedAt = new Date();
    finePayment.rejectedReason = reason || "No reason provided";
    await finePayment.save();

    res.json({
      message: CONSTANTS.MESSAGES.FINE.REJECT_SUCCESS,
      finePayment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyFines,
  getAllFines,
  submitFinePayment,
  getMyFinePayments,
  getAllFinePayments,
  approveFinePayment,
  rejectFinePayment,
};


