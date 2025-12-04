const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const User = require("../models/User");
const Fine = require("../models/Fine");
const { addDays, updateOverdueBooks } = require("../utils/dateUtils");
const emailService = require("../services/emailService");
const CONSTANTS = require("../constants");

// Check if user has overdue books
const hasOverdueBooks = async (userId) => {
  const overdueBooks = await Borrow.find({
    user: userId,
    status: { $in: ["borrowed", "overdue"] },
    dueDate: { $lt: new Date() }
  });
  return overdueBooks.length > 0;
};

// Check if user has reached the maximum borrowing limit (including reservations)
const hasReachedBorrowingLimit = async (userId) => {
  const activeBorrows = await Borrow.find({
    user: userId,
    status: { $in: ["borrowed", "overdue"] }
  });
  
  const activeReservations = await Borrow.find({
    user: userId,
    status: "reserved",
    reservationExpiry: { $gt: new Date() }
  });
  
  return (activeBorrows.length + activeReservations.length) >= 3;
};

// Check if user has active reservations
const hasActiveReservations = async (userId) => {
  const activeReservations = await Borrow.find({
    user: userId,
    status: "reserved",
    reservationExpiry: { $gt: new Date() }
  });
  return activeReservations.length;
};

// Check if user's membership is approved
const isMembershipApproved = async (userId) => {
  const user = await User.findById(userId);
  return user && user.membershipStatus === "approved";
};

// Check if user has outstanding fines
const hasOutstandingFines = async (userId) => {
  const user = await User.findById(userId);
  return user && user.hasOutstandingFine;
};

