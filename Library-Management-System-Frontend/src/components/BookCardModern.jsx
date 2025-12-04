import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { FaBook, FaUsers, FaEye } from "react-icons/fa";

const BookCardModern = ({ book }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return isDark
          ? "bg-green-900 text-green-200"
          : "bg-green-100 text-green-800";
      case "Unavailable":
        return isDark ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800";
      default:
        return isDark
          ? "bg-gray-800 text-gray-200"
          : "bg-gray-100 text-gray-800";
    }
  };

  const getAvailabilityText = () => {
    const available = book.totalAmount - book.borrowed;
    return `${available} available of ${book.totalAmount}`;
  };

  return (
    <div
      className={`rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col overflow-hidden group ${
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200"
      }`}
      onClick={() => navigate(`/admin/book/${book.id}`)}
    >
      {/* Book Image */}
      <div className="relative overflow-hidden">
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              book.status
            )}`}
          >
            {book.status}
          </span>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <FaEye className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
          className={`text-sm mb-3 ${
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
          {/* Availability Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(book.borrowed / book.totalAmount) * 100}%`,
                backgroundColor: book.borrowed === 0 ? "#10B981" : "#3B82F6",
              }}
            />
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <FaBook className={isDark ? "text-blue-400" : "text-blue-600"} />
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                {getAvailabilityText()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FaUsers
                className={isDark ? "text-green-400" : "text-green-600"}
              />
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                {book.borrowed} borrowed
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <button
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                isDark
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-800"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/book/${book.id}`);
              }}
            >
              View Details
            </button>
            <button
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCardModern;
