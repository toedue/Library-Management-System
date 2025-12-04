const Borrow = require("../models/Borrow");
const Payment = require("../models/Payment");
const {
  generateBorrowingReportPdf,
  generatePaymentReportPdf,
} = require("../services/pdfReportService");

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return Number.NaN;
  }
  return date;
};

const normaliseDateRange = (startDate, endDate) => {
  const errors = [];
  let start = parseDate(startDate);
  let end = parseDate(endDate);

  if (startDate && Number.isNaN(start)) {
    errors.push("Invalid startDate. Use a valid ISO date string.");
    start = null;
  }

  if (endDate && Number.isNaN(end)) {
    errors.push("Invalid endDate. Use a valid ISO date string.");
    end = null;
  }

  if (start) {
    start.setHours(0, 0, 0, 0);
  }

  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  if (start && end && start > end) {
    errors.push("startDate cannot be after endDate.");
  }

  return { start, end, errors };
};

const formatFilterDate = (date) => {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
};

const exportBorrowingReport = async (req, res) => {
  try {
    const { startDate, endDate, status, userId, bookId } = req.query;

    const { start, end, errors } = normaliseDateRange(startDate, endDate);
    if (errors.length) {
      return res.status(400).json({ message: "Invalid query parameters", errors });
    }

    const filters = {};
    if (start || end) {
      filters.createdAt = {};
      if (start) filters.createdAt.$gte = start;
      if (end) filters.createdAt.$lte = end;
    }
    if (status) {
      filters.status = status;
    }
    if (userId) {
      filters.user = userId;
    }
    if (bookId) {
      filters.book = bookId;
    }

    const borrowRecords = await Borrow.find(filters)
      .populate({ path: "book", select: "title author isbn" })
      .populate({ path: "user", select: "username email" })
      .sort({ createdAt: -1 })
      .lean();

    const buffer = await generateBorrowingReportPdf(borrowRecords, {
      filters: {
        startDate: formatFilterDate(start),
        endDate: formatFilterDate(end),
        status,
        user: userId,
        book: bookId,
      },
      generatedBy: req.user?.username || req.user?.email || req.user?._id?.toString() || "Unknown",
    });

    const filename = `borrowing-report-${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const exportPaymentReport = async (req, res) => {
  try {
    const { startDate, endDate, status, plan } = req.query;

    const { start, end, errors } = normaliseDateRange(startDate, endDate);
    if (errors.length) {
      return res.status(400).json({ message: "Invalid query parameters", errors });
    }

    const filters = {};
    if (start || end) {
      filters.submittedAt = {};
      if (start) filters.submittedAt.$gte = start;
      if (end) filters.submittedAt.$lte = end;
    }
    if (status) {
      filters.status = status;
    }
    if (plan) {
      filters.plan = plan;
    }

    const paymentRecords = await Payment.find(filters)
      .populate({ path: "user", select: "username email" })
      .sort({ submittedAt: -1 })
      .lean();

    const buffer = await generatePaymentReportPdf(paymentRecords, {
      filters: {
        startDate: formatFilterDate(start),
        endDate: formatFilterDate(end),
        status,
        plan,
      },
      generatedBy: req.user?.username || req.user?.email || req.user?._id?.toString() || "Unknown",
    });

    const filename = `payment-report-${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportBorrowingReport,
  exportPaymentReport,
};


