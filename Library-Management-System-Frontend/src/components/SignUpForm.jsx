import React, { useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaBookOpen } from "react-icons/fa";
import { authAPI } from "@/services/api";
import toast from "react-hot-toast";

const SignUpForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Focus states for floating labels
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    const firstName = formData.get("firstName")?.trim();
    const lastName = formData.get("lastName")?.trim();
    const email = formData.get("email")?.trim();
    const password = formData.get("password")?.trim();
    const confirmPassword = formData.get("confirmPassword")?.trim();
    const terms = formData.get("terms") === "on";

    if (!firstName) {
      toast.error("First name is required.");
      setIsLoading(false);
      return;
    }
    if (!lastName) {
      toast.error("Last name is required.");
      setIsLoading(false);
      return;
    }
    if (!email) {
      toast.error("Email address is required.");
      setIsLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Invalid email format. Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    if (!password) {
      toast.error("Password is required.");
      setIsLoading(false);
      return;
    }
    if (!confirmPassword) {
      toast.error("Password confirmation is required.");
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (!terms) {
      toast.error("You must agree to the terms and conditions.");
      setIsLoading(false);
      return;
    }

    const username = `${firstName} ${lastName}`;
    const payload = {
      username,
      email,
      password,
    };

    try {
      const response = await authAPI.register(payload);
      console.log("Signup success:", response.data);

      toast.success("Account created successfully! You can now log in.");
      e.target.reset();
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <div className="flex gap-4">
          <div className="w-1/2 group relative">
            <label
              className={`absolute left-10 top-3 text-gray-600 font-medium transition-all duration-300 pointer-events-none ${
                firstNameFocused || document.getElementById("firstName")?.value
                  ? "text-xs -top-2 text-amber-600 bg-white px-1"
                  : "text-base"
              }`}
              htmlFor="firstName"
            >
              First Name
            </label>
            <div className="relative transform transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02]">
              <span
                className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-all duration-300 ${
                  firstNameFocused ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <MdPerson size={20} />
              </span>
              <input
                className="border text-black border-gray-300 rounded-xl px-4 py-4 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl bg-white/80 backdrop-blur-sm"
                type="text"
                name="firstName"
                id="firstName"
                placeholder=""
                autoComplete="given-name"
                onFocus={() => setFirstNameFocused(true)}
                onBlur={(e) => setFirstNameFocused(e.target.value !== "")}
              />
            </div>
          </div>
          <div className="w-1/2 group relative">
            <label
              className={`absolute left-10 top-3 text-gray-600 font-medium transition-all duration-300 pointer-events-none ${
                lastNameFocused || document.getElementById("lastName")?.value
                  ? "text-xs -top-2 text-amber-600 bg-white px-1"
                  : "text-base"
              }`}
              htmlFor="lastName"
            >
              Last Name
            </label>
            <div className="relative transform transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02]">
              <span
                className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-all duration-300 ${
                  lastNameFocused ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <MdPerson size={20} />
              </span>
              <input
                className="border text-black border-gray-300 rounded-xl px-4 py-4 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl bg-white/80 backdrop-blur-sm"
                type="text"
                name="lastName"
                id="lastName"
                placeholder=""
                autoComplete="family-name"
                onFocus={() => setLastNameFocused(true)}
                onBlur={(e) => setLastNameFocused(e.target.value !== "")}
              />
            </div>
          </div>
        </div>
        <div className="group relative">
          <label
            className={`absolute left-10 top-3 text-gray-600 font-medium transition-all duration-300 pointer-events-none ${
              emailFocused || document.getElementById("email")?.value
                ? "text-xs -top-2 text-amber-600 bg-white px-1"
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
              placeholder=""
              autoComplete="username"
              onFocus={() => setEmailFocused(true)}
              onBlur={(e) => setEmailFocused(e.target.value !== "")}
            />
          </div>
        </div>
        <div className="group relative">
          <label
            className={`absolute left-10 top-3 text-gray-600 font-medium transition-all duration-300 pointer-events-none ${
              passwordFocused || document.getElementById("password")?.value
                ? "text-xs -top-2 text-amber-600 bg-white px-1"
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
              placeholder=""
              autoComplete="new-password"
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
        <div className="group relative">
          <label
            className={`absolute left-10 top-3 text-gray-600 font-medium transition-all duration-300 pointer-events-none ${
              confirmFocused ||
              document.getElementById("confirmPassword")?.value
                ? "text-xs -top-2 text-amber-600 bg-white px-1"
                : "text-base"
            }`}
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <div className="relative transform transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02]">
            <span
              className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-all duration-300 ${
                confirmFocused ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <MdLock size={20} />
            </span>
            <input
              className="border text-black border-gray-300 rounded-xl px-4 py-4 w-full pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl bg-white/80 backdrop-blur-sm"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              id="confirmPassword"
              placeholder=""
              autoComplete="new-password"
              onFocus={() => setConfirmFocused(true)}
              onBlur={(e) => setConfirmFocused(e.target.value !== "")}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              onClick={() => setShowConfirm((prev) => !prev)}
              tabIndex={-1}
            >
              {showConfirm ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center mb-2">
          <input type="checkbox" name="terms" id="terms" className="mr-2" />
          <label htmlFor="terms" className="text-gray-700 text-sm">
            I agree to the{" "}
            <Link
              to="/terms"
              className="text-blue-600 font-semibold hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-blue-600 font-semibold hover:underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Account...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <FaBookOpen size={18} />
              Create Account
            </div>
          )}
        </Button>
        <p className="text-center text-gray-700 mt-2">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpForm;
