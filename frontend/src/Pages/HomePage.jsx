import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "../Context/AuthContext";

const HomePage = () => {
   const navigate = useNavigate();
   const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      // If user is already logged in, go to home, otherwise go to login
      if (!loading) {
        navigate(user ? "/home" : "/login");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate, user, loading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">

      <motion.img
        src="/image-10.png" 
        alt="EyeQ Logo"
        className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mb-4 sm:mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Title with animation */}
      <motion.h1
        className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Welcome to <br /> EyeQ
      </motion.h1>

      <motion.p
        className="text-sm sm:text-md lg:text-lg text-center text-gray-400 mt-6 sm:mt-10 max-w-md sm:max-w-lg lg:max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Breaking barriers, building futures - an exam system designed for every learner.
        <br /> 
       
      </motion.p>
      <motion.p
        className="text-sm sm:text-md lg:text-lg text-center font-bold text-blue-500 mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        Hear, respond, and succeed with confidence
      </motion.p>
    </div>
  );
};

export default HomePage;
