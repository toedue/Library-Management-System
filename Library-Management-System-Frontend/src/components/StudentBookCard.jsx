import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { FaBook, FaUser, FaClock, FaExclamationTriangle, FaEye } from "react-icons/fa";
import { utils } from "@/services/api";
import { useNavigate } from "react-router-dom";

const StudentBookCard = ({ book, onBorrow, actionLoading = false, canBorrow = true, borrowingStatus, isAdmin = false }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const getStatusColor = () => {
    if (book.availableCopies > 0) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    } else {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
  };

  const getAvailabilityText = () => {
    const available = Number(book.availableCopies) || 0;
    return available > 0 ? "Available" : "Unavailable";
  };

  const getAvailabilityClass = () => {
    const available = Number(book.availableCopies) || 0;
    const total = Number(book.totalCopies) || 0;
    
    if (available === 0) {
      return "text-red-600 dark:text-red-400 font-semibold";
    }
    
    // For admins, show color based on availability percentage
    if (isAdmin && total > 0) {
      const availabilityPercentage = (available / total) * 100;
      if (availabilityPercentage >= 75) {
        return "text-green-600 dark:text-green-400 font-semibold";
      } else if (availabilityPercentage >= 50) {
        return "text-yellow-600 dark:text-yellow-400 font-semibold";
      } else if (availabilityPercentage >= 25) {
        return "text-orange-600 dark:text-orange-400 font-semibold";
      } else {
        return "text-red-600 dark:text-red-400 font-semibold";
      }
    }
    
    // For non-admins, always show green if available
    return "text-green-600 dark:text-green-400 font-semibold";
  };

  const getBorrowButtonText = () => {
    if (actionLoading) return "Reserving...";
    if (!canBorrow) {
      if (borrowingStatus?.booksRemaining === 0) return "Max Limit (3)";
      if (book.availableCopies === 0) return "Out of Stock";
      return "Cannot Borrow";
    }
    return "Reserve Book";
  };

  const isBorrowDisabled = () => {
    return actionLoading || !canBorrow || book.availableCopies === 0;
  };

  return (
    <div
      className={`rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group ${
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200"
      }`}
    >
      {/* Enhanced Book Image Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6">
        <div className="flex items-center justify-center">
          <img
            src={utils.getBookCoverUrl(book)}
            alt={book.title}
            className="w-36 h-52 object-contain transition-transform duration-300 group-hover:scale-105"
            style={{
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
              border: "2px solid rgba(255, 255, 255, 0.8)",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      {/* Book Details */}
      <div className="p-5 flex-1 flex flex-col">
        <h2
          className={`text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {book.title}
        </h2>

        <p
          className={`text-sm mb-3 font-medium ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          by {book.author}
        </p>

        <p
          className={`text-sm mb-4 line-clamp-3 ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {book.description}
        </p>

        {/* Stats and Actions */}
        <div className="mt-auto space-y-3">
          {/* Availability */}
          <div className="space-y-2">
            <div className="flex justify-center items-center text-sm">
              <span className={getAvailabilityClass()}>{getAvailabilityText()}</span>
            </div>
          </div>

          {/* Stats - visible only for admin users */}
          {isAdmin && (
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isDark ? "bg-blue-900" : "bg-blue-100"
                  }`}
                >
                  <FaBook
                    className={isDark ? "text-blue-300" : "text-blue-600"}
                    size={12}
                  />
                </div>
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  Total: {book.totalCopies}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isDark ? "bg-green-900" : "bg-green-100"
                  }`}
                >
                  <FaUser
                    className={isDark ? "text-green-300" : "text-green-600"}
                    size={12}
                  />
                </div>
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  Borrowed: {(Number(book.totalCopies) || 0) - (Number(book.availableCopies) || 0)}
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            {isAdmin && (
              <button
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/student/book/${book._id}`);
                }}
              >
                <FaEye size={14} />
                View Details
              </button>
            )}
            <button
              onClick={() => onBorrow(book._id)}
              disabled={isBorrowDisabled()}
              className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                isBorrowDisabled()
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : isDark
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              } shadow-md hover:shadow-lg ${!isAdmin ? 'w-full' : 'flex-1'}`}
            >
              {getBorrowButtonText()}
            </button>
          </div>

          {/* Warning Messages */}
          {borrowingStatus?.hasOverdueBooks && (
            <div className="flex items-center space-x-2 text-orange-600 text-sm">
              <FaExclamationTriangle />
              <span>You have overdue books that need to be returned first</span>
            </div>
          )}
          
          

          {/* Membership warning removed per request */}
        </div>
      </div>
    </div>
  );
};

export default StudentBookCard;
