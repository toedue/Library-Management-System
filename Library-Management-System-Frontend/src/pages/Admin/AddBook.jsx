import AdminSidebar from "@/components/AdminSidebar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
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
import { FaImage, FaTimes, FaUpload } from "react-icons/fa";
import { booksAPI } from "@/services/api";
import toast from "react-hot-toast";

const AddBook = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    isbn: "",
    publicationYear: "",
    totalCopies: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          coverImage: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          coverImage: "Image size must be less than 5MB",
        }));
        return;
      }

      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, coverImage: "" }));
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, coverImage: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.author.trim()) newErrors.author = "Author is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.isbn.trim()) newErrors.isbn = "ISBN is required";
    if (!formData.publicationYear)
      newErrors.publicationYear = "Publication year is required";
    if (!formData.totalCopies || formData.totalCopies < 1)
      newErrors.totalCopies = "Must have at least 1 copy";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const bookData = {
        ...formData,
        coverImage: coverImage,
        availableCopies: formData.totalCopies, // Initially all copies are available
      };

      await booksAPI.addBook(bookData);

      // Reset form on success
      setFormData({
        title: "",
        author: "",
        category: "",
        description: "",
        isbn: "",
        publicationYear: "",
        totalCopies: "",
      });
      setCoverImage(null);
      setImagePreview(null);

      toast.success("Book added successfully!");
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error(
        error.response?.data?.message || "Failed to add book. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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

        <div className="max-w-4xl mx-auto">
          <h1
            className={`text-3xl font-bold pt-8 mb-6 ${
              isDark ? "text-white" : "text-blue-600"
            }`}
          >
            Add New Book
          </h1>

          <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
            <CardHeader>
              <CardTitle className={isDark ? "text-white" : ""}>
                Book Information
              </CardTitle>
              <CardDescription className={isDark ? "text-gray-400" : ""}>
                Fill in the details to add a new book to the library
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter book title"
                      className={
                        isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                      }
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">{errors.title}</p>
                    )}
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
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="Enter author name"
                      className={
                        isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                      }
                    />
                    {errors.author && (
                      <p className="text-red-500 text-sm">{errors.author}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className={isDark ? "text-white" : ""}
                    >
                      Category *
                    </Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g., Fiction, Science, History"
                      className={
                        isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                      }
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm">{errors.category}</p>
                    )}
                  </div>

                  {/* ISBN */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="isbn"
                      className={isDark ? "text-white" : ""}
                    >
                      ISBN *
                    </Label>
                    <Input
                      id="isbn"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      placeholder="Enter ISBN number"
                      className={
                        isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                      }
                    />
                    {errors.isbn && (
                      <p className="text-red-500 text-sm">{errors.isbn}</p>
                    )}
                  </div>

                  {/* Publication Year */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="publicationYear"
                      className={isDark ? "text-white" : ""}
                    >
                      Publication Year *
                    </Label>
                    <Input
                      id="publicationYear"
                      name="publicationYear"
                      type="number"
                      value={formData.publicationYear}
                      onChange={handleInputChange}
                      placeholder="e.g., 2023"
                      min="1000"
                      max="2030"
                      className={
                        isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                      }
                    />
                    {errors.publicationYear && (
                      <p className="text-red-500 text-sm">
                        {errors.publicationYear}
                      </p>
                    )}
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
                      name="totalCopies"
                      type="number"
                      value={formData.totalCopies}
                      onChange={handleInputChange}
                      placeholder="Number of copies"
                      min="1"
                      className={
                        isDark ? "bg-gray-700 border-gray-600 text-white" : ""
                      }
                    />
                    {errors.totalCopies && (
                      <p className="text-red-500 text-sm">
                        {errors.totalCopies}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <Label className={isDark ? "text-white" : ""}>
                    Cover Image
                  </Label>

                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <FaImage className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        } mb-4`}
                      >
                        Upload a book cover image (JPG, PNG, GIF - Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="coverImage"
                      />
                      <label
                        htmlFor="coverImage"
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md cursor-pointer ${
                          isDark
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        <FaUpload className="mr-2" />
                        Choose Image
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Cover preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  {errors.coverImage && (
                    <p className="text-red-500 text-sm">{errors.coverImage}</p>
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
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter book description"
                    rows="4"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? "Adding Book..." : "Add Book"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        title: "",
                        author: "",
                        category: "",
                        description: "",
                        isbn: "",
                        publicationYear: "",
                        totalCopies: "",
                      });
                      setCoverImage(null);
                      setImagePreview(null);
                    }}
                    className={
                      isDark
                        ? "border-gray-600 text-white hover:bg-gray-700"
                        : ""
                    }
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default AddBook;
