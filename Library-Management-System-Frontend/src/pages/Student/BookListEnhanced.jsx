import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import StudentBookCard from "@/components/StudentBookCard";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { booksAPI, borrowAPI, utils } from "@/services/api";
import toast from "react-hot-toast";

const BookListEnhanced = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowingStatus, setBorrowingStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const { isDark } = useTheme();

  const location = useLocation();

  useEffect(() => {
    fetchBooks();
    fetchBorrowingStatus();
  }, []);

  // Read query from URL and apply to search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearch(q);
  }, [location.search]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getAllBooks();
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch books");
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowingStatus = async () => {
    try {
      const response = await borrowAPI.getUserBorrowingStatus();
      setBorrowingStatus(response.data);
    } catch (err) {
      console.error("Error fetching borrowing status:", err);
    }
  };

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter((book) => book.availableCopies > 0);
    }

    // Sort books
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "author":
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case "available":
          aValue = a.availableCopies;
          bValue = b.availableCopies;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [search, statusFilter, sortBy, books]);

  const handleBorrowBook = async (bookId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [bookId]: true }));
      await borrowAPI.requestBorrow(bookId);
      await fetchBorrowingStatus(); // Refresh borrowing status
      toast.success(
        "Book reserved successfully! Please collect it within 24 hours."
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to reserve book";

      // Check if it's a membership pending error
      if (errorMessage.includes("membership is pending")) {
        toast.error(
          <div>
            <p className="font-medium">Membership Required</p>
            <p className="text-sm mt-1">{errorMessage}</p>
            <p className="text-sm mt-2">
              <a
                href="/student/profile"
                className="text-blue-600 hover:underline"
              >
                Go to Profile to Subscribe →
              </a>
            </p>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
      console.error("Error borrowing book:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchBooks}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-2`}
        >
          Available Books
        </h2>
        <p className={isDark ? "text-gray-300" : "text-gray-600"}>
          Browse our collection of {books.length} books
          {borrowingStatus && (
            <span className="ml-2 text-sm">
              • You can borrow {borrowingStatus.booksRemaining} more books
            </span>
          )}
        </p>
      </div>

      {/* Search and Filters */}
      <div
        className={`rounded-lg p-4 mb-6 ${
          isDark ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border appearance-none ${
                isDark
                  ? "bg-gray-600 border-gray-500 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
            >
              <option value="all">All Books</option>
              <option value="Available">Available Only</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="relative">
            <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border appearance-none ${
                isDark
                  ? "bg-gray-600 border-gray-500 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
            >
              <option value="title">Sort by Title</option>
              <option value="author">Sort by Author</option>
              <option value="available">Sort by Availability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div>
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <StudentBookCard
                key={book._id}
                book={book}
                onBorrow={handleBorrowBook}
                actionLoading={actionLoading[book._id]}
                canBorrow={
                  borrowingStatus?.booksRemaining > 0 &&
                  book.availableCopies > 0
                }
                borrowingStatus={borrowingStatus}
              />
            ))}
          </div>
        ) : (
          <div
            className={`text-center py-12 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <FaSearch
              className={`text-4xl mx-auto mb-4 ${
                isDark ? "text-gray-400" : "text-gray-300"
              }`}
            />
            <h3
              className={`text-lg font-semibold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              No books found
            </h3>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookListEnhanced;
