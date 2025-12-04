import AdminSidebar from "@/components/AdminSidebar";
import { useTheme } from "@/contexts/ThemeContext";
import React, { useState, useMemo, useEffect } from "react";
import { booksAPI } from "@/services/api";
import BookCardEnhanced from "@/components/BookCardEnhanced";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaChartBar,
  FaBook,
  FaUsers,
  FaClipboardList,
  FaSync,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ManageBookModern = () => {
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await booksAPI.getAllBooks();
        setBooks(response.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const availableBooks = books.reduce(
      (sum, book) => sum + (Number(book.availableCopies) || 0),
      0
    );
    const totalCopies = books.reduce(
      (sum, book) => sum + (Number(book.totalCopies) || 0),
      0
    );
    const borrowedBooks = totalCopies - availableBooks;

    return {
      totalBooks,
      availableBooks,
      borrowedBooks,
      totalCopies,
      utilizationRate: ((borrowedBooks / totalCopies) * 100).toFixed(1),
    };
  }, [books]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let filtered = books.filter((book) => {
      const title = (book.title || "").toLowerCase();
      const author = (book.author || "").toLowerCase();
      return (
        title.includes(search.toLowerCase()) ||
        author.includes(search.toLowerCase())
      );
    });

    if (statusFilter !== "all") {
      filtered = filtered.filter((book) => {
        const isAvailable = (Number(book.availableCopies) || 0) > 0;
        return statusFilter === "Available" ? isAvailable : !isAvailable;
      });
    }

    // Sort books
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "title":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        case "author":
          aValue = (a.author || "").toLowerCase();
          bValue = (b.author || "").toLowerCase();
          break;
        case "available":
          aValue = Number(a.availableCopies) || 0;
          bValue = Number(b.availableCopies) || 0;
          break;
        case "borrowed":
          aValue =
            (Number(a.totalCopies) || 0) - (Number(a.availableCopies) || 0);
          bValue =
            (Number(b.totalCopies) || 0) - (Number(b.availableCopies) || 0);
          break;
        default:
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [books, search, statusFilter, sortBy, sortOrder]);

  const quickActions = [
    {
      title: "View Analytics",
      description: "Detailed book analytics and reports",
      icon: <FaChartBar className="text-2xl" />,
      onClick: () => navigate("/admin/orders"),
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Refresh Data",
      description: "Refresh book data and statistics",
      icon: <FaSync className="text-2xl" />,
      onClick: () => window.location.reload(),
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div
      className={`flex flex-row min-h-screen ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <AdminSidebar />
      <main className="flex-1 px-6 py-6">
        <Navbar />

        {/* Header Section */}
        <div className="mb-8 pt-6 md:pt-8">
          <h1
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-blue-600"
            } mb-2`}
          >
            Book Management
          </h1>
          <p
            className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Manage your library's book collection with ease
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className={`rounded-xl p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Books
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.totalBooks}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg bg-blue-100 text-blue-600 ${
                  isDark ? "bg-blue-900 text-blue-200" : ""
                }`}
              >
                <FaBook className="text-xl" />
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Available Books
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.availableBooks}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg bg-green-100 text-green-600 ${
                  isDark ? "bg-green-900 text-green-200" : ""
                }`}
              >
                <FaBook className="text-xl" />
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Borrowed Copies
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.borrowedBooks}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg bg-yellow-100 text-yellow-600 ${
                  isDark ? "bg-yellow-900 text-yellow-200" : ""
                }`}
              >
                <FaUsers className="text-xl" />
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Utilization Rate
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.utilizationRate}%
                </p>
              </div>
              <div
                className={`p-3 rounded-lg bg-purple-100 text-purple-600 ${
                  isDark ? "bg-purple-900 text-purple-200" : ""
                }`}
              >
                <FaClipboardList className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className={`rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                isDark
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              } shadow-lg hover:shadow-xl`}
              onClick={action.onClick}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${action.color} text-white`}>
                  {action.icon}
                </div>
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {action.title}
              </h3>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {action.description}
              </p>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div
          className={`rounded-xl p-6 mb-8 ${
            isDark ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search Input */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
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
                className={`w-full pl-10 pr-4 py-3 rounded-lg border appearance-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="relative">
              <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border appearance-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              >
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="available">Sort by Available</option>
                <option value="borrowed">Sort by Borrowed</option>
              </select>
            </div>
          </div>

          {/* Sort Order Toggle */}
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Order:
            </span>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </div>

        {/* Books Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Book Collection ({filteredBooks.length} books)
            </h2>
          </div>

          {loading ? (
            <div
              className={`text-center py-12 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Loading books...
            </div>
          ) : error ? (
            <div
              className={`text-center py-12 ${
                isDark ? "text-red-300" : "text-red-600"
              }`}
            >
              {error}
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCardEnhanced key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-12 rounded-xl ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <FaBook
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
              <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default ManageBookModern;
