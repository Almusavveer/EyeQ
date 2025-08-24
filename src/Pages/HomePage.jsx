import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";

const HomePage = () => {
   const navigate = useNavigate();

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     navigate("/role");
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">

      <motion.img
        src="/image-10.png" 
        alt="EyeQ Logo"
        className=" mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Title with animation */}
      <motion.h1
        className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Welcome to <br /> EyeQ
      </motion.h1>

      <motion.p
        className="text-md text-center text-gray-400 mt-10"
        transition={{ duration: 1, delay: 0.3 }}
      >
        Breaking barriers, building futures - an exam system designed for every learner.
        <br /> 
       
      </motion.p>
      <motion.p
        className="text-md text-center font-bold text-blue-500 mt-2"
        transition={{ duration: 1, delay: 0.3 }}
      >
        Hear, respond, and succeed with confidence
      </motion.p>
    </div>
  );
};
export default HomePage;
