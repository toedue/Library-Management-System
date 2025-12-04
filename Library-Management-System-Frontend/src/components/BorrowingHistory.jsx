import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { FaChevronLeft, FaChevronRight, FaBook, FaExclamationTriangle } from "react-icons/fa";
import { borrowAPI, utils } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BorrowingHistory = ({ isAdmin = false }) => {
  const { isDark } = useTheme();
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 5
  });

  // Load borrowing history
  const loadBorrowHistory = async (page = 1, limit = 5) => {
    try {
      setLoading(true);
      const response = await borrowAPI.getAllBorrows();
      const allBorrows = response.data;
      
      // Calculate pagination
      const totalCount = allBorrows.length;
      const totalPages = Math.ceil(totalCount / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBorrows = allBorrows.slice(startIndex, endIndex);
      
      setBorrowHistory(paginatedBorrows);
      setPagination({
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      });
    } catch (err) {
      console.error("Failed to load borrowing history:", err);
      setError(err.response?.data?.message || 'Failed to load borrowing history');
      setBorrowHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Load borrowing history when component mounts
  useEffect(() => {
    loadBorrowHistory(1, 5);
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    loadBorrowHistory(newPage, pagination.limit);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newLimit) => {
    loadBorrowHistory(1, newLimit);
  };

  if (loading) {
    return (
      <Card className={`mb-6 ${isDark ? "bg-gray-800 border-gray-700" : ""}`}>
        <CardHeader>
          <CardTitle className={isDark ? "text-white" : ""}>
            Borrowing History
          </CardTitle>
          <CardDescription className={isDark ? "text-gray-400" : ""}>
            Track all borrowing and return activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Loading borrowing history...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`mb-6 ${isDark ? "bg-gray-800 border-gray-700" : ""}`}>
        <CardHeader>
          <CardTitle className={isDark ? "text-white" : ""}>
            Borrowing History
          </CardTitle>
          <CardDescription className={isDark ? "text-gray-400" : ""}>
            Track all borrowing and return activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className={`text-red-600 mb-4`}>{error}</p>
            <button
              onClick={() => loadBorrowHistory(1, pagination.limit)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-6 ${isDark ? "bg-gray-800 border-gray-700" : ""}`}>
      <CardHeader>
        <CardTitle className={isDark ? "text-white" : ""}>
          Borrowing History
        </CardTitle>
        <CardDescription className={isDark ? "text-gray-400" : ""}>
          Track all borrowing and return activities
        </CardDescription>
      </CardHeader>

      <CardContent>
        {borrowHistory.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={
                      isDark
                        ? "border-b border-gray-700"
                        : "border-b border-gray-200"
                    }
                  >
                    <th
                      className={`text-left py-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      User
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Status
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Borrow Date
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Due Date
                    </th>
                    <th
                      className={`text-left py-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Return Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {borrowHistory.map((entry, idx) => (
                    <tr
                      key={entry._id || idx}
                      className={
                        isDark
                          ? "border-b border-gray-700"
                          : "border-b border-gray-200"
                      }
                    >
                      <td
                        className={`py-3 ${
                          isDark ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        {entry.user?.username || "Unknown User"}
                      </td>
                      <td
                        className={`py-3 ${
                          isDark ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${utils.getStatusColor(entry.status)}`}
                        >
                          {utils.getStatusText(entry.status)}
                        </span>
                      </td>
                      <td
                        className={`py-3 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {entry.borrowDate ? utils.formatDate(entry.borrowDate) : "N/A"}
                      </td>
                      <td
                        className={`py-3 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {entry.dueDate ? utils.formatDate(entry.dueDate) : "N/A"}
                      </td>
                      <td
                        className={`py-3 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {entry.returnDate ? utils.formatDate(entry.returnDate) : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-6">
              {/* Rows per page selector */}
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Rows per page:
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value))}
                  className={`px-2 py-1 border rounded text-sm ${
                    isDark 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Pagination info and navigation */}
              <div className="flex items-center gap-4">
                {/* Page info */}
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {((pagination.currentPage - 1) * pagination.limit) + 1}–
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount}
                </span>

                {/* Navigation arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`p-2 rounded-lg transition-colors ${
                      pagination.hasPrevPage
                        ? isDark
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-600 hover:bg-gray-100"
                        : isDark
                        ? "text-gray-600 cursor-not-allowed"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <FaChevronLeft size={16} />
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`p-2 rounded-lg transition-colors ${
                      pagination.hasNextPage
                        ? isDark
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-600 hover:bg-gray-100"
                        : isDark
                        ? "text-gray-600 cursor-not-allowed"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <FaChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className={`text-lg font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              No borrowing history found
            </p>
            <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
              There are no borrowing records in the system yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BorrowingHistory;
