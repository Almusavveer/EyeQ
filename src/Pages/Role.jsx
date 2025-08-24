import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudent } from "react-icons/pi";
import { useNavigate } from "react-router";

const Role = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-start p-2">
      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Choose your role
      </h1>
      <p className="text-gray-600 mb-6">
        Select your role to get started with the right experience for you.
      </p>

      {/* I'm a Student */}
      <div className="w-full max-w-sm mb-4 mt-10">
        <button className="w-full bg-[#FBC02D] text-white h-60 justify-center rounded-2xl shadow-lg p-8 flex flex-col items-center hover:bg-[#F9A825] transition" onClick={() => navigate("/login")}>
          <div className="bg-white bg-opacity-20 p-4 rounded-full mb-3">
            {/* Student Icon */}
           <FaChalkboardTeacher className="w-10 h-10 text-secondary-yellow"/>
          </div>
          <h2 className="text-lg font-semibold">I'm a Teacher</h2>
        </button>
      </div>

      {/* I'm a Teacher */}
      <div className="w-full max-w-sm mb-6">
        <button className="w-full border-2 border-[#FBC02D] text-gray-800 h-60 justify-center rounded-2xl shadow-md p-8 flex flex-col items-center hover:bg-yellow-50 transition" 
        onClick={() => navigate("/exam")}
        >
          <div className="bg-[#FBC02D] bg-opacity-10 p-4 rounded-full mb-3">
            {/* Teacher Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 14L3 9l9-5 9 5-9 5z" />
              <path d="M12 14v7m0-7l9-5m-9 5L3 9" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">I'm a Student</h2>
        </button>
      </div>
    </div>
  );
};

export default Role;
