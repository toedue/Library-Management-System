import React, { useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail, MdLock } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaBookOpen } from "react-icons/fa";
import { authAPI } from "@/services/api";
import toast from "react-hot-toast";

const InputForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailInput = e.target.email;
    const passwordInput = e.target.password;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
      toast.error("Email address is required.");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Invalid email format. Please enter a valid email address.");
      return;
    }
    if (!password) {
      toast.error("Password is required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const data = response.data;

      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Navigate based on role
      if (data.user.role === "admin" || data.user.role === "super_admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <div className="group relative">
          <label
            className={`absolute left-10 top-3 text-gray-600 font-medium transition-all duration-300 pointer-events-none ${
              emailFocused || document.getElementById("email")?.value
                ? "text-xs -top-2 text-blue-600 bg-white px-1"
                : "text-base"
            }`}
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="relative transform transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02]">
            <span
              className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-all duration-300 ${
                emailFocused ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <MdEmail size={20} />
            </span>
            <input
              className="border text-black border-gray-300 rounded-xl px-4 py-4 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl bg-white/80 backdrop-blur-sm"
              type="email"
              name="email"
              id="email"
              autoComplete="username"
              placeholder=""
              onFocus={() => setEmailFocused(true)}
              onBlur={(e) => setEmailFocused(e.target.value !== "")}
            />
          </div>
        </div>
        <div className="group relative">
          <label
            className={`absolute left-10 top-3 text-gray-600 font-medium transition-all duration-300 pointer-events-none ${
              passwordFocused || document.getElementById("password")?.value
                ? "text-xs -top-2 text-blue-600 bg-white px-1"
                : "text-base"
            }`}
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative transform transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02]">
            <span
              className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-all duration-300 ${
                passwordFocused ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <MdLock size={20} />
            </span>
            <input
              className="border text-black border-gray-300 rounded-xl px-4 py-4 w-full pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl bg-white/80 backdrop-blur-sm"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              autoComplete="current-password"
              placeholder=""
              onFocus={() => setPasswordFocused(true)}
              onBlur={(e) => setPasswordFocused(e.target.value !== "")}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Accessing Library...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <FaBookOpen size={18} />
              Login to Library
            </div>
          )}
        </Button>
        <p className="text-center text-gray-700 mt-4">
          <Link
            to="/forgot-password"
            className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200"
          >
            Forgot Password?
          </Link>
        </p>
        <p className="text-center text-gray-700 mt-2">
          New to our library?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:-bottom-1 after:transition-all after:duration-200 hover:after:w-full"
          >
            Join Now
          </Link>
        </p>
      </form>
    </div>
  );
};

export default InputForm;
