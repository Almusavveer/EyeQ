import { useContext } from "react";
import { useNavigate, useLocation } from "react-router";

const Welcome = () => {
  const naviagate = useNavigate();
  const location = useLocation();
  const screen = location.pathname === "/login" ? "Login" : "Register";
  
  const handleChnage = (name) => {
    name === "Login" ? naviagate("/login") : naviagate("/register");
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {screen === "Login" ? (
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-6 sm:py-8">
          <div className="flex flex-col items-center gap-2">
            <img
              src="/image-10.png"
              alt="Application logo"
              className="h-16 sm:h-20 w-fit"
            />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">Eye Q</h1>
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#202020] text-center">Welcome Back!</h1>
          <div className="flex w-full items-center justify-between rounded-full bg-gray-100 p-1.5 sm:p-2">
            <button
              className={`w-[48%] rounded-full py-2 sm:py-2.5 px-3 sm:px-4 text-sm sm:text-base font-medium ${screen === "Login" ? "bg-yellow-400 text-gray-800" : "bg-gray-100 text-gray-600"} transition-all cursor-pointer shadow-[4px_4px_8px_#d1d9d6,_-4px_-4px_8px_#ffffff] sm:shadow-[8px_8px_16px_#d1d9d6,_-8px_-8px_16px_#ffffff] duration-300 active:shadow-[inset_4px_4px_8px_#d1d9d6,_inset_-4px_-4px_8px_#ffffff] sm:active:shadow-[inset_8px_8px_16px_#d1d9d6,_inset_-8px_-8px_16px_#ffffff] touch-manipulation`}
              onClick={() => handleChnage("Login")}
            >
              Login
            </button>
            <button
              className={`w-[48%] rounded-full py-2 sm:py-2.5 px-3 sm:px-4 text-sm sm:text-base font-medium ${screen === "Register" ? "bg-yellow-400 text-gray-800" : "bg-gray-100 text-gray-600"} transition-all cursor-pointer shadow-[4px_4px_8px_#d1d9d6,_-4px_-4px_8px_#ffffff] sm:shadow-[8px_8px_16px_#d1d9d6,_-8px_-8px_16px_#ffffff] duration-300 active:shadow-[inset_4px_4px_8px_#d1d9d6,_inset_-4px_-4px_8px_#ffffff] sm:active:shadow-[inset_8px_8px_16px_#d1d9d6,_inset_-8px_-8px_16px_#ffffff] touch-manipulation`}
              onClick={() => handleChnage("Register")}
            >
              Register
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-6 sm:py-8">
          <div className="flex flex-col items-center gap-2">
            <img
              src="/image-10.png"
              alt="Application logo"
              className="h-16 sm:h-20 w-fit"
            />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">Eye Q</h1>
          </div>
          <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#202020]">
              Create an account
            </h1>
            <p className="text-sm sm:text-base text-gray-400 px-4">
              Already have an account?{" "}
              <button
                className="cursor-pointer font-bold text-black hover:text-blue-400 transition-colors duration-200 touch-manipulation"
                onClick={() => {
                  naviagate("/login");
                }}
              >
                Log in
              </button>
            </p>
          </div>
          <div className="flex w-full items-center justify-between rounded-full bg-gray-100 p-1.5 sm:p-2">
            <button
              className={`w-[48%] rounded-full py-2 sm:py-2.5 px-3 sm:px-4 text-sm sm:text-base font-medium ${screen === "Login" ? "bg-yellow-400 text-gray-800" : "bg-gray-100 text-gray-600"} transition-all cursor-pointer shadow-[4px_4px_8px_#d1d9d6,_-4px_-4px_8px_#ffffff] sm:shadow-[8px_8px_16px_#d1d9d6,_-8px_-8px_16px_#ffffff] duration-300 active:shadow-[inset_4px_4px_8px_#d1d9d6,_inset_-4px_-4px_8px_#ffffff] sm:active:shadow-[inset_8px_8px_16px_#d1d9d6,_inset_-8px_-8px_16px_#ffffff] touch-manipulation`}
              onClick={() => handleChnage("Login")}
            >
              Login
            </button>
            <button
              className={`w-[48%] rounded-full py-2 sm:py-2.5 px-3 sm:px-4 text-sm sm:text-base font-medium ${screen === "Register" ? "bg-yellow-400 text-gray-800" : "bg-gray-100 text-gray-600"} transition-all cursor-pointer shadow-[4px_4px_8px_#d1d9d6,_-4px_-4px_8px_#ffffff] sm:shadow-[8px_8px_16px_#d1d9d6,_-8px_-8px_16px_#ffffff] duration-300 active:shadow-[inset_4px_4px_8px_#d1d9d6,_inset_-4px_-4px_8px_#ffffff] sm:active:shadow-[inset_8px_8px_16px_#d1d9d6,_inset_-8px_-8px_16px_#ffffff] touch-manipulation`}
              onClick={() => handleChnage("Register")}
            >
              Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;
