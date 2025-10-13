import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudent } from "react-icons/pi";
import { useNavigate } from "react-router";

const Role = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Heading */}
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            Choose your role
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Select your role to get started with the right experience for you.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-4 sm:space-y-6">
          {/* I'm a Teacher */}
          <button 
            className="w-full bg-[#FBC02D] text-white rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col items-center hover:bg-[#F9A825] transition-colors duration-200 touch-manipulation active:bg-[#F57C00] min-h-[200px] sm:min-h-[240px]"
            onClick={() => navigate("/login")}
          >
            <div className="bg-white bg-opacity-20 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <FaChalkboardTeacher className="w-8 h-8 sm:w-10 sm:h-10 text-[#FBC02D]"/>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">I'm a Teacher</h2>
            <p className="text-sm opacity-90 mt-2 text-center">
              Create and manage exams for your students
            </p>
          </button>

          {/* I'm a Student */}
          <button 
            className="w-full border-2 border-[#FBC02D] text-gray-800 rounded-2xl shadow-md p-6 sm:p-8 flex flex-col items-center hover:bg-yellow-50 transition-colors duration-200 touch-manipulation active:bg-yellow-100 min-h-[200px] sm:min-h-[240px]"
            onClick={() => navigate("/paste-exam-link")}
          >
            <div className="bg-[#FBC02D] bg-opacity-10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <PiStudent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">I'm a Student</h2>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Take exams and view your results
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Role;
