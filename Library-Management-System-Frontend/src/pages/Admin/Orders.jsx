import AdminSidebar from "@/components/AdminSidebar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { FaCheck, FaTimes, FaClock, FaExclamationTriangle, FaBook, FaUser, FaCalendarAlt, FaCreditCard, FaEye, FaCheckCircle, FaBan, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { borrowAPI, utils, paymentAPI } from "@/services/api";
import toast from "react-hot-toast";

const Orders = () => {
  const { isDark } = useTheme();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState('all'); // all, pending, borrowed, returned, overdue
  const [activeTab, setActiveTab] = useState('borrowings'); // borrowings, payments
  const [payments, setPayments] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('all'); // all, waiting_for_approval, approved, rejected
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentHistoryPage, setPaymentHistoryPage] = useState(1);
  const [paymentHistoryTotalPages, setPaymentHistoryTotalPages] = useState(1);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [allPaymentHistory, setAllPaymentHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [borrowPage, setBorrowPage] = useState(1);
  const borrowPageSize = 10;

  useEffect(() => {
    fetchBorrows();
    fetchPayments();
    fetchPaymentHistory();
  }, []);

  const fetchPayments = async (page = 1, limit = 5) => {
    try {
      setPaymentLoading(true);
      const { data } = await paymentAPI.getAllPayments(page, limit);
      setPayments(data.payments || []);
      setPaymentHistoryTotalPages(data.totalPages || 1);
      setPaymentHistoryPage(page); // Update the current page state
    } catch (err) {
      console.error('Error fetching payments:', err);
      toast.error(err?.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      setPaymentLoading(true);
      
      // Fetch all payments by getting multiple pages
      let allPayments = [];
      let currentPage = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const { data } = await paymentAPI.getAllPayments(currentPage, 50); // Fetch 50 per page
        const payments = data.payments || [];
        allPayments = [...allPayments, ...payments];
        
        // Check if we have more pages
        hasMorePages = currentPage < (data.pagination?.totalPages || 1);
        currentPage++;
        
        // Safety break to prevent infinite loops
        if (currentPage > 20) break;
      }
      
      const historyPayments = allPayments.filter(p => p.status !== 'waiting_for_approval');
      
      setAllPaymentHistory(historyPayments);
      
      // Calculate pagination
      const pageSize = 5;
      const totalPages = Math.max(1, Math.ceil(historyPayments.length / pageSize));
      setPaymentHistoryTotalPages(totalPages);
      
      // Set current page data directly using the fetched data
      const startIndex = (paymentHistoryPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedHistory = historyPayments.slice(startIndex, endIndex);
      
      setPaymentHistory(paginatedHistory);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setAllPaymentHistory([]);
      setPaymentHistory([]);
      setPaymentHistoryTotalPages(1);
      setPaymentHistoryPage(1);
    } finally {
      setPaymentLoading(false);
    }
  };

  const updatePaymentHistoryPage = (page) => {
    const pageSize = 5;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedHistory = allPaymentHistory.slice(startIndex, endIndex);
    setPaymentHistory(paginatedHistory);
    setPaymentHistoryPage(page);
  };

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const response = await borrowAPI.getAllBorrows();
      setBorrows(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch borrows');
      console.error('Error fetching borrows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCollection = async (borrowId) => {
    try {
      setActionLoading(prev => ({ ...prev, [borrowId]: true }));
      await borrowAPI.confirmCollection(borrowId, 14); // 14 days default
      await fetchBorrows(); // Refresh data
      toast.success('Book collection confirmed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm collection');
      console.error('Error confirming collection:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [borrowId]: false }));
    }
  };

  const handleConfirmReturn = async (borrowId) => {
    try {
      setActionLoading(prev => ({ ...prev, [borrowId]: true }));
      await borrowAPI.confirmReturn(borrowId);
      await fetchBorrows(); // Refresh data
      toast.success('Book return confirmed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm return');
      console.error('Error confirming return:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [borrowId]: false }));
    }
  };


  const handleApprovePayment = async (paymentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [paymentId]: true }));
      await paymentAPI.approvePayment(paymentId);
      setPaymentHistoryPage(1); // Reset to first page
      await fetchPayments(1, 5); // Fetch first page
      await fetchPaymentHistory(); // Refresh payment history
      toast.success('Payment approved successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve payment');
      console.error('Error approving payment:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  const handleRejectPayment = async (paymentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [paymentId]: true }));
      await paymentAPI.rejectPayment(paymentId, 'Rejected by admin');
      setPaymentHistoryPage(1); // Reset to first page
      await fetchPayments(1, 5); // Fetch first page
      await fetchPaymentHistory(); // Refresh payment history
      toast.success('Payment rejected.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject payment');
      console.error('Error rejecting payment:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  const confirmApprovePayment = (payment) => {
    toast((t) => (
      <div>
        <p className="mb-2">Approve payment for <strong>{payment.user?.username || payment.user?.email || 'user'}</strong>?</p>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-sm rounded bg-green-600 hover:bg-green-700 text-white"
            onClick={async () => {
              toast.dismiss(t.id);
              await handleApprovePayment(payment._id);
            }}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const confirmRejectPayment = (payment) => {
    toast((t) => (
      <div>
        <p className="mb-2">Reject payment for <strong>{payment.user?.username || payment.user?.email || 'user'}</strong>?</p>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
            onClick={async () => {
              toast.dismiss(t.id);
              await handleRejectPayment(payment._id);
            }}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const filteredBorrows = borrows.filter(borrow => {
    if (filter === 'all') return true;
    if (filter === 'pending') return borrow.status === 'reserved';
    if (filter === 'borrowed') return borrow.status === 'borrowed';
    if (filter === 'return_requested') return borrow.status === 'return_requested';
    if (filter === 'returned') return borrow.status === 'returned';
    if (filter === 'overdue') return borrow.status === 'overdue' || (borrow.dueDate && utils.isOverdue(borrow.dueDate));
    return true;
  });

  const borrowTotalPages = Math.max(1, Math.ceil(filteredBorrows.length / borrowPageSize));
  const paginatedBorrows = filteredBorrows.slice(
    (borrowPage - 1) * borrowPageSize,
    borrowPage * borrowPageSize
  );

  if (loading) {
    return (
      <div className={`flex flex-row min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
        <AdminSidebar />
        <main className="flex-1 px-6 py-3">
          <Navbar />
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? "border-blue-400" : "border-blue-600"}`}></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
  return (
    <div className={`flex flex-row min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
      <AdminSidebar />
      <main className="flex-1 px-6 py-3">
        <Navbar />
          <div className={`text-center py-12 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            <FaExclamationTriangle className={`text-4xl mx-auto mb-4 ${isDark ? "text-red-400" : "text-red-500"}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-red-400" : "text-red-600"}`}>Error</h3>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>{error}</p>
            <button
              onClick={fetchBorrows}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex flex-row min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
      <AdminSidebar />
      <main className="flex-1 px-6 py-3">
        <Navbar />
        
        <div className="w-full max-w-none">
          <div className="mb-6 pt-6 md:pt-8">
            <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-blue-600"} mb-2`}>
              Manage Orders & Payments
            </h1>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>
              Manage book reservations, confirmations, returns, and membership payments
            </p>
          </div>

          {/* Tab Navigation */}
          <div className={`rounded-lg p-1 mb-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-md`}>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('borrowings')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'borrowings'
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : isDark
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-blue-700 hover:bg-gray-100"
                }`}
              >
                <FaBook className="inline mr-2" />
                Borrowings & Reservations
                {borrows.filter(b => b.status === 'reserved' || b.status === 'return_requested').length > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    isDark ? "bg-orange-600 text-white" : "bg-blue-100 text-blue-800"
                  }`}>
                    {borrows.filter(b => b.status === 'reserved' || b.status === 'return_requested').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'payments'
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : isDark
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-blue-700 hover:bg-gray-100"
                }`}
              >
                <FaCreditCard className="inline mr-2" />
                Membership Payments
                {payments.filter(p => p.status === 'waiting_for_approval').length > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    isDark ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-800"
                  }`}>
                    {payments.filter(p => p.status === 'waiting_for_approval').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter and Actions - Only for Borrowings */}
          {activeTab === 'borrowings' && (
            <div className={`rounded-lg p-4 mb-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-md`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <label className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-700"}`}>
                    Filter:
                  </label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending Reservations</option>
                    <option value="borrowed">Borrowed</option>
                    <option value="return_requested">Return Requested</option>
                    <option value="returned">Returned</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                
                
              </div>
            </div>
          )}

          {/* Content based on active tab */}
          {activeTab === 'borrowings' ? (
            /* Borrowings Table */
            <div className={`rounded-lg shadow-md overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}>
            {paginatedBorrows.length > 0 ? (
              <div>
                <table className="w-full text-sm table-fixed">
                  <thead className={`${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                    <tr>
                      <th className={`w-2/5 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                        Book
                      </th>
                      <th className={`w-1/5 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                        Student
                      </th>
                      <th className={`w-1/6 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                        Status
                      </th>
                      <th className={`w-1/6 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                        Dates
                      </th>
                      <th className={`w-1/6 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                    {paginatedBorrows.map((borrow) => {
                      const book = borrow.book || {};
                      const user = borrow.user || {};
                      const daysRemaining = borrow.dueDate ? utils.getDaysRemaining(borrow.dueDate) : null;
                      const isOverdue = borrow.dueDate ? utils.isOverdue(borrow.dueDate) : false;
                      
                      return (
                        <tr key={borrow._id} className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <img
                                src={utils.getBookCoverUrl(book || {})}
                                alt={book?.title || "Book"}
                                className="w-12 h-16 object-cover rounded-lg mr-3 flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`} title={book?.title || "Unknown Title"}>
                                  {book?.title || "Unknown Title"}
                                </div>
                                <div className={`text-xs truncate ${isDark ? "text-gray-300" : "text-gray-500"}`} title={`by ${book?.author || "Unknown"}`}>
                                  by {book?.author || "Unknown"}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className={`text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`} title={user?.name || user?.username || "Unknown"}>
                              {user?.name || user?.username || "Unknown"}
                            </div>
                            <div className={`text-xs truncate ${isDark ? "text-gray-300" : "text-gray-500"}`} title={user?.email || ""}>
                              {user?.email || ""}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${utils.getStatusColor(borrow.status)}`}>
                                {utils.getStatusText(borrow.status)}
                              </span>
                              {daysRemaining !== null && (
                                <div className={`text-[10px] ${
                                  isOverdue
                                    ? "text-red-600"
                                    : daysRemaining <= 3
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }`}>
                                  {isOverdue 
                                    ? `${Math.abs(daysRemaining)} days overdue`
                                    : `${daysRemaining} days remaining`
                                  }
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className={`text-xs space-y-1 ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                              {borrow.borrowDate && (
                                <div className="truncate" title={`Borrowed: ${utils.formatDate(borrow.borrowDate)}`}>Borrowed: {utils.formatDate(borrow.borrowDate)}</div>
                              )}
                              {borrow.dueDate && (
                                <div className="truncate" title={`Due: ${utils.formatDate(borrow.dueDate)}`}>Due: {utils.formatDate(borrow.dueDate)}</div>
                              )}
                              {borrow.reservationExpiry && (
                                <div className="truncate" title={`Expires: ${utils.formatDateTime(borrow.reservationExpiry)}`}>Expires: {utils.formatDateTime(borrow.reservationExpiry)}</div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3 text-sm font-medium">
                            {borrow.status === 'reserved' && (
                              <button
                                onClick={() => handleConfirmCollection(borrow._id)}
                                disabled={actionLoading[borrow._id]}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                  actionLoading[borrow._id]
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                              >
                                <FaCheck className="inline mr-1" />
                                {actionLoading[borrow._id] ? "Confirming..." : "Confirm"}
                              </button>
                            )}
                            {borrow.status === 'borrowed' && (
                              <span className="text-green-600 text-xs">
                                <FaCheck className="inline mr-1" />
                                Collected
                              </span>
                            )}
                            {borrow.status === 'return_requested' && (
                              <button
                                onClick={() => handleConfirmReturn(borrow._id)}
                                disabled={actionLoading[borrow._id]}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                  actionLoading[borrow._id]
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                              >
                                <FaCheck className="inline mr-1" />
                                {actionLoading[borrow._id] ? "Confirming..." : "Confirm Return"}
                              </button>
                            )}
                            {borrow.status === 'returned' && (
                              <span className="text-blue-600 text-xs">
                                <FaBook className="inline mr-1" />
                                Returned
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
                              <div className="text-center py-12">
                  <FaBook className={`text-4xl mx-auto mb-4 ${isDark ? "text-gray-400" : "text-gray-300"}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    No borrowings found
                  </h3>
                  <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                    {filter === 'all' ? 'No borrowings or reservations yet.' : `No ${filter} borrowings found.`}
                  </p>
                </div>
            )}
            {filteredBorrows.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Showing {((borrowPage - 1) * borrowPageSize) + 1} to {Math.min(borrowPage * borrowPageSize, filteredBorrows.length)} of {filteredBorrows.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setBorrowPage(prev => Math.max(1, prev - 1))}
                    disabled={borrowPage === 1}
                    className={`px-3 py-1 text-sm rounded ${
                      borrowPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : isDark
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } border ${isDark ? "border-gray-600" : "border-gray-300"}`}
                  >
                    Previous
                  </button>
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Page {borrowPage} of {borrowTotalPages}
                  </span>
                  <button
                    onClick={() => setBorrowPage(prev => Math.min(borrowTotalPages, prev + 1))}
                    disabled={borrowPage === borrowTotalPages}
                    className={`px-3 py-1 text-sm rounded ${
                      borrowPage === borrowTotalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : isDark
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } border ${isDark ? "border-gray-600" : "border-gray-300"}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          ) : (
            /* Payments Table */
            <div className={`rounded-lg shadow-md overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}>
              {paymentLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? "border-blue-400" : "border-blue-600"}`}></div>
                </div>
              ) : payments.length > 0 ? (
                <div className="overflow-x-auto">
                  {/* Pending Approvals (with actions) */}
                  <div className="p-4">
                    <h3 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Pending Approvals</h3>
                    <table className="w-full text-sm">
                      <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                          <th className={`w-1/6 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>User</th>
                          <th className={`w-1/6 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Plan</th>
                          <th className={`w-1/12 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Amount</th>
                          <th className={`w-1/6 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Submitted</th>
                          <th className={`w-1/6 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Proof</th>
                          <th className={`w-1/6 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {payments.filter(p => p.status === 'waiting_for_approval').map(payment => (
                          <tr key={payment._id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                            <td className="px-2 py-3">
                              <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`} title={payment.user?.username || payment.user?.name || 'Unknown'}>{payment.user?.username || payment.user?.name || 'Unknown'}</div>
                              <div className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-500'}`} title={payment.user?.email || ''}>{payment.user?.email || ''}</div>
                            </td>
                            <td className="px-2 py-3"><div className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`} title={payment.plan}>{payment.plan}</div></td>
                            <td className="px-2 py-3"><div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{payment.amount} ETB</div></td>
                            <td className="px-2 py-3">
                              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{new Date(payment.submittedAt).toLocaleDateString()}</div>
                              <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{new Date(payment.submittedAt).toLocaleTimeString()}</div>
                            </td>
                            <td className="px-2 py-3">
                              {payment?.proof?.url ? (
                                <a href={payment.proof.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                                  <img src={payment.proof.thumbnailUrl || payment.proof.url} alt="Proof" className="w-8 h-8 object-cover rounded border" />
                                  <span className="text-blue-600 hover:text-blue-800 text-xs font-medium"><FaEye className="inline mr-1" />View</span>
                                </a>
                              ) : (
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No proof</span>
                              )}
                            </td>
                            <td className="px-2 py-3 text-sm font-medium">
                              <div className="flex flex-col space-y-1">
                                <button onClick={() => confirmApprovePayment(payment)} disabled={actionLoading[payment._id]} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${actionLoading[payment._id] ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                                  <FaCheckCircle className="inline mr-1" />{actionLoading[payment._id] ? 'Processing...' : 'Approve'}
                                </button>
                                <button onClick={() => confirmRejectPayment(payment)} disabled={actionLoading[payment._id]} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${actionLoading[payment._id] ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                                  <FaBan className="inline mr-1" />{actionLoading[payment._id] ? 'Processing...' : 'Reject'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {payments.filter(p => p.status === 'waiting_for_approval').length === 0 && (
                          <tr>
                            <td colSpan={6} className={`px-4 py-6 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No pending payments</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Payment History (no actions) */}
                  <div className="p-4 pt-0">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment History</h3>
                      <div className="flex items-center gap-3">
                        {/* Pagination Controls */}
                        {isHistoryOpen && paymentHistory.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const newPage = Math.max(1, paymentHistoryPage - 1);
                                updatePaymentHistoryPage(newPage);
                              }}
                              disabled={paymentHistoryPage === 1}
                              className={`px-3 py-1 text-sm rounded ${
                                paymentHistoryPage === 1
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : isDark
                                  ? "bg-gray-700 text-white hover:bg-gray-600"
                                  : "bg-white text-gray-700 hover:bg-gray-50"
                              } border ${isDark ? "border-gray-600" : "border-gray-300"}`}
                            >
                              Previous
                            </button>
                            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                              Page {paymentHistoryPage} of {paymentHistoryTotalPages}
                            </span>
                            <button
                              onClick={() => {
                                const newPage = Math.min(paymentHistoryTotalPages, paymentHistoryPage + 1);
                                updatePaymentHistoryPage(newPage);
                              }}
                              disabled={paymentHistoryPage === paymentHistoryTotalPages}
                              className={`px-3 py-1 text-sm rounded ${
                                paymentHistoryPage === paymentHistoryTotalPages
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : isDark
                                  ? "bg-gray-700 text-white hover:bg-gray-600"
                                  : "bg-white text-gray-700 hover:bg-gray-50"
                              } border ${isDark ? "border-gray-600" : "border-gray-300"}`}
                            >
                              Next
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => setIsHistoryOpen((prev) => !prev)}
                          className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                        >
                          {isHistoryOpen ? (<><FaChevronDown /> Hide</>) : (<><FaChevronUp /> Show</>)}
                        </button>
                      </div>
                    </div>
                    {isHistoryOpen && (
                      <div>
                        <table className="w-full text-sm table-fixed">
                          <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <tr>
                              <th className={`w-1/6 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>User</th>
                              <th className={`w-1/6 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Plan</th>
                              <th className={`w-1/12 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Amount</th>
                              <th className={`w-1/12 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                              <th className={`w-1/6 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Submitted</th>
                              <th className={`w-1/6 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Proof</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {paymentHistory.map(payment => (
                              <tr key={payment._id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                <td className="px-2 py-3">
                                  <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`} title={payment.user?.username || payment.user?.name || 'Unknown'}>{payment.user?.username || payment.user?.name || 'Unknown'}</div>
                                  <div className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-500'}`} title={payment.user?.email || ''}>{payment.user?.email || ''}</div>
                                </td>
                                <td className="px-2 py-3"><div className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`} title={payment.plan}>{payment.plan}</div></td>
                                <td className="px-2 py-3"><div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{payment.amount} ETB</div></td>
                                <td className="px-2 py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    payment.status === 'approved'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="px-2 py-3">
                                  <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{new Date(payment.submittedAt).toLocaleDateString()}</div>
                                  <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{new Date(payment.submittedAt).toLocaleTimeString()}</div>
                                </td>
                                <td className="px-2 py-3">
                                  {payment?.proof?.url ? (
                                    <a href={payment.proof.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                                      <img src={payment.proof.thumbnailUrl || payment.proof.url} alt="Proof" className="w-8 h-8 object-cover rounded border" />
                                      <span className="text-blue-600 hover:text-blue-800 text-xs font-medium"><FaEye className="inline mr-1" />View</span>
                                    </a>
                                  ) : (
                                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No proof</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {paymentHistory.length === 0 && (
                              <tr>
                                <td colSpan={6} className={`px-4 py-6 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No history yet</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                        {/* Pagination Info */}
                        {paymentHistory.length > 0 && (
                          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                            <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                              Showing {paymentHistory.length > 0 ? ((paymentHistoryPage - 1) * 5) + 1 : 0} to {Math.min(paymentHistoryPage * 5, allPaymentHistory.length)} of {allPaymentHistory.length} results
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaCreditCard className={`text-4xl mx-auto mb-4 ${isDark ? "text-gray-400" : "text-gray-300"}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    No pending payments
                  </h3>
                  <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                    All membership payments have been processed.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Orders;