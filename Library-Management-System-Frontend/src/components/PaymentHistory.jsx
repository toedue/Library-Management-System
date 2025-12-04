import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { utils, paymentAPI } from "@/services/api";

const PaymentHistory = () => {
  const { isDark } = useTheme();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 5,
  });

  // Load payment history
  const loadPaymentHistory = async (page = 1, limit = 5) => {
    try {
      setLoading(true);
      const { data } = await paymentAPI.getPaymentHistory(page, limit);
      // console.log(data.payments);
      setPaymentHistory(data.payments || []);
      setPagination(
        data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalCount: (data.payments || []).length,
          hasNextPage: false,
          hasPrevPage: false,
          limit,
        }
      );
    } catch (err) {
      console.error("Failed to load payment history:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load payment history"
      );
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Load payment history when component mounts
  useEffect(() => {
    loadPaymentHistory(1, 5);
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    loadPaymentHistory(newPage, pagination.limit);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newLimit) => {
    loadPaymentHistory(1, newLimit);
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return {
          color:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          icon: <FaCheckCircle className="text-green-600" />,
          text: "Approved",
        };
      case "waiting_for_approval":
      case "pending":
        return {
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          icon: <FaClock className="text-yellow-600" />,
          text: "Pending",
        };
      case "rejected":
      case "canceled":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          icon: <FaExclamationTriangle className="text-red-600" />,
          text: "Rejected",
        };
      default:
        return {
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          icon: <FaClock className="text-gray-600" />,
          text: status,
        };
    }
  };

  if (loading) {
    return (
      <Card className={`${isDark ? "bg-gray-800" : "bg-white"}`}>
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <FaCreditCard />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span
              className={`ml-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Loading payment history...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${isDark ? "bg-gray-800" : "bg-white"}`}>
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <FaCreditCard />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FaExclamationTriangle className="mx-auto text-red-500 text-4xl mb-4" />
            <p
              className={`text-red-600 ${
                isDark ? "text-red-400" : "text-red-600"
              }`}
            >
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isDark ? "bg-gray-800" : "bg-white"}`}>
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          <FaCreditCard />
          Payment History
        </CardTitle>
        <CardDescription className={isDark ? "text-gray-400" : "text-gray-600"}>
          View your membership payment history and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <FaCreditCard className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              No payment history found
            </p>
          </div>
        ) : (
          <>
            {/* Payment History Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Plan
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Amount
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Status
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Date
                    </th>
                    {/* <th className={`text-left py-3 px-4 font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      Proof
                    </th> */}
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => {
                    const statusInfo = getStatusInfo(payment.status);
                    return (
                      <tr
                        key={payment.id}
                        className={`border-b ${
                          isDark ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <td
                          className={`py-3 px-4 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {payment.plan}
                        </td>
                        <td
                          className={`py-3 px-4 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {payment.amount} ETB
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.text}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {utils.formatDate(payment.submittedAt)}
                        </td>
                        {/* <td className={`py-3 px-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {payment.paymentProof ? (
                            <span className="text-green-600 dark:text-green-400">✓ Uploaded</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-6">
              {/* Rows per page selector */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Rows per page:
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) =>
                    handleRowsPerPageChange(parseInt(e.target.value))
                  }
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
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1}{" "}
                  to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.limit,
                    pagination.totalCount
                  )}{" "}
                  of {pagination.totalCount} entries
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`p-2 rounded-md transition-colors ${
                      pagination.hasPrevPage
                        ? isDark
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        : isDark
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <FaChevronLeft size={12} />
                  </button>

                  <span
                    className={`px-3 py-1 text-sm ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`p-2 rounded-md transition-colors ${
                      pagination.hasNextPage
                        ? isDark
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        : isDark
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
