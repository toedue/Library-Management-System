import AdminSidebar from "@/components/AdminSidebar";
import { useTheme } from "@/contexts/ThemeContext";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  FaBook,
  FaUsers,
  FaClipboardList,
  FaPlusCircle,
  FaChartLine,
  FaHistory,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { booksAPI, usersAPI, borrowAPI } from "@/services/api";
import BorrowingHistory from "@/components/BorrowingHistory";
import CarouselControl from "@/components/CarouselControl";
// Live dashboard data

const quickActions = [
  {
    title: "Add New Book",
    description: "Add a new book to the library collection",
    icon: <FaPlusCircle className="text-xl" />,
    link: "/admin/add-book",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Manage Users",
    description: "View and manage library users and permissions",
    icon: <FaUsers className="text-xl" />,
    link: "/admin/users",
    color: "bg-purple-500 hover:bg-purple-600",
  },
];
// Example chart data

const AdminDashboardModern = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [recent, setRecent] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const activityPageSize = 3;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      let anySuccess = false;
      try {
        const booksRes = await booksAPI.getAllBooks();
        setBooks(booksRes.data || []);
        anySuccess = true;
      } catch (_) {
        // keep going; books not critical to render others
      }

      try {
        const userJson = JSON.parse(localStorage.getItem("user") || "{}");
        const isSuper = userJson.role === "super_admin";
        const usersRes = isSuper
          ? await usersAPI.getAllUsersSuperAdmin()
          : await usersAPI.getAllUsersAdminView();
        setUsers(usersRes.data || []);
        // console.log(users);
        anySuccess = true;
      } catch (_) {
        // ignore 403/401 and continue
      }

      try {
        const borrowsRes = await borrowAPI.getAllBorrows();
        setBorrows(borrowsRes.data || []);
        const recentItems = (borrowsRes.data || [])
          .map((b) => ({
            id: b._id,
            user: b.user?.name || b.user?.username || "Unknown",
            book: b.book?.title || "Unknown",
            status: b.status,
            date: b.updatedAt || b.createdAt,
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecent(recentItems);
        anySuccess = true;
      } catch (e) {
        // ignore and allow partial render
      }

      if (!anySuccess) {
        setError("Failed to load dashboard data");
      } else {
        setError(null);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const computedStats = useMemo(() => {
    const totalBooks = books.length;
    const totalCopies = books.reduce(
      (sum, b) => sum + (Number(b.totalCopies) || 0),
      0
    );
    const availableCopies = books.reduce(
      (sum, b) => sum + (Number(b.availableCopies) || 0),
      0
    );
    const borrowedCopies = totalCopies - availableCopies;
    const activeUsers = users.length;
    const pendingReservations = borrows.filter(
      (b) => b.status === "reserved"
    ).length;

    return [
      {
        title: "Total Books",
        value: String(totalBooks),
        icon: <FaBook className="text-blue-250" />,
        description: "Books in catalog",
        bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      },
      {
        title: "Active Users",
        value: String(activeUsers),
        icon: <FaUsers className="text-green-250" />,
        description: "Registered users",
        bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      },
      {
        title: "Borrowed Copies",
        value: String(borrowedCopies),
        icon: <FaClipboardList className="text-yellow-250" />,
        description: "Currently on loan",
        bgColor: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      },
      {
        title: "Pending Reservations",
        value: String(pendingReservations),
        icon: <FaUsers className="text-purple-250" />,
        description: "Awaiting confirmation",
        bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      },
    ];
  }, [books, users, borrows]);

  const booksAddedData = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const counts = books.reduce((acc, book) => {
      const month = new Date(book.createdAt || Date.now()).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, Array(12).fill(0));

    return monthNames.map((name, index) => ({
      month: name,
      books: counts[index],
    }));
  }, [books]);
  // console.log(booksAddedData);
  const bookAddedData = [
    { month: "Jan", books: 40 },
    { month: "Feb", books: 55 },
    { month: "Mar", books: 32 },
    { month: "Apr", books: 60 },
    { month: "May", books: 48 },
    { month: "Jun", books: 70 },
  ];

  const recentActivities = useMemo(() => {
    return recent.map((r) => ({
      type:
        r.status === "borrowed"
          ? "Borrow"
          : r.status === "returned"
          ? "Return"
          : "Reservation",
      detail: `${r.user} • ${r.book}`,
      user: r.user,
      date: new Date(r.date).toLocaleDateString(),
      status:
        r.status === "borrowed"
          ? "Borrowed"
          : r.status === "returned"
          ? "Returned"
          : "Reserved",
      icon:
        r.status === "borrowed" ? (
          <FaClock className="text-yellow-500" />
        ) : r.status === "returned" ? (
          <FaCheckCircle className="text-blue-500" />
        ) : (
          <FaPlusCircle className="text-green-500" />
        ),
    }));
  }, [recent]);

  const activityTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(recentActivities.length / activityPageSize));
  }, [recentActivities.length]);

  const paginatedRecentActivities = useMemo(() => {
    const start = (activityPage - 1) * activityPageSize;
    const end = start + activityPageSize;
    return recentActivities.slice(start, end);
  }, [recentActivities, activityPage]);

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "Returned":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case "Borrowed":
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case "Returned Late":
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case "Completed":
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  return (
    <div
      className={`flex flex-row min-h-screen ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <AdminSidebar />
      <main className="flex-1 px-6 py-6">
        <Navbar />

        {/* Header Section */}
        <div className="mb-8 pt-6 md:pt-8">
          <h1
            className={`text-2xl md:text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-2`}
          >
            Welcome to ASTUMSJ Library Admin Dashboard
          </h1>
          <p
            className={`text-base ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Manage your library system with ease and efficiency
          </p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className={`mb-8 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Loading dashboard...
          </div>
        )}
        {error && (
          <div className={`mb-8 ${isDark ? "text-red-300" : "text-red-600"}`}>
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Events Carousel Control - Left Side */}
          <div className="h-full">
            <CarouselControl />
          </div>

          {/* Right Side - Stacked Cards */}
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                onClick={() => navigate(action.link)}
                className={`shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } border-2 hover:border-blue-500`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2 rounded-lg ${action.color} text-white`}
                    >
                      {action.icon}
                    </div>
                    <FaArrowRight className="text-gray-400" />
                  </div>
                  <h3
                    className={`text-base font-semibold mb-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {action.title}
                  </h3>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {computedStats.map((stat) => (
            <Card
              key={stat.title}
              onClick={() => {
                if (stat.title === "Total Books") navigate("/admin/books");
                else if (stat.title === "Active Users")
                  navigate("/admin/users");
                else if (stat.title === "Borrowed Copies")
                  navigate("/admin/orders");
                else if (stat.title === "Pending Reservations")
                  navigate("/admin/orders");
              }}
              className={`shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                isDark ? "bg-gray-800" : "bg-white"
              } overflow-hidden`}
            >
              <div className={`${stat.bgColor} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="text-3xl opacity-80">{stat.icon}</div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.title}</div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Books Added Chart */}
          <Card className={`shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <FaChartLine className="text-blue-500 text-xl" />
                <CardTitle className={isDark ? "text-white" : "text-black"}>
                  Books Added Per Month
                </CardTitle>
              </div>
              <CardDescription
                className={isDark ? "text-gray-300" : "text-gray-600"}
              >
                Track how many books are added monthly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={booksAddedData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                  />
                  <YAxis stroke={isDark ? "#9ca3af" : "#6b7280"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#fff",
                      borderColor: isDark ? "#374151" : "#e5e7eb",
                      color: isDark ? "#fff" : "#000",
                    }}
                  />
                  <Bar dataKey="books" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className={`shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <FaHistory className="text-purple-500 text-xl" />
                <CardTitle className={isDark ? "text-white" : "text-black"}>
                  Recent Activity
                </CardTitle>
              </div>
              <CardDescription
                className={isDark ? "text-gray-300" : "text-gray-600"}
              >
                Latest actions in the library system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paginatedRecentActivities.map((activity, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-shrink-0">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {activity.detail}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {activity.user} • {activity.date}
                      </p>
                    </div>
                    <span className={getStatusBadge(activity.status)}>
                      {activity.status}
                    </span>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    No recent activity
                  </div>
                )}
                {recentActivities.length > 0 && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                      disabled={activityPage === 1}
                      className={`px-3 py-1 text-sm rounded ${
                        activityPage === 1
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : isDark
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      Previous
                    </button>
                    <span
                      className={`text-xs ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Page {activityPage} of {activityTotalPages}
                    </span>
                    <button
                      onClick={() =>
                        setActivityPage((p) =>
                          Math.min(activityTotalPages, p + 1)
                        )
                      }
                      disabled={activityPage === activityTotalPages}
                      className={`px-3 py-1 text-sm rounded ${
                        activityPage === activityTotalPages
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : isDark
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Borrowing History */}
        <BorrowingHistory isAdmin={true} />

        <Footer />
      </main>
    </div>
  );
};

export default AdminDashboardModern;
