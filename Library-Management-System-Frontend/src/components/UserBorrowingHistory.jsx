import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { FaChevronLeft, FaChevronRight, FaBook, FaExclamationTriangle, FaCheckCircle, FaClock, FaUndo, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { borrowAPI, utils } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const UserBorrowingHistory = () => {
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
    limit: 10
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load borrowing history
  const loadBorrowHistory = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await borrowAPI.getUserBorrowingHistory(page, limit);
      setBorrowHistory(response.data.borrowHistory || response.data);
      setPagination(response.data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalCount: response.data.length || 0,
        hasNextPage: false,
        hasPrevPage: page > 1,
        limit
      });
      setError(null);
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
    loadBorrowHistory(1, 10);
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    loadBorrowHistory(newPage, pagination.limit);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newLimit) => {
    loadBorrowHistory(1, newLimit);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'borrowed':
        return <FaBook className="text-blue-500" />;
      case 'returned':
        return <FaCheckCircle className="text-green-500" />;
      case 'overdue':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'reserved':
        return <FaClock className="text-yellow-500" />;
      case 'return_requested':
        return <FaUndo className="text-purple-500" />;
      default:
        return <FaBook className="text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'borrowed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'returned':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'return_requested':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className={`mt-6 mb-6 ${isDark ? "bg-gray-800 border-gray-700" : ""}`}>
        <CardHeader>
          <CardTitle className={isDark ? "text-white" : ""}>
            Borrowing History
          </CardTitle>
          <CardDescription className={isDark ? "text-gray-400" : ""}>
            Track all your borrowing and return activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading borrowing history...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`mt-6 mb-6 ${isDark ? "bg-gray-800 border-gray-700" : ""}`}>
        <CardHeader>
          <CardTitle className={isDark ? "text-white" : ""}>
            Borrowing History
          </CardTitle>
          <CardDescription className={isDark ? "text-gray-400" : ""}>
            Track all your borrowing and return activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className={`text-lg ${isDark ? "text-red-400" : "text-red-600"}`}>
              {error}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mt-6 mb-6 ${isDark ? "bg-gray-800 border-gray-700" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={isDark ? "text-white" : ""}>
              Borrowing History
            </CardTitle>
            <CardDescription className={isDark ? "text-gray-400" : ""}>
              Track all your borrowing and return activities
            </CardDescription>
          </div>
          <button
            onClick={() => setIsHistoryOpen((prev) => !prev)}
            className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${
              isDark 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
          >
            {isHistoryOpen ? (<><FaChevronUp /> Hide</>) : (<><FaChevronDown /> Show</>)}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {isHistoryOpen && (
          <>
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
                          Book
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
                      {borrowHistory.map((borrow) => (
                        <tr
                          key={borrow._id}
                          className={`border-b ${
                            isDark ? "border-gray-700" : "border-gray-200"
                          }`}
                        >
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              <img
                                src={utils.getBookCoverUrl(borrow.book)}
                                alt={borrow.book?.title}
                                className="w-10 h-14 object-cover rounded"
                              />
                              <div>
                                <div
                                  className={`font-medium ${
                                    isDark ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {borrow.book?.title || "Unknown Book"}
                                </div>
                                <div
                                  className={`text-sm ${
                                    isDark ? "text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  by {borrow.book?.author || "Unknown Author"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(borrow.status)}
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(borrow.status)}`}
                              >
                                {utils.getStatusText(borrow.status)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div
                              className={`text-sm ${
                                isDark ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {borrow.borrowDate ? utils.formatDateTime(borrow.borrowDate) : "N/A"}
                            </div>
                          </td>
                          <td className="py-3">
                            <div
                              className={`text-sm ${
                                isDark ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {borrow.dueDate ? utils.formatDateTime(borrow.dueDate) : "N/A"}
                            </div>
                          </td>
                          <td className="py-3">
                            <div
                              className={`text-sm ${
                                isDark ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {borrow.returnDate ? utils.formatDateTime(borrow.returnDate) : "N/A"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Rows per page:
                    </span>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                      className={`px-2 py-1 rounded border ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total)
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className={`p-2 rounded ${
                        pagination.hasPrevPage
                          ? isDark
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          : isDark
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className={`p-2 rounded ${
                        pagination.hasNextPage
                          ? isDark
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          : isDark
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FaBook className={`mx-auto text-4xl ${
                    isDark ? "text-gray-600" : "text-gray-400"
                  } mb-4`} />
                  <div
                    className={`text-lg ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    No borrowing history found
                  </div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Your borrowing activities will appear here
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserBorrowingHistory;
