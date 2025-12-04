import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { utils } from "@/services/api";

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  return (
    <div
      className={`rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
      onClick={() => navigate(`/admin/book/${book._id}`)}
    >
      <img
        src={utils.getBookCoverUrl(book)}
        alt={book.title}
        className="h-64 w-40 object-cover mx-auto mt-4 rounded-lg"
      />
      <div className="p-4 flex-1 flex flex-col">
        <h2
          className={`text-lg font-bold ${
            isDark ? "text-white" : "text-blue-700"
          }`}
        >
          {book.title}
        </h2>
        <p
          className={`text-sm ${
            isDark ? "text-gray-300" : "text-gray-600"
          } mb-2`}
        >
          by {book.author}
        </p>
        <p
          className={`${
            isDark ? "text-gray-300" : "text-gray-700"
          } mb-3 flex-1`}
        >
          {book.description}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              isDark ? "bg-blue-800 text-blue-200" : "bg-blue-100 text-blue-800"
            }`}
          >
            Total: {book.totalCopies}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              isDark
                ? "bg-green-800 text-green-200"
                : "bg-green-100 text-green-800"
            }`}
          >
            Borrowed: {(Number(book.totalCopies) || 0) - (Number(book.availableCopies) || 0)}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              book.status === "Available"
                ? isDark
                  ? "bg-green-800 text-green-200"
                  : "bg-green-200 text-green-800"
                : isDark
                ? "bg-red-800 text-red-200"
                : "bg-red-200 text-red-800"
            }`}
          >
            {(Number(book.availableCopies) || 0) > 0 ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
