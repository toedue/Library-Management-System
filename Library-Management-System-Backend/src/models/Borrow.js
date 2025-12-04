const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    borrowDate: { type: Date },
    dueDate: { type: Date },
    returnDate: { type: Date },
    reservationExpiry: { type: Date },
    status: {
      type: String,
      enum: ["reserved", "borrowed", "return_requested", "returned", "overdue", "expired", "queued"],
      default: "reserved",
    },
    collectedByAdmin: { type: Boolean, default: false },
    collectedAt: { type: Date },
    // Queue-based reservation fields
    queuePosition: { type: Number }, // Position in the queue (1 = first, 2 = second, etc.)
    holdUntil: { type: Date }, // When the book becomes available for this user (48 hours from availability)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Borrow", borrowSchema);


