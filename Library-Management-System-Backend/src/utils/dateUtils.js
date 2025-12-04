function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Update overdue books status
const updateOverdueBooks = async (Borrow) => {
  try {
    const result = await Borrow.updateMany(
      {
        status: "borrowed",
        dueDate: { $lt: new Date() }
      },
      {
        $set: { status: "overdue" }
      }
    );
    return result.modifiedCount;
  } catch (error) {
    console.error("Error updating overdue books:", error);
    return 0;
  }
};

// Cancel expired reservations and restore available copies
const cancelExpiredReservations = async (Borrow, Book) => {
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
      
      cancelledCount++;
    }

    // Delete all expired reservations completely
    const deleteResult = await Borrow.deleteMany({
      status: "reserved",
      reservationExpiry: { $lt: now }
    });

    console.log(`Cancelled and removed ${deleteResult.deletedCount} expired reservations`);
    return deleteResult.deletedCount;
  } catch (error) {
    console.error("Error cancelling expired reservations:", error);
    return 0;
  }
};

// Calculate and create fines for overdue books
const calculateAndCreateFines = async (Borrow, Fine, User, CONSTANTS) => {
  try {
    const now = new Date();
    
    // Find all overdue borrows that don't have fines yet
    const overdueBorrows = await Borrow.find({
      status: "overdue",
      dueDate: { $lt: now }
    }).populate("book").populate("user");
    
    let finesCreated = 0;
    const usersToUpdate = new Set();
    
    for (const borrow of overdueBorrows) {
      // Check if fine already exists for this borrow
      const existingFine = await Fine.findOne({ borrow: borrow._id, isPaid: false });
      
      if (existingFine) {
        continue; // Fine already exists
      }
      
      // Ensure related refs exist (user/book may be missing if deleted)
      if (!borrow.user || !borrow.user._id || !borrow.book || !borrow.book._id) {
        console.warn("Skipping fine creation due to missing user/book on borrow", {
          borrowId: borrow && borrow._id ? borrow._id.toString() : null,
          hasUser: !!borrow.user,
          hasBook: !!borrow.book
        });
        continue;
      }

      // Calculate fine
      const fineData = calculateFine(borrow.dueDate, CONSTANTS.FINE.DAILY_RATE);
      
      if (fineData.amount > 0) {
        // Create fine
        const fine = new Fine({
          borrow: borrow._id,
          user: borrow.user._id,
          book: borrow.book._id,
          amount: fineData.amount,
          daysOverdue: fineData.daysOverdue,
          dueDate: borrow.dueDate,
          calculatedAt: now,
          isPaid: false
        });
        
        await fine.save();
        finesCreated++;
        if (borrow.user && borrow.user._id) {
          usersToUpdate.add(borrow.user._id.toString());
        }
      }
    }
    
    // Update hasOutstandingFine flag for affected users
    for (const userId of usersToUpdate) {
      await User.findByIdAndUpdate(userId, { hasOutstandingFine: true });
    }
    
    console.log(`Created ${finesCreated} fines for overdue books`);
    return finesCreated;
  } catch (error) {
    console.error("Error creating fines:", error);
    return 0;
  }
};

// Run maintenance tasks (overdue books + expired reservations + fines)
const runMaintenanceTasks = async (Borrow, Book, Fine, User, CONSTANTS) => {
  try {
    const overdueCount = await updateOverdueBooks(Borrow);
    const expiredCount = await cancelExpiredReservations(Borrow, Book);
    const finesCreated = await calculateAndCreateFines(Borrow, Fine, User, CONSTANTS);
    
    console.log(`Maintenance completed: ${overdueCount} overdue books updated, ${expiredCount} expired reservations cancelled, ${finesCreated} fines created`);
    return { overdueCount, expiredCount, finesCreated };
  } catch (error) {
    console.error("Error running maintenance tasks:", error);
    return { overdueCount: 0, expiredCount: 0, finesCreated: 0 };
  }
};

// Calculate fine for overdue book
const calculateFine = (dueDate, dailyRate) => {
  const now = new Date();
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
  
  if (daysOverdue <= 0) {
    return { amount: 0, daysOverdue: 0 };
  }
  
  return {
    amount: daysOverdue * dailyRate,
    daysOverdue
  };
};

module.exports = { 
  addDays, 
  updateOverdueBooks, 
  cancelExpiredReservations,
  runMaintenanceTasks,
  calculateFine,
  calculateAndCreateFines
};
