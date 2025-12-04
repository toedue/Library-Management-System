const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { connectDB } = require("./config/db");
const { ENV } = require("./config/env");
const { runMaintenanceTasks } = require("./utils/dateUtils");
const Borrow = require("./models/Borrow");
const Book = require("./models/Book");
const Fine = require("./models/Fine");
const User = require("./models/User");
const reminderService = require("./services/reminderService");
const CONSTANTS = require("./constants");
const { setIO } = require("./services/socketServer");

const startServer = async () => {
  await connectDB();

  // Set up scheduled maintenance tasks
  const runScheduledMaintenance = async () => {
    try {
      await runMaintenanceTasks(Borrow, Book, Fine, User, CONSTANTS);
    } catch (error) {
      console.error("Scheduled maintenance failed:", error);
    }
  };

  // Run maintenance every 2 hours
  setInterval(runScheduledMaintenance, CONSTANTS.MAINTENANCE.INTERVAL_MS);

  // Run initial maintenance on server start
  runScheduledMaintenance();

  // Start the reminder service for email notifications
  reminderService.startScheduler();

  // Create HTTP server and Socket.IO
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: ENV.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true
    }
  });

  // Make io accessible to other modules
  setIO(io);

  io.on("connection", (socket) => {
    // Expect token via auth in handshake
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      socket.disconnect(true);
      return;
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      const userId = decoded.id || decoded._id;
      if (!userId) {
        socket.disconnect(true);
        return;
      }
      // Join per-user room
      socket.join(`user:${userId}`);
      socket.emit("connected", { message: "Socket connected" });
    } catch (_) {
      socket.disconnect(true);
    }
  });

  server.listen(ENV.PORT, () => {
    console.log(`Server running on http://localhost:${ENV.PORT}`);
    console.log(`Scheduled maintenance tasks enabled (runs every ${CONSTANTS.MAINTENANCE.INTERVAL_HOURS} hours)`);
    console.log("Email reminder service started");
    console.log("Socket.IO server started");
  });
};

startServer();
