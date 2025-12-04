import AdminSidebar from "@/components/AdminSidebar";
import { useTheme } from "@/contexts/ThemeContext";
import React, { useState, useEffect } from "react";
import BookCard from "@/components/BookCard";
import { booksAPI } from "@/services/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ManageBook = () => {
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await booksAPI.getAllBooks();
        setBooks(response.data || []);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  // Filter books by title or author (case-insensitive)
  const filteredBooks = books ? books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className={`flex flex-row min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
      <AdminSidebar />
      <main className="flex-1 px-6 py-3">
        <Navbar />
        <h1
          className={`text-3xl font-bold ${
            isDark ? "text-white" : "text-blue-600"
          } mb-8 pt-6 md:pt-8`}
        >
          Manage Books
        </h1>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`border ${
              isDark
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-blue-300"
            } rounded-md px-4 py-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => <BookCard key={book._id} book={book} />)
          ) : (
            <div
              className={`col-span-full text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No books found.
            </div>
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default ManageBook;
