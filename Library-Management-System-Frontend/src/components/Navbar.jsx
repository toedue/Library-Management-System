import React, { useState } from "react";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
// Removed ThemeToggle from Navbar to avoid duplication with Sidebar
import { useTheme } from "@/contexts/ThemeContext";
import logo from "@/assets/logo.jpg";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = user.username
    ? user.username.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  // Removed Books, Users, Orders from the top navbar as requested
  const navItems = [];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full sticky top-0 z-50 ">
      <div className="max-w-7xl mx-auto">
        <div
          className={`flex items-center justify-between h-16 px-6 rounded-full backdrop-blur-md border transition-all duration-300 ${
            isDark
              ? "bg-gray-900/30 border-gray-700/50 text-white shadow-lg shadow-gray-900/20"
              : "bg-white/30 border-gray-200/50 text-gray-800 shadow-lg shadow-gray-200/20"
          }`}
        >
          {/* Logo/Brand */}
          <Link
            to="/admin"
            className="flex items-center space-x-2 text-xl font-bold tracking-tight"
          >
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-full" />
            <span
              className={`hidden sm:block ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              ASTUMSJ
            </span>
            <span
              className={`hidden sm:block ${
                isDark ? "text-gray-400" : "text-gray-600"
              } font-normal ml-1`}
            >
              Admin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? isDark
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                    : isDark
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-blue-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* User profile */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("/admin/profile")}
                className={`p-2 rounded-full ${
                  isDark ? "bg-gray-800" : "bg-gray-100"
                } hover:opacity-90 transition-opacity`}
                title="My Profile"
              >
                <FaUserCircle
                  className={`text-xl ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                />
              </button>
              {displayName && (
                <span
                  className={`hidden lg:block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {displayName}
                </span>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-blue-700 hover:bg-gray-100"
              }`}
            >
              {isMenuOpen ? (
                <FaTimes className="text-lg" />
              ) : (
                <FaBars className="text-lg" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className={`md:hidden mt-4 rounded-2xl backdrop-blur-md border py-4 ${
              isDark
                ? "bg-gray-900/30 border-gray-700/50 shadow-lg shadow-gray-900/20"
                : "bg-white/30 border-gray-200/50 shadow-lg shadow-gray-200/20"
            }`}
          >
            <div className="space-y-2 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? isDark
                        ? "bg-blue-600/80 text-white"
                        : "bg-blue-100/80 text-blue-700"
                      : isDark
                      ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      : "text-gray-600 hover:text-blue-700 hover:bg-gray-100/50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
