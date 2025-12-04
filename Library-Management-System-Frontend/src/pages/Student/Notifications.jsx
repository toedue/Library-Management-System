import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StudentSidebar from "@/components/StudentSidebar";
import StudentNavbar from "@/components/StudentNavbar";
import Footer from "@/components/Footer";
import NotificationCard from "@/components/NotificationCard";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FaBell,
  FaBook,
  FaCreditCard,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import { connectSocket, on, off } from "@/services/socket";
import toast from "react-hot-toast";
import { notificationAPI } from "@/services/api";

// Helper to map backend notification type to UI format
const mapNotificationType = (backendType) => {
  const typeMap = {
    reservation_created: "borrowing",
    borrow_confirmed: "borrowing",
    return_requested: "borrowing",
    return_confirmed: "borrowing",
    reservation_cancelled: "borrowing",
    payment_submitted: "payment",
    payment_approved: "payment",
    payment_rejected: "payment",
  };
  return typeMap[backendType] || "system";
};

// Helper to get priority based on notification type
const getPriority = (type) => {
  if (type.includes("overdue") || type.includes("rejected")) return "high";
  if (type.includes("approved") || type.includes("confirmed")) return "low";
  if (type.includes("submitted") || type.includes("requested")) return "medium";
  return "medium";
};

// Helper to get icon based on notification type
const getIcon = (type) => {
  if (type.includes("payment")) return <FaCreditCard className="text-green-500" />;
  if (type.includes("borrow") || type.includes("reservation")) return <FaBook className="text-blue-500" />;
  if (type.includes("return")) return <FaCheckCircle className="text-green-500" />;
  if (type.includes("overdue")) return <FaExclamationTriangle className="text-red-500" />;
  return <FaInfoCircle className="text-purple-500" />;
};

const Notifications = () => {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Load notifications from API on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationAPI.getMyNotifications(1, 50, filter);
        
        // Check if response has the expected structure
        if (!response.data || !response.data.notifications) {
          console.error("Unexpected response structure:", response.data);
          toast.error("Invalid response from server");
          setNotifications([]);
          return;
        }

        const fetchedNotifications = response.data.notifications.map((n) => ({
          id: n._id,
          type: mapNotificationType(n.type),
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt),
          read: n.read,
          priority: n.priority,
          icon: getIcon(n.type),
          backendType: n.type,
          data: n.data || {},
        }));
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to load notifications";
        toast.error(errorMessage);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [filter]);

  // Connect to Socket.IO and listen for notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = connectSocket();
    if (!socket) return;

    const handleNotification = async (payload) => {
      console.log("📩 Notification received:", payload);
      
      // Map backend notification to UI format
      const newNotification = {
        id: Date.now() + Math.random(), // Unique ID
        type: mapNotificationType(payload.type),
        title: payload.title || "Notification",
        message: payload.message || "You have a new notification.",
        timestamp: new Date(),
        read: false,
        priority: getPriority(payload.type),
        icon: getIcon(payload.type),
        backendType: payload.type,
        data: payload.data || {},
      };

      // Show toast notification
      toast.success(`${payload.title}: ${payload.message}`, {
        duration: 5000,
      });

      // Refresh notifications from API to get the saved one with proper ID
      // This ensures we have the MongoDB _id and all correct data
      try {
        const response = await notificationAPI.getMyNotifications(1, 50, "all");
        const fetchedNotifications = response.data.notifications.map((n) => ({
          id: n._id,
          type: mapNotificationType(n.type),
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt),
          read: n.read,
          priority: n.priority,
          icon: getIcon(n.type),
          backendType: n.type,
          data: n.data || {},
        }));
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Error refreshing notifications:", error);
        // Fallback: add to state if API refresh fails
        setNotifications((prev) => [newNotification, ...prev]);
      }
    };

    // Listen for notifications
    on("notification", handleNotification);

    return () => {
      off("notification", handleNotification);
      // Note: We don't disconnect the socket here because it might be used by other components
      // The App.jsx handles global socket connection/disconnection
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    return notif.type === filter;
  });

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={`flex min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <StudentSidebar />
      <main className="flex-1 p-5 md:p-6">
        <StudentNavbar />

        {/* Header Section */}
        <div className="mb-6 pt-6 md:pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                <FaBell className="text-white text-xl" />
              </div>
              <div>
                <h1
                  className={`text-2xl md:text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Notifications
                </h1>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Stay updated with your library activities
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Mark All Read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div
            className={`flex flex-wrap gap-2 p-1 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            {[
              { key: "all", label: "All", count: notifications.length },
              { key: "unread", label: "Unread", count: unreadCount },
              {
                key: "borrowing",
                label: "Borrowing",
                count: notifications.filter((n) => n.type === "borrowing")
                  .length,
              },
              {
                key: "payment",
                label: "Payments",
                count: notifications.filter((n) => n.type === "payment").length,
              },
              {
                key: "system",
                label: "System",
                count: notifications.filter((n) => n.type === "system").length,
              },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  filter === key
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    filter === key
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Grid */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Loading notifications...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <FaBell className="text-gray-400 text-3xl" />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              No notifications found
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {filter === "all"
                ? "You're all caught up!"
                : `No ${filter} notifications at the moment.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotifications.map((notification, index) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                index={index}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                getTimeAgo={getTimeAgo}
              />
            ))}
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
};

export default Notifications;
