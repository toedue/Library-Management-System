import React from "react";
import { motion } from "framer-motion";
import * as Login from "./Login";
import * as SignUp from "./SignUp";

const pageVariants = {
  initial: { opacity: 0, x: -100, rotateY: -90 },
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { delay: 0.2, duration: 0.5, ease: "easeOut" },
  },
};

const Auth = ({ mode }) => {
  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
      <motion.div
        className="relative w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden bg-white"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          key={mode}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="flex flex-col lg:flex-row shadow-lg"
        >
          {isLogin ? (
            <>
              {/* Login: Image Left, Form Right */}
              <motion.div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-1"
                variants={cardVariants}
              >
                <Login.LeftSide />
              </motion.div>
              <motion.div
                className="w-full lg:w-1/2 p-12 flex items-center justify-center order-2"
                variants={cardVariants}
              >
                <Login.RightSide />
              </motion.div>
            </>
          ) : (
            <>
              {/* Signup: Form Left, Image Right */}
              <motion.div
                className="w-full lg:w-1/2 p-12 flex items-center justify-center order-1"
                variants={cardVariants}
              >
                <SignUp.LeftSide />
              </motion.div>
              <motion.div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-2"
                variants={cardVariants}
              >
                <SignUp.RightSide />
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
    </div>
  );
};

export default Auth;
