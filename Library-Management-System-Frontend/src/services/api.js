import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'https://library-management-system-backend-wi5k.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  deleteProfile: () => api.delete('/users/profile'),
};

// Books API
export const booksAPI = {
  // Get all books
  getAllBooks: () => api.get('/books'),
  
  // Get book by ID
  getBookById: (id) => api.get(`/books/${id}`),
  
  // Add new book (Admin only)
  addBook: (bookData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(bookData).forEach(key => {
      if (key !== 'coverImage' && bookData[key] !== null && bookData[key] !== undefined) {
        formData.append(key, bookData[key]);
      }
    });
    
    // Add image if provided
    if (bookData.coverImage) {
      formData.append('coverImage', bookData.coverImage);
    }
    
    return api.post('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update book (Admin only)
  updateBook: (id, bookData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(bookData).forEach(key => {
      if (key !== 'coverImage' && bookData[key] !== null && bookData[key] !== undefined) {
        formData.append(key, bookData[key]);
      }
    });
    
    // Add image if provided
    if (bookData.coverImage) {
      formData.append('coverImage', bookData.coverImage);
    }
    
    return api.put(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete book (Admin only)
  deleteBook: (id) => api.delete(`/books/${id}`),
};

// Borrow API
export const borrowAPI = {
  // Request to borrow a book (creates reservation)
  requestBorrow: (bookId) => api.post('/borrow/request', { bookId }),
  
  // Request to return a book (changes status to return_requested)
  returnBook: (borrowId) => api.post('/borrow/return', { borrowId }),
  
  // Admin confirms book return (changes status to returned)
  confirmReturn: (borrowId) => api.post('/borrow/confirm-return', { borrowId }),
  
  // Get user's borrowing status
  getUserBorrowingStatus: () => api.get('/borrow/status'),
  
  // Get all borrows (Admin only)
  getAllBorrows: () => api.get('/borrow'),
  
  // Get pending reservations (Admin only)
  getPendingReservations: () => api.get('/borrow/pending-reservations'),
  
  // Get borrowing history for a specific book (Admin only)
  getBookBorrowingHistory: (bookId, page = 1, limit = 5) => 
    api.get(`/borrow/book/${bookId}/history?page=${page}&limit=${limit}`),
  
  // Confirm book collection (Admin only)
  confirmCollection: (borrowId, days = 14) => 
    api.post('/borrow/confirm-collection', { borrowId, days }),
  
  // Cancel expired reservations (Admin only)
  cancelExpiredReservations: () => api.post('/borrow/cancel-expired'),
  
  // Cancel a reservation (User only)
  cancelReservation: (borrowId) => api.post('/borrow/cancel-reservation', { borrowId }),
  
  // Get user's borrowing history with pagination
  getUserBorrowingHistory: (page = 1, limit = 10) => 
    api.get(`/borrow/user-history?page=${page}&limit=${limit}`),
};

// Users API (Admin only)
export const usersAPI = {
  // Super admin endpoints
  getAllUsersSuperAdmin: () => api.get('/users/all'),
  createAdmin: (userData) => api.post('/users/admin', userData),
  promoteToAdmin: (userId) => api.put(`/users/promote/${userId}`),
  demoteAdmin: (userId) => api.put(`/users/demote/${userId}`),
  deleteAnyUser: (userId) => api.delete(`/users/${userId}`),
  
  // Admin endpoints
  getAllUsersAdminView: () => api.get('/users/users'),
  deleteRegularUser: (userId) => api.delete(`/users/user/${userId}`),
  updateMembershipStatus: (userId, membershipStatus) => 
    api.put(`/users/membership/${userId}`, { membershipStatus }),
};

// Payment API
export const paymentAPI = {
  // Get user's payment history
  getPaymentHistory: (page = 1, limit = 5) => 
    api.get(`/payments/history?page=${page}&limit=${limit}`),
  
  // Submit payment proof
  submitPaymentProof: (paymentData) =>
    api.post('/payments/submit', paymentData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  // Get all payments (Admin only)
  getAllPayments: (page = 1, limit = 10) => 
    api.get(`/payments?page=${page}&limit=${limit}`),
  
  // Approve payment (Admin only)
  approvePayment: (paymentId) => api.post(`/payments/${paymentId}/approve`),
  
  // Reject payment (Admin only)
  rejectPayment: (paymentId, reason) => api.post(`/payments/${paymentId}/reject`, { reason }),
};

// Events API
export const eventsAPI = {
  list: () => api.get('/events'),
  create: (eventData) => {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (key !== 'image' && value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    if (eventData.image) {
      formData.append('image', eventData.image);
    }
    return api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, eventData) => {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (key !== 'image' && value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    if (eventData.image) {
      formData.append('image', eventData.image);
    }
    return api.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Reminder API (Admin only)
export const reminderAPI = {
  getStatus: () => api.get('/reminders/status'),
  triggerDueDateReminders: () => api.post('/reminders/trigger/due-date'),
  triggerOverdueNotifications: () => api.post('/reminders/trigger/overdue'),
  triggerExpiredReservationCleanup: () => api.post('/reminders/trigger/cleanup'),
  startScheduler: () => api.post('/reminders/start'),
  stopScheduler: () => api.post('/reminders/stop'),
};

// Notification API
export const notificationAPI = {
  // Get user's notifications
  getMyNotifications: (page = 1, limit = 20, filter = "all") =>
    api.get(`/notifications?page=${page}&limit=${limit}&filter=${filter}`),
  
  // Get unread count
  getUnreadCount: () => api.get('/notifications/unread-count'),
  
  // Mark notification as read
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  
  // Mark all as read
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  
  // Delete notification
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

// Utility functions
export const utils = {
  // Format date for display
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },
  
  // Format date and time for display
  formatDateTime: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
  
  // Get days remaining until due date
  getDaysRemaining: (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },
  
  // Check if book is overdue
  isOverdue: (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  },
  
  // Get book cover image URL
  getBookCoverUrl: (book) => {
    if (book.coverImage?.url) {
      return book.coverImage.url;
    } else if (book.coverImage?.responsiveUrls?.medium) {
      return book.coverImage.responsiveUrls.medium;
    } else if (book.legacyCoverImage) {
      return `${API_BASE_URL.replace('/api', '')}/uploads/${book.legacyCoverImage}`;
    }
    return '/src/assets/lib11.jpg'; // Default image
  },
  
  // Get responsive image URL
  getResponsiveImageUrl: (book, size = 'medium') => {
    if (book.coverImage?.responsiveUrls?.[size]) {
      return book.coverImage.responsiveUrls[size];
    } else if (book.coverImage?.url) {
      return book.coverImage.url;
    } else if (book.legacyCoverImage) {
      return `${API_BASE_URL.replace('/api', '')}/uploads/${book.legacyCoverImage}`;
    }
    return '/src/assets/lib11.jpg'; // Default image
  },
  
  // Get status text for borrow status
  getStatusText: (status) => {
    switch (status) {
      case "returned":
        return "Returned";
      case "borrowed":
        return "Borrowed";
      case "overdue":
        return "Overdue";
      case "reserved":
        return "Reserved";
      case "return_requested":
        return "Return Requested";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  },

  // Get status color for borrow status
  getStatusColor: (status) => {
    switch (status) {
      case "returned":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "borrowed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "reserved":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "return_requested":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "expired":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  },
};

export default api;
