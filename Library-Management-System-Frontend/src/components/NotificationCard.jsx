import React from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaTimes,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";

const NotificationCard = ({
  notification,
  index,
  onMarkAsRead,
  onDelete,
  getTimeAgo,
}) => {
  const { isDark } = useTheme();

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "high":
        return {
          border: "border-l-red-500",
          bg: "bg-red-50/30 dark:bg-red-900/10",
          iconBg: "bg-red-100 dark:bg-red-900/30",
          accent: "from-red-500 to-red-600",
          text: "text-red-700 dark:text-red-300",
        };
      case "medium":
        return {
          border: "border-l-yellow-500",
          bg: "bg-yellow-50/30 dark:bg-yellow-900/10",
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          accent: "from-yellow-500 to-orange-500",
          text: "text-yellow-700 dark:text-yellow-300",
        };
      case "low":
        return {
          border: "border-l-green-500",
          bg: "bg-green-50/30 dark:bg-green-900/10",
          iconBg: "bg-green-100 dark:bg-green-900/30",
          accent: "from-green-500 to-green-600",
          text: "text-green-700 dark:text-green-300",
        };
      default:
        return {
          border: "border-l-blue-500",
          bg: "bg-blue-50/30 dark:bg-blue-900/10",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          accent: "from-blue-500 to-blue-600",
          text: "text-blue-700 dark:text-blue-300",
        };
    }
  };

  const styles = getPriorityStyles(notification.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
        isDark ? "bg-gray-800/90" : "bg-white/90"
      } backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/20 ${
        !notification.read
          ? `ring-2 ring-blue-500/20 shadow-blue-500/10 ${styles.bg}`
          : ""
      } ${styles.border} border-l-4`}
    >
      {/* Priority indicator gradient */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${styles.accent}`}
      ></div>

      {/* Subtle background pattern for unread */}
      {!notification.read && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-900/20 pointer-events-none"></div>
      )}

      <div className="relative p-6">
        <div className="flex items-start space-x-4">
          {/* Icon with enhanced styling */}
          <div
            className={`flex-shrink-0 p-3 rounded-xl ${styles.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
          >
            <div className="text-xl">{notification.icon}</div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Title with better typography */}
                <h4
                  className={`text-lg font-bold mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  } ${
                    !notification.read ? "text-blue-600 dark:text-blue-400" : ""
                  }`}
                >
                  {notification.title}
                </h4>

                {/* Message with improved spacing */}
                <p
                  className={`text-sm leading-relaxed mb-4 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {notification.message}
                </p>

                {/* Enhanced metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Timestamp */}
                    <div
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                        isDark
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <FaClock className="text-xs" />
                      <span>{getTimeAgo(notification.timestamp)}</span>
                    </div>

                    {/* Priority badge */}
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${styles.text} ${styles.iconBg}`}
                    >
                      {notification.priority.toUpperCase()}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Unread indicator */}
                    {!notification.read && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"
                      ></motion.div>
                    )}

                    {/* Action buttons - hidden by default, show on hover */}
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900/70 text-blue-600 dark:text-blue-400 transition-colors"
                          title="Mark as read"
                        >
                          <FaCheckCircle className="text-sm" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(notification.id)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/70 text-red-600 dark:text-red-400 transition-colors"
                        title="Delete notification"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