// Student requests to borrow a book (creates reservation)
const requestBorrow = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "bookId is required" });
    }

    // Update overdue books status first
    await updateOverdueBooks(Borrow);

    // Check membership status
    const membershipApproved = await isMembershipApproved(req.user._id);
    if (!membershipApproved) {
      return res.status(400).json({ 
        message: "Your membership is pending approval. Please complete your subscription payment to activate your library membership and start borrowing books." 
      });
    }

    // Check for outstanding fines
    const hasOutstanding = await hasOutstandingFines(req.user._id);
    if (hasOutstanding) {
      return res.status(400).json({ 
        message: CONSTANTS.MESSAGES.FINE.HAS_OUTSTANDING
      });
    }

    // Check borrowing rules
    const hasOverdue = await hasOverdueBooks(req.user._id);
    if (hasOverdue) {
      return res.status(400).json({ 
        message: "Cannot borrow books. You have overdue books that need to be returned first." 
      });
    }

    const hasReachedLimit = await hasReachedBorrowingLimit(req.user._id);
    if (hasReachedLimit) {
      return res.status(400).json({ 
        message: "Cannot reserve more books. You have reached the maximum limit of 3 books (including borrowed and reserved books)." 
      });
    }

    // Check if user already has an active reservation or queue entry for this book
    const existingReservation = await Borrow.findOne({
      user: req.user._id,
      book: bookId,
      $or: [
        { status: "reserved", reservationExpiry: { $gt: new Date() } },
        { status: "queued" }
      ]
    });

    if (existingReservation) {
      return res.status(400).json({ 
        message: "You already have an active reservation or queue entry for this book." 
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const now = new Date();

    // If book is available, create immediate reservation
    if (book.availableCopies > 0) {
      // Create reservation (temporarily reduce available copies)
      book.availableCopies -= 1;
      await book.save();

      const reservationExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      const borrow = new Borrow({
        user: req.user._id,
        book: book._id,
        status: "reserved",
        reservationExpiry,
      });

      await borrow.save();

      return res.status(201).json({
        message: "Book reserved successfully. Please collect within 24 hours.",
        borrow,
        book: { id: book._id, availableCopies: book.availableCopies },
        reservationExpiry
      });
    }

    // If book is not available, add to queue
    // Count existing queue entries for this book
    const queueCount = await Borrow.countDocuments({
      book: bookId,
      status: "queued"
    });

    const queuePosition = queueCount + 1;

    const borrow = new Borrow({
      user: req.user._id,
      book: book._id,
      status: "queued",
      queuePosition,
    });

    await borrow.save();

    res.status(201).json({
      message: `Book is currently unavailable. You have been added to the queue at position ${queuePosition}. You will be notified when the book becomes available.`,
      borrow,
      queuePosition,
      book: { id: book._id, availableCopies: book.availableCopies }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin confirms book collection and converts reservation to borrow
const confirmCollection = async (req, res) => {
  try {
    const { borrowId, days = 14 } = req.body;

    if (!borrowId) {
      return res.status(400).json({ message: "borrowId is required" });
    }

    // Only admins can confirm collection
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Only administrators can confirm book collection" });
    }

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    if (borrow.status !== "reserved") {
      return res.status(400).json({ message: "This record is not in reserved status" });
    }

    if (borrow.reservationExpiry < new Date()) {
      return res.status(400).json({ message: "This reservation has expired" });
    }

    // Convert reservation to borrow
    const now = new Date();
    const dueDate = addDays(now, Number(days));

    borrow.status = "borrowed";
    borrow.borrowDate = now;
    borrow.dueDate = dueDate;
    borrow.collectedByAdmin = true;
    borrow.collectedAt = now;
    await borrow.save();

    // Send borrow confirmation email
    try {
      const borrowWithDetails = await Borrow.findById(borrow._id)
        .populate('user', 'username email')
        .populate('book', 'title');
      
      if (borrowWithDetails.user && borrowWithDetails.user.email) {
        await emailService.sendBorrowConfirmation(
          borrowWithDetails.user.email,
          borrowWithDetails.user.username,
          borrowWithDetails.book.title,
          dueDate
        );
        // Realtime notification
        emitToUser(borrowWithDetails.user._id, 'notification', {
          type: 'borrow_confirmed',
          title: 'Borrow Confirmed',
          message: `You borrowed "${borrowWithDetails.book.title}". Due ${new Date(dueDate).toLocaleDateString()}.`,
          data: { borrowId: borrow._id, dueDate }
        });
      }
    } catch (emailError) {
      console.error('Failed to send borrow confirmation email:', emailError);
      // Continue execution even if email fails
    }

    res.json({
      message: "Book collection confirmed successfully",
      borrow,
      dueDate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel expired reservations and restore available copies
const cancelExpiredReservations = async (req, res) => {
  try {
    const now = new Date();
    
    // Find expired reservations
    const expiredReservations = await Borrow.find({
      status: "reserved",
      reservationExpiry: { $lt: now }
    });

    let cancelledCount = 0;
    
    for (const reservation of expiredReservations) {
      // Restore available copies first
      const book = await Book.findById(reservation.book);
      if (book) {
        book.availableCopies += 1;
        await book.save();
      }
      
      // Send reservation cancelled email
      try {
        const user = await User.findById(reservation.user);
        if (user && user.email && book) {
          await emailService.sendReservationCancellation(
            user.email,
            user.username,
            book.title,
            'Reservation expired'
          );
        }
      } catch (emailError) {
        console.error('Failed to send reservation cancellation email:', emailError);
        // Continue execution even if email fails
      }
      
      cancelledCount++;
    }

    // Delete all expired reservations completely
    const deleteResult = await Borrow.deleteMany({
      status: "reserved",
      reservationExpiry: { $lt: now }
    });

    res.json({
      message: `Cancelled and removed ${cancelledCount} expired reservations`,
      cancelledCount: deleteResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Students can request to return a borrowed book
// - Changes status to "return_requested" 
// - Admin must confirm the return
const returnBook = async (req, res) => {
  try {
    const { borrowId } = req.body;

    if (!borrowId) {
      return res.status(400).json({ message: "borrowId is required" });
    }

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    // Check if the user owns this borrow record (unless admin/super_admin)
    if (req.user.role === "user" && borrow.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only request to return your own borrowed books" });
    }

    // Check if the book is already returned or return requested
    if (borrow.status === "returned") {
      return res.status(400).json({ message: "This book has already been returned" });
    }

    if (borrow.status === "return_requested") {
      return res.status(400).json({ message: "Return has already been requested for this book" });
    }

    // Only allow requesting return for borrowed or overdue books
    if (borrow.status !== "borrowed" && borrow.status !== "overdue") {
      return res.status(400).json({ message: "This book cannot be returned in its current status" });
    }

    // Update borrow record to return requested
    borrow.status = "return_requested";
    await borrow.save();

    // Send return request notification email to admin
    try {
      const user = await User.findById(borrow.user);
      const book = await Book.findById(borrow.book);
      if (user && user.email && book) {
        await emailService.sendReturnRequestNotification(
          user.email,
          user.username,
          book.title,
          new Date()
        );
        // Realtime notification to user
        emitToUser(user._id, 'notification', {
          type: 'return_requested',
          title: 'Return Requested',
          message: `Return requested for "${book.title}". Awaiting admin confirmation.`,
          data: { borrowId: borrow._id }
        });
      }
    } catch (emailError) {
      console.error('Failed to send return request notification email:', emailError);
      // Continue execution even if email fails
    }

    res.json({
      message: "Return request submitted successfully. Please wait for admin confirmation.",
      borrow
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin confirms book return
// - Changes status to "returned"
// - Increases availableCopies
// - Sets returnDate
const confirmReturn = async (req, res) => {
  try {
    const { borrowId } = req.body;

    if (!borrowId) {
      return res.status(400).json({ message: "borrowId is required" });
    }

    // Only admins can confirm returns
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Only administrators can confirm book returns" });
    }

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    if (borrow.status !== "return_requested") {
      return res.status(400).json({ message: "This record is not in return_requested status" });
    }

    // Update borrow record to returned
    borrow.status = "returned";
    borrow.returnDate = new Date();
    await borrow.save();

    const book = await Book.findById(borrow.book);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if there's someone in the queue for this book
    const firstInQueue = await Borrow.findOne({
      book: borrow.book,
      status: "queued"
    }).sort({ queuePosition: 1 }).populate("user", "username email");

    if (firstInQueue) {
      // Book is being held for the first person in queue
      // Convert queue entry to reserved with 48-hour hold
      const now = new Date();
      const holdUntil = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
      const reservationExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from reservation start

      const oldQueuePosition = firstInQueue.queuePosition;

      firstInQueue.status = "reserved";
      firstInQueue.holdUntil = holdUntil;
      firstInQueue.reservationExpiry = reservationExpiry;
      firstInQueue.queuePosition = null; // Clear queue position
      await firstInQueue.save();

      // Update queue positions for remaining queue entries
      await Borrow.updateMany(
        {
          book: borrow.book,
          status: "queued",
          queuePosition: { $gt: oldQueuePosition }
        },
        { $inc: { queuePosition: -1 } }
      );

      // Send email notification to the first person in queue
      try {
        if (firstInQueue.user && firstInQueue.user.email) {
          await emailService.sendBookAvailableNotification(
            firstInQueue.user.email,
            firstInQueue.user.username,
            book.title,
            holdUntil
          );
        }
      } catch (emailError) {
        console.error('Failed to send book available notification email:', emailError);
        // Continue execution even if email fails
      }

      res.json({
        message: "Book return confirmed. First person in queue has been notified and has 48 hours to collect.",
        borrow,
        queueNotified: true
      });
    } else {
      // No one in queue, increase available copies
      book.availableCopies += 1;
      await book.save();

      res.json({
        message: "Book return confirmed.",
        borrow,
        queueNotified: false
      });
    }

    // Send return confirmation email to user
    try {
      const user = await User.findById(borrow.user);
      if (user && user.email && book) {
        await emailService.sendReturnConfirmation(
          user.email,
          user.username,
          book.title,
          borrow.returnDate
        );
        // Realtime notification
        emitToUser(user._id, 'notification', {
          type: 'return_confirmed',
          title: 'Return Confirmed',
          message: `Return confirmed for "${book.title}". Thank you!`,
          data: { borrowId: borrow._id, returnDate: borrow.returnDate }
        });
      }
    } catch (emailError) {
      console.error('Failed to send return confirmation email:', emailError);
      // Continue execution even if email fails
    }

    res.json({
      message: "Book return confirmed successfully",
      borrow,
      book: book ? { id: book._id, availableCopies: book.availableCopies } : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List borrows; users see their own, admins see all
const listBorrows = async (req, res) => {
  try {
    // Update overdue books status first
    await updateOverdueBooks(Borrow);
    
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
    const filter = isAdmin ? {} : { user: req.user._id };
    const borrows = await Borrow.find(filter)
      .populate({ path: "book", select: "title author isbn coverImage legacyCoverImage" })
      .populate({ path: "user", select: "username email role name" })
      .sort({ createdAt: -1 });
    res.json(borrows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's borrowing status
const getUserBorrowingStatus = async (req, res) => {
  try {
    // Update overdue books status first
    await updateOverdueBooks(Borrow);
    
    const userId = req.user._id;
    
    // Get all active borrows (borrowed or overdue)
    const activeBorrows = (await Borrow.find({
      user: userId,
      status: { $in: ["borrowed", "overdue"] }
    }).populate({ path: "book", select: "title author isbn coverImage legacyCoverImage" }))
      .filter(borrow => borrow.book !== null && borrow.book !== undefined); // Filter out deleted books
    
    // Get active reservations
    const activeReservations = (await Borrow.find({
      user: userId,
      status: "reserved",
      reservationExpiry: { $gt: new Date() }
    }).populate({ path: "book", select: "title author isbn coverImage legacyCoverImage" }))
      .filter(borrow => borrow.book !== null && borrow.book !== undefined); // Filter out deleted books

    // Get return requested books
    const returnRequestedBooks = (await Borrow.find({
      user: userId,
      status: "return_requested"
    }).populate({ path: "book", select: "title author isbn coverImage legacyCoverImage" }))
      .filter(borrow => borrow.book !== null && borrow.book !== undefined); // Filter out deleted books

    // Get queued books
    const queuedBooks = (await Borrow.find({
      user: userId,
      status: "queued"
    }).populate({ path: "book", select: "title author isbn coverImage legacyCoverImage" }))
      .filter(borrow => borrow.book !== null && borrow.book !== undefined); // Filter out deleted books
    
    // Get overdue books
    const overdueBooks = activeBorrows.filter(borrow => 
      borrow.dueDate && borrow.dueDate < new Date()
    );
    
    // Get borrowed books (not overdue)
    const borrowedBooks = activeBorrows.filter(borrow => 
      borrow.dueDate && borrow.dueDate >= new Date()
    );
    
    const activeCount = activeBorrows.length + activeReservations.length;
    
    const status = {
      totalBorrowed: activeBorrows.length,
      totalReserved: activeReservations.length,
      totalReturnRequested: returnRequestedBooks.length,
      totalQueued: queuedBooks.length,
      borrowedBooksCount: borrowedBooks.length,
      overdueBooksCount: overdueBooks.length,
      canBorrowMore: activeCount < 3,
      hasOverdueBooks: overdueBooks.length > 0,
      maxBooksAllowed: 3,
      booksRemaining: Math.max(0, 3 - activeCount),
      activeBorrows,
      activeReservations,
      returnRequestedBooks,
      queuedBooks,
      overdueBookEntries: overdueBooks,
      borrowedBookEntries: borrowedBooks
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending reservations (for admin view)
const getPendingReservations = async (req, res) => {
  try {
    // Only admins can view pending reservations
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Only administrators can view pending reservations" });
    }

    const pendingReservations = await Borrow.find({
      status: "reserved",
      reservationExpiry: { $gt: new Date() }
    })
      .populate({ path: "book", select: "title author isbn" })
      .populate({ path: "user", select: "username email role" })
      .sort({ createdAt: -1 });

    res.json(pendingReservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get borrowing history for a specific book (for admin view)
const getBookBorrowingHistory = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 5 } = req.query;
    
    // Only admins can view book borrowing history
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Only administrators can view book borrowing history" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const totalCount = await Borrow.countDocuments({ book: bookId });
    
    // Get borrowing history with pagination
    const borrowHistory = await Borrow.find({ book: bookId })
      .populate({ path: "book", select: "title author isbn coverImage legacyCoverImage" })
      .populate({ path: "user", select: "username email role" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      borrowHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's borrowing history with pagination
const getUserBorrowingHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const totalCount = await Borrow.countDocuments({ user: userId });
    
    // Get borrowing history with pagination
    const borrowHistory = await Borrow.find({ user: userId })
      .populate({ path: "book", select: "title author isbn coverImage legacyCoverImage" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      borrowHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel a reservation (user can cancel their own reservations)
const cancelReservation = async (req, res) => {
  try {
    const { borrowId } = req.body;

    if (!borrowId) {
      return res.status(400).json({ message: "borrowId is required" });
    }

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Check if the user owns this reservation
    if (borrow.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only cancel your own reservations" });
    }

    // Check if it's actually a reservation
    if (borrow.status !== "reserved") {
      return res.status(400).json({ message: "This is not an active reservation" });
    }

    // Check if reservation has expired
    if (borrow.reservationExpiry < new Date()) {
      return res.status(400).json({ message: "This reservation has already expired" });
    }

    // Restore available copies
    const book = await Book.findById(borrow.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    // Delete the reservation
    await Borrow.findByIdAndDelete(borrowId);

    res.json({
      message: "Reservation cancelled successfully",
      book: book ? { id: book._id, availableCopies: book.availableCopies } : null
    });

    // Notify the user
    try {
      emitToUser(req.user._id, 'notification', {
        type: 'reservation_cancelled',
        title: 'Reservation Cancelled',
        message: `Your reservation was cancelled${book ? ` for "${book.title}"` : ''}.`,
        data: { borrowId }
      });
    } catch (_) {}
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  requestBorrow, 
  confirmCollection, 
  cancelExpiredReservations,
  returnBook, 
  confirmReturn,
  listBorrows, 
  getUserBorrowingStatus,
  getUserBorrowingHistory,
  getPendingReservations,
  getBookBorrowingHistory,
  cancelReservation
};


