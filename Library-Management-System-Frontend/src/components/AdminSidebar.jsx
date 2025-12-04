import React from "react";
import {
  FaTachometerAlt,
  FaBook,
  FaUsers,
  FaCog,
  FaBars,
  FaTimes,
  FaPlusSquare,
  FaReceipt,
  FaSignOutAlt,
  FaUser,
  FaChevronLeft,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { useSidebar } from "@/contexts/SidebarContext";
import logo from "@/assets/logo.jpg";

const menuItems = [
  { name: "Dashboard", icon: <FaTachometerAlt />, link: "/admin" },
  { name: "Books", icon: <FaBook />, link: "/admin/books" },
  { name: "Add Book", icon: <FaPlusSquare />, link: "/admin/add-book" },
  { name: "Orders", icon: <FaReceipt />, link: "/admin/orders" },
  { name: "Users", icon: <FaUsers />, link: "/admin/users" },
  { name: "Profile", icon: <FaUser />, link: "/admin/profile" },
  // { name: "Settings", icon: <FaCog />, link: "/admin/settings" },
];

const AdminSidebar = () => {
  const { collapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`h-screen sticky top-0 transition-[width] duration-300 ease-in-out z-40 flex flex-col overflow-hidden ${
        isDark
          ? "bg-gray-800 border-r border-gray-700 text-white"
          : "bg-white border-r border-gray-200 text-gray-800"
      } ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4 border-b ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        {!collapsed ? (
          <>
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={logo} 
                  alt="Library Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={`font-bold text-lg ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                ASTUMSJ Library
              </span>
            </div>
            
            {/* Collapse Button */}
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <FaChevronLeft className="text-sm" />
            </button>
          </>
        ) : (
          /* Collapsed State - Only Hamburger */
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FaBars className="text-lg" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.link}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                  isActive(item.link)
                    ? isDark
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                    : isDark
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-blue-700 hover:bg-gray-100"
                }`}
              >
                <span
                  className={`text-lg ${
                    isActive(item.link) 
                      ? isDark 
                        ? "text-white" 
                        : "text-blue-700"
                      : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`ml-3 font-medium text-sm transition-opacity duration-200 ${
                    collapsed ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`mb-4 ${collapsed ? 'flex justify-center' : ''}`}>
          <ThemeToggle />
        </div>
        <div className={`${collapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`${collapsed ? 'w-28' : 'w-full'} flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-4 py-2 rounded-lg transition-all duration-200 ${
              isDark
                ? "text-red-400 hover:text-red-300 hover:bg-red-900/30"
                : "text-red-600 hover:text-red-700 hover:bg-red-100"
            }`}
          >
            <FaSignOutAlt className="text-lg" />
            {!collapsed && (
              <span className="ml-3 font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
