import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { booksAPI, borrowAPI, utils } from "@/services/api";
import AdminSidebar from "@/components/AdminSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";



const Bookdetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [book, setBook] = useState(null);

  // Editable fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [totalCopies, setTotalCopies] = useState(0);
  const [availableCopies, setAvailableCopies] = useState(0);
  const [isbn, setIsbn] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [coverImage, setCoverImage] = useState(null);

  // Borrowing history state
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [borrowHistoryLoading, setBorrowHistoryLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 5
  });

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const res = await booksAPI.getBookById(id);
        const data = res.data;
        setBook(data);
        setTitle(data.title || "");
        setAuthor(data.author || "");
        setDescription(data.description || "");
        setTotalCopies(Number(data.totalCopies) || 0);
        setAvailableCopies(Number(data.availableCopies) || 0);
        setIsbn(data.isbn || "");
        setYear(data.publicationYear || "");
        setGenre(data.category || "");
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Book not found");
      } finally {
        setLoading(false);
      }
    };
    loadBook();
  }, [id]);

  // Load borrowing history
  const loadBorrowHistory = React.useCallback(
    async (page = 1, limit = 5) => {
      try {
        setBorrowHistoryLoading(true);
        const response = await borrowAPI.getBookBorrowingHistory(id, page, limit);
        setBorrowHistory(response.data.borrowHistory);
        setPagination(response.data.pagination);
      } catch (err) {
        console.error("Failed to load borrowing history:", err);
        setBorrowHistory([]);
      } finally {
        setBorrowHistoryLoading(false);
      }
    },
    [id]
  );

  // Load borrowing history when component mounts
  useEffect(() => {
    if (id) {
      loadBorrowHistory(1, 5);
    }
  }, [id, loadBorrowHistory]);

  // Handle page change
  const handlePageChange = (newPage) => {
    loadBorrowHistory(newPage, pagination.limit);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newLimit) => {
    loadBorrowHistory(1, newLimit);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!book) return <div className="p-6">Book not found.</div>;

  const handleDelete = async () => {
    try {
      await booksAPI.deleteBook(id);
      toast.success("Book deleted!");
      navigate("/admin/books");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete book");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await booksAPI.updateBook(id, {
        title,
        author,
        description,
        isbn,
        publicationYear: year,
        category: genre,
        totalCopies,
        availableCopies,
        coverImage,
      });
      toast.success("Book updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update book");
    }
  };

  return (
    <div
      className={`flex flex-row min-h-screen ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <AdminSidebar />
      <main className="flex-1 px-6 py-3">
        <Navbar />

        <div className="max-w-6xl mx-auto">
          <h1
            className={`text-3xl font-bold mb-6 pt-6 ${
              isDark ? "text-white" : "text-blue-600"
            }`}
          >
            Book Details
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Book Image Section */}
            <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={isDark ? "text-white" : ""}>
                  Book Cover
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <img
                  src={utils.getBookCoverUrl(book)}
                  alt={title}
                  className="w-full max-w-md h-80 object-contain rounded-lg shadow-xl mb-4 transform hover:scale-105 transition-transform duration-300"
                />
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  } text-center`}
                >
                  Book ID: {book._id}
                </div>
              </CardContent>
            </Card>

            {/* Book Information Form */}
            <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader>
                <CardTitle className={isDark ? "text-white" : ""}>
                  Book Information
                </CardTitle>
                <CardDescription className={isDark ? "text-gray-400" : ""}>
                  Edit the book details below
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="title"
                        className={isDark ? "text-white" : ""}
                      >
                        Title *
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Book title"
                        className={
                          isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                        }
                        required
                      />
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="author"
                        className={isDark ? "text-white" : ""}
                      >
                        Author *
                      </Label>
                      <Input
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Author name"
                        className={
                          isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                        }
                        required
                      />
                    </div>

                    {/* ISBN */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="isbn"
                        className={isDark ? "text-white" : ""}
                      >
                        ISBN
                      </Label>
                      <Input
                        id="isbn"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder="ISBN number"
                        className={
                          isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                        }
                      />
                    </div>

                    {/* Published Year */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="year"
                        className={isDark ? "text-white" : ""}
                      >
                        Published Year
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="2023"
                        min="1000"
                        max="2030"
                        className={
                          isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                        }
                      />
                    </div>

                    {/* Genre */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="genre"
                        className={isDark ? "极text-white" : ""}
                      >
                        Genre
                      </Label>
                      <Input
                        id="genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        placeholder="Fiction, Science, etc."
                        className={
                          isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                        }
                      />
                    </div>

                    {/* Total Copies */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="totalCopies"
                        className={isDark ? "text-white" : ""}
                      >
                        Total Copies *
                      </Label>
                      <Input
                        id="totalCopies"
                        type="number"
                        min="0"
                        value={totalCopies}
                        onChange={(e) => setTotalCopies(Number(e.target.value))}
                        placeholder="Total copies"
                        className={
                          isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                        }
                        required
                      />
                    </div>

                    {/* Available Copies */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="availableCopies"
                        className={isDark ? "text-white" : ""}
                      >
                        Available Copies
                      </Label>
                      <Input
                        id="availableCopies"
                        type="number"
                        min="0"
                        value={availableCopies}
                        onChange={(e) => setAvailableCopies(Number(e.target.value))}
                        placeholder="Available copies"
                        className={
                          isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="coverImage"
                      className={isDark ? "text-white" : ""}
                    >
                      Cover Image
                    </Label>
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (file) {
                          setCoverImage(file);
                        }
                      }}
                      className={
                        isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                      }
                    />
                    {coverImage && (
                      <div className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        Selected: {coverImage.name}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className={isDark ? "text-white" : ""}
                    >
                      Description *
                    </Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Book description"
                      rows="4"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "border-gray-300"
                      }`}
                      required
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Update Book
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      Delete Book
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Borrow History Section */}
          <Card
            className={`mt-8 ${isDark ? "bg-gray-800 border-gray-700" : ""}`}
          >
            <CardHeader>
              <CardTitle className={isDark ? "text-white" : ""}>
                Recent Borrowing Activity for This Book
              </CardTitle>
              <CardDescription className={isDark ? "text-gray-400" : ""}>
                Track all borrowing and return activities
              </CardDescription>
            </CardHeader>

            <CardContent>
              {borrowHistoryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Loading borrowing history...
                  </p>
                </div>
              ) : (
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

                  {borrowHistory.length === 0 && (
                    <div
                      className={`text-center py-8 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      No borrowing history available for this book
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {pagination.totalCount > 0 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className={`flex items-center space-x-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        <span>Rows per page:</span>
                        <select
                          value={pagination.limit}
                          onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value))}
                          className={`px-2 py-1 border rounded ${
                            isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                          }`}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                        </select>
                      </div>

                      <div className={`flex items-center space-x-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        <span>
                          {((pagination.currentPage - 1) * pagination.limit) + 1}–
                          {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount}
                        </span>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                            className={isDark ? "border-gray-600 text-gray-300" : ""}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                            className={isDark ? "border-gray-600 text-gray-300" : ""}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Bookdetail;
