const mongoose = require("mongoose");

const fineSchema = new mongoose.Schema(
  {
    borrow: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Borrow", 
      required: true 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    book: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Book", 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    daysOverdue: { 
      type: Number, 
      required: true 
    },
    dueDate: { 
      type: Date, 
      required: true 
    },
    calculatedAt: { 
      type: Date, 
      default: Date.now 
    },
    isPaid: { 
      type: Boolean, 
      default: false 
    },
    paidAt: { 
      type: Date 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fine", fineSchema);


