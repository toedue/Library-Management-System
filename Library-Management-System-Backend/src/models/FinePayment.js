const mongoose = require("mongoose");

const finePaymentSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    fines: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Fine", 
      required: true 
    }],
    totalAmount: { 
      type: Number, 
      required: true 
    },
    status: {
      type: String,
      enum: ["pending", "waiting_for_approval", "approved", "rejected"],
      default: "waiting_for_approval",
    },
    proof: {
      url: { type: String },
      publicId: { type: String },
      thumbnailUrl: { type: String },
    },
    bankAccountNumber: {
      type: String,
      required: true,
    },
    copyNumber: {
      type: String,
      required: true,
    },
    submittedAt: { 
      type: Date, 
      default: Date.now 
    },
    approvedAt: { 
      type: Date 
    },
    rejectedAt: { 
      type: Date 
    },
    rejectedReason: { 
      type: String 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FinePayment", finePaymentSchema);


