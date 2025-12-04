const express = require("express");
const cors = require("cors");
const path = require("path");

const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const fineRoutes = require("./routes/fineRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const { errorHandler, notFound } = require("./middleware/errorHandler");
const CONSTANTS = require("./constants");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send(CONSTANTS.MESSAGES.GENERAL.API_RUNNING);
});

// Serve uploaded files (images, docs, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/fines", fineRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
