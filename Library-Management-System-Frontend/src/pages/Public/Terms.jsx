import React from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaBookOpen,
  FaShieldAlt,
  FaFileContract,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-sm border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={logo}
                alt="ASTUMSJ Library Logo"
                className="h-12 w-12 rounded-full shadow-md"
              />
              <div>
                <h1
                  className="text-2xl font-bold text-blue-800"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  ASTUMSJ LIBRARY
                </h1>
                <p className="text-sm text-gray-600">Terms of Service</p>
              </div>
            </div>
            <Link
              to="/signup"
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <FaArrowLeft className="mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-white/20 p-4 rounded-full">
                <FaFileContract size={48} />
              </div>
            </motion.div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Terms of Service
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Please read these terms carefully before using our library
              management system
            </p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="space-y-8">
              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 p-3 rounded-lg text-white">
                    <FaShieldAlt size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      1. Acceptance of Terms
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      By accessing and using the ASTUMSJ Library Management
                      System, you accept and agree to be bound by the terms and
                      provision of this agreement. These terms apply to all
                      users of our platform.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500 p-3 rounded-lg text-white">
                    <FaBookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      2. Use License
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      Permission is granted to temporarily access the materials
                      (information or software) on ASTUMSJ Library's website for
                      personal, non-commercial transitory viewing only. This
                      license shall automatically terminate if you violate any
                      of these restrictions.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border-l-4 border-purple-500"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  3. User Responsibilities
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Users are responsible for maintaining the confidentiality of
                  their account and password and for restricting access to their
                  computer. You agree to accept responsibility for all
                  activities that occur under your account.
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border-l-4 border-orange-500"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  4. Book Borrowing Policy
                </h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>• Books may be borrowed for a maximum period of 14 days</p>
                  <p>• Late returns may incur fines of $0.50 per day</p>
                  <p>• Users must return books in good condition</p>
                  <p>
                    • Lost or damaged books will be charged replacement cost
                  </p>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-xl border-l-4 border-red-500"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  5. Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  In no event shall ASTUMSJ Library or its suppliers be liable
                  for any damages (including, without limitation, damages for
                  loss of data or profit) arising out of the use or inability to
                  use the materials on ASTUMSJ Library's website.
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border-l-4 border-teal-500"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  6. Governing Law
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These terms and conditions are governed by and construed in
                  accordance with the laws of Ethiopia, and you irrevocably
                  submit to the exclusive jurisdiction of the courts in that
                  location.
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border-l-4 border-indigo-500"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  7. Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will try to provide at least 30 days notice prior to any new
                  terms taking effect.
                </p>
              </motion.section>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="mt-12 pt-8 border-t border-gray-200 text-center"
            >
              <p className="text-sm text-gray-500 mb-2">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                For questions about these terms, please contact us at{" "}
                <a
                  href="mailto:legal@astumsj.edu.et"
                  className="text-blue-600 hover:underline"
                >
                  legal@astumsj.edu.et
                </a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
