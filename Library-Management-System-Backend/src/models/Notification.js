const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // For faster queries
    },
    type: {
      type: String,
      required: true,
      enum: [
        "reservation_created",
        "borrow_confirmed",
        "return_requested",
        "return_confirmed",
        "reservation_cancelled",
        "payment_submitted",
        "payment_approved",
        "payment_rejected",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Store additional data like paymentId, borrowId, etc.
      default: {},
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);


