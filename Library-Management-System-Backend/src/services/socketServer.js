const { createNotification } = require("../controllers/notificationController");

let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized");
  }
  return ioInstance;
}

async function emitToUser(userId, event, payload) {
  try {
    if (!ioInstance) return;
    
    // Emit via Socket.IO
    ioInstance.to(`user:${userId}`).emit(event, payload);
    
    // Save notification to MongoDB if it's a notification event
    if (event === "notification" && payload) {
      // Determine priority based on type
      let priority = "medium";
      if (payload.type?.includes("overdue") || payload.type?.includes("rejected")) {
        priority = "high";
      } else if (payload.type?.includes("approved") || payload.type?.includes("confirmed")) {
        priority = "low";
      }
      
      // Save to database
      await createNotification(userId, {
        type: payload.type,
        title: payload.title || "Notification",
        message: payload.message || "You have a new notification.",
        priority: priority,
        data: payload.data || {},
      });
    }
  } catch (error) {
    console.error("Error in emitToUser:", error);
  }
}

module.exports = { setIO, getIO, emitToUser };






