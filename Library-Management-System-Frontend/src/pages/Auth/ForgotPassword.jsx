import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaBookOpen } from "react-icons/fa";
import logo from "@/assets/logo.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-12 bg-white shadow-lg rounded-xl min-h-[700px]">
          <div className="w-full max-w-md text-center">
            <div className="relative inline-block mb-8">
              <img
                src={logo}
                alt="Logo"
                className="h-20 w-20 rounded-full shadow-lg ring-4 ring-blue-200"
              />
              <div className="absolute -top-2 -right-2 animate-pulse">
                <FaBookOpen size={20} className="text-blue-600" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-blue-800 mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-8">
              If an account with that email address exists, we've sent you a
              password reset link.
            </p>
            <Link
              to="/"
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200"
            >
              Back to Login
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Library Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-blue-300/30"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-12">
            <h1 className="text-6xl font-extrabold mb-6 animate-slide-in-left text-white drop-shadow-lg">
              Reset Password
            </h1>
            <p className="text-2xl animate-slide-in-right text-white max-w-lg text-center drop-shadow-md">
              Secure your account with a new password.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12 bg-white shadow-lg rounded-xl min-h-[700px]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <img
                src={logo}
                alt="Logo"
                className="h-20 w-20 rounded-full shadow-lg ring-4 ring-blue-200"
              />
              <div className="absolute -top-2 -right-2 animate-pulse">
                <FaBookOpen size={20} className="text-blue-600" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-blue-800 mb-2">
              Forgot Password?
            </h2>
            <p className="text-blue-600 text-lg">
              Enter your email to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="group relative">
              <label className="absolute left-10 top-3 text-gray-600 font-medium transition-all duration-300 pointer-events-none text-xs -top-2 text-blue-600 bg-white px-1">
                Email Address
              </label>
              <div className="relative transform transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <MdEmail size={20} />
                </span>
                <input
                  className="border text-black border-gray-300 rounded-xl px-4 py-4 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl bg-white/80 backdrop-blur-sm"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder=""
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50/80 backdrop-blur-sm p-4 rounded-xl border border-red-200 animate-fade-in-up shadow-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FaBookOpen size={18} />
                  Send Reset Link
                </div>
              )}
            </Button>

            <p className="text-center text-gray-700 mt-6">
              Remember your password?{" "}
              <Link
                to="/"
                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:-bottom-1 after:transition-all after:duration-200 hover:after:w-full"
              >
                Back to Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Library Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-blue-300/30"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12">
          <h1 className="text-6xl font-extrabold mb-6 animate-slide-in-left text-white drop-shadow-lg">
            Reset Password
          </h1>
          <p className="text-2xl animate-slide-in-right text-white max-w-lg text-center drop-shadow-md">
            Secure your account with a new password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
