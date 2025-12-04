import InputForm from "@/components/InputForm";
import React from "react";
import logo from "@/assets/logo.jpg";
const loginBanner =
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
import { FaBookOpen, FaBook, FaLightbulb } from "react-icons/fa";

export const LeftSide = () => (
  <>
    <img
      src={loginBanner}
      alt="Library Background"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-blue-300/30"></div>

    {/* Floating Library Elements */}
    <div className="absolute top-20 left-10 animate-float">
      <FaBookOpen size={48} className="text-white opacity-80" />
    </div>
    <div className="absolute bottom-20 right-10 animate-book-flip">
      <FaBook size={40} className="text-white opacity-80" />
    </div>
    <div className="absolute top-1/2 left-1/4 animate-ping">
      <FaLightbulb size={32} className="text-white opacity-80" />
    </div>
    <div
      className="absolute top-32 right-20 animate-float"
      style={{ animationDelay: "1s" }}
    >
      <FaBook size={24} className="text-white opacity-70" />
    </div>

    {/* Welcome Text Overlay */}
    <div className="absolute inset-0 flex flex-col items-center justify-center px-12">
      <h1
        className="text-6xl font-extrabold mb-6 animate-slide-in-left text-white drop-shadow-lg"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Welcome Back
      </h1>
      <p
        className="text-2xl animate-slide-in-right text-white max-w-lg text-center drop-shadow-md"
        style={{ animationDelay: "0.5s" }}
      >
        Discover your next great read with us.
      </p>
    </div>
  </>
);

export const RightSide = () => (
  <div className="w-full max-w-lg flex flex-col justify-center">
    {/* Logo and Title */}
    <div className="text-center mb-8 animate-fade-in-up">
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
      <h2
        className="text-4xl font-bold text-blue-800 mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        ASTUMSJ LIBRARY
      </h2>
      <p className="text-blue-600 text-lg">Sign in to your account</p>
    </div>

    {/* Login Form */}
    <div className="animate-fade-in-up animation-delay-200">
      <InputForm />
    </div>
  </div>
);

const Login = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Image and Decorative Elements */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <LeftSide />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12 bg-white shadow-lg rounded-xl min-h-[700px]">
        <RightSide />
      </div>
    </div>
  );
};

export default Login;
