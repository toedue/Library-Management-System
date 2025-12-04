import React from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaLock,
  FaEye,
  FaCookie,
  FaUserCheck,
  FaEnvelope,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
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
                  className="text-2xl font-bold text-green-800"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  ASTUMSJ LIBRARY
                </h1>
                <p className="text-sm text-gray-600">Privacy Policy</p>
              </div>
            </div>
            <Link
              to="/signup"
              className="flex items-center px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
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
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-12 text-white text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-white/20 p-4 rounded-full">
                <FaShieldAlt size={48} />
              </div>
            </motion.div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Privacy Policy
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we protect and handle
              your information.
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
                    <FaEye size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      1. Information We Collect
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      We collect information you provide directly to us, such as
                      when you create an account, borrow books, or contact us
                      for support.
                    </p>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>• Personal information (name, email, student ID)</p>
                      <p>• Borrowing history and preferences</p>
                      <p>• Communication records with our support team</p>
                      <p>• Usage data and system interactions</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border-l-4 border-purple-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-500 p-3 rounded-lg text-white">
                    <FaUserCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      2. How We Use Your Information
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      We use the information we collect to provide, maintain,
                      and improve our library services.
                    </p>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>• Process book borrowings and returns</p>
                      <p>• Send important notifications and updates</p>
                      <p>• Improve our services and user experience</p>
                      <p>• Ensure system security and prevent fraud</p>
                      <p>• Comply with legal obligations</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-xl border-l-4 border-red-500"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  3. Information Sharing
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties without your consent.
                </p>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">
                    <strong>Exception:</strong> We may share information only
                    when required by law or to protect our rights and safety.
                  </p>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500 p-3 rounded-lg text-white">
                    <FaLock size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      4. Data Security
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      We implement industry-standard security measures to
                      protect your personal information against unauthorized
                      access, alteration, disclosure, or destruction. This
                      includes encryption, secure servers, and regular security
                      audits.
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border-l-4 border-orange-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-500 p-3 rounded-lg text-white">
                    <FaCookie size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      5. Cookies and Tracking
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Our website may use cookies and similar technologies to
                      enhance your browsing experience.
                    </p>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>• Essential cookies for system functionality</p>
                      <p>• Analytics cookies to improve our services</p>
                      <p>• Preference cookies to remember your settings</p>
                      <p>
                        • You can control cookie settings through your browser
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section> */}

              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border-l-4 border-teal-500"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  5. Your Rights
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You have several rights regarding your personal information:
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    <span>Access your personal data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    <span>Correct inaccurate information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    <span>Request data deletion</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    <span>Object to processing</span>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border-l-4 border-indigo-500"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  6. Changes to This Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this privacy policy from time to time. We will
                  notify you of any material changes by posting the new policy
                  on this page and sending you an email notification. Your
                  continued use of our services after such changes constitutes
                  acceptance of the updated policy.
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border-l-4 border-pink-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-pink-500 p-3 rounded-lg text-white">
                    <FaEnvelope size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      7. Contact Us
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      If you have any questions about this Privacy Policy or our
                      data practices, please contact us:
                    </p>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>
                        <strong>Email:</strong> privacy@astumsj.edu.et
                      </p>
                      <p>
                        <strong>Phone:</strong> +251-XX-XXXXXXX
                      </p>
                      <p>
                        <strong>Address:</strong> ASTUMSJ Library, Addis Ababa,
                        Ethiopia
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="mt-12 pt-8 border-t border-gray-200 text-center"
            >
              <p className="text-sm text-gray-500 mb-2">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                This privacy policy is effective as of the date shown above and
                will remain in effect except with respect to any changes in its
                provisions in the future.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
