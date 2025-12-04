import React from "react";
import { FaFacebook, FaTwitter, FaTelegram, FaHeadset } from "react-icons/fa";

import { useTheme } from "@/contexts/ThemeContext";

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer
      className={`w-full py-6 px-4 mt-8 ${
        isDark ? "bg-gray-900 text-gray-300" : "bg-white text-gray-700"
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col mb-4 md:mb-0">
          <span className="font-semibold text-lg tracking-wide">
            &copy; {new Date().getFullYear()} ASTUMSJ Library Admin
          </span>
          <span className="text-sm">
            Powered by <span className="font-bold text-blue-600">ASTUMSJ</span>
          </span>
          {/* </div>
        <div className="flex flex-col md:flex-row items-center justify-between w-full"> */}
          {/* <div className="flex space-x-6 mb-4 md:mb-0">
            <Link
              to="/terms"
              className="text-sm hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-sm hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </Link> */}
        </div>
        <div className="flex space-x-6">
          <a
            href="https://t.me/ASTU_MSJ"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition"
          >
            <FaTelegram className="text-xl" />
          </a>
          <a
            href="https://t.me/ASTUMSJBOT"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition"
            title="Support Bot"
          >
            <FaHeadset className="text-xl" />
          </a>
          {/* </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
