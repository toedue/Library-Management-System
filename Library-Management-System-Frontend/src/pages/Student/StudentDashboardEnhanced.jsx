import React, { useState, useEffect } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import StudentNavbar from "@/components/StudentNavbar";
import Footer from "@/components/Footer";
import BookList from "./BookListEnhanced";
import MyBooks from "./MyBooksEnhanced";
import EventsCarousel from "@/components/EventsCarousel";
import { useTheme } from "@/contexts/ThemeContext";
import { FaBook, FaUser, FaClock, FaSearch } from "react-icons/fa";
import { borrowAPI, authAPI } from "@/services/api";

const StudentDashboardEnhanced = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("books");
  const [borrowingStatus, setBorrowingStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const data = localStorage.getItem("user");
  const [studentProfile, setStudentProfile] = useState(
    data ? JSON.parse(data) : {}
  );

  // Resolve membership end date: only use membershipExpiryDate
  const getMembershipEndDate = () => {
    if (studentProfile && studentProfile.membershipExpiryDate) {
      const d = new Date(studentProfile.membershipExpiryDate);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  const getMembershipTimeLeft = () => {
    try {
      const end = getMembershipEndDate();
      if (!end) return { text: "N/A", isExpired: false };
      const now = new Date();
      const diffMs = end.getTime() - now.getTime();
      if (diffMs <= 0) return { text: "Expired", isExpired: true };
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;
      if (months > 0 && days > 0)
        return { text: `${months} mo ${days} d`, isExpired: false };
      if (months > 0) return { text: `${months} mo`, isExpired: false };
      return { text: `${totalDays} d`, isExpired: false };
    } catch {
      return { text: "N/A", isExpired: false };
    }
  };

  const membershipLeft = getMembershipTimeLeft();
  const getMembershipLeftColor = () => {
    if (membershipLeft.isExpired) return "bg-red-500";
    const text = membershipLeft.text;
    const daysMatch = /([0-9]+) d$/.exec(text);
    const days = daysMatch ? Number(daysMatch[1]) : null;
    if (days !== null) {
      if (days <= 7) return "bg-orange-500";
      if (days <= 30) return "bg-yellow-500";
      return "bg-green-500";
    }
    return "bg-green-500";
  };

  // Get membership status with proper color mapping
  const getMembershipStatus = () => {
    try {
      const status = studentProfile?.membershipStatus || "pending";
      switch (status) {
        case "approved":
          return { text: "Active", color: "bg-green-500" };
        case "pending":
        case "waiting_for_approval":
          return { text: "Pending", color: "bg-yellow-500" };
        case "canceled":
          return { text: "Inactive", color: "bg-red-500" };
        default:
          return { text: "Pending", color: "bg-yellow-500" };
      }
    } catch (error) {
      console.error("Error getting membership status:", error);
      return { text: "Pending", color: "bg-yellow-500" };
    }
  };

  const membershipStatus = getMembershipStatus();

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const { data: profile } = await authAPI.getProfile();
        if (!isMounted) return;
        setStudentProfile((prev) => {
          const merged = { ...prev, ...profile };
          try {
            localStorage.setItem("user", JSON.stringify(merged));
          } catch {}
          return merged;
        });
      } catch (e) {
        // ignore, fallback to localStorage
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchBorrowingStatus = async () => {
      try {
        setLoading(true);
        const response = await borrowAPI.getUserBorrowingStatus();
        setBorrowingStatus(response.data);
      } catch (err) {
        console.error("Error fetching borrowing status:", err);
        // Set default values if API fails
        setBorrowingStatus({
          totalBorrowed: 0,
          totalReserved: 0,
          booksRemaining: 3,
          maxBooksAllowed: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent race conditions
    setTimeout(() => {
      fetchBorrowingStatus();
    }, 100);
  }, []);

  const stats = [
    {
      title: "Borrowed Books",
      value: loading
        ? "Loading..."
        : `${borrowingStatus?.totalBorrowed || 0}/${
            borrowingStatus?.maxBooksAllowed || 3
          }`,
      icon: <FaBook className="text-2xl" />,
      color: "bg-blue-500",
    },
    {
      title: "Account Status",
      value: membershipStatus?.text || "Pending",
      icon: <FaUser className="text-2xl" />,
      color: membershipStatus?.color || "bg-yellow-500",
    },
    {
      title: "Membership Expires In",
      value: membershipLeft.text,
      icon: <FaClock className="text-2xl" />,
      color: getMembershipLeftColor(),
    },
  ];

  return (
    <div
      className={`flex min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <StudentSidebar />
      <main className="flex-1 p-5 md:p-6">
        <StudentNavbar />

        {/* Header Section (under navbar) */}
        <div className="mb-6 pt-6 md:pt-8">
          <h1
            className={`text-2xl md:text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-2`}
          >
            Welcome back,{" "}
            {studentProfile?.username || studentProfile?.name || "User"}!
          </h1>
          {/* Email hidden per requirement */}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left Side - Events Carousel */}
          <div className="h-full">
            <EventsCarousel />
          </div>

          {/* Right Side - Account Status and Membership stacked */}
          <div className="space-y-4 h-full">
            {/* Account Status */}
            <div
              className={`rounded-xl p-10 ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {stats[1].title}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {stats[1].value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stats[1].color} text-white`}>
                  {stats[1].icon}
                </div>
              </div>
            </div>

            {/* Membership Expires In */}
            <div
              className={`rounded-xl p-10 ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {stats[2].title}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {stats[2].value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stats[2].color} text-white`}>
                  {stats[2].icon}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setActiveTab("books")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "books"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FaBook className="inline mr-2" />
              Browse Books
            </button>
            <button
              onClick={() => setActiveTab("mybooks")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "mybooks"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FaUser className="inline mr-2" />
              My Books
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {activeTab === "books" && <BookList />}
          {activeTab === "mybooks" && <MyBooks />}
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default StudentDashboardEnhanced;
