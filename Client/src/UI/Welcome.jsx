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
    <div>
      {screen === "Login" ? (
        <div className="flex h-64 w-full flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <img
              src="/image-10.png"
              alt="Application logo"
              className="h-20 w-fit"
            />
            <h1 className="text-xl font-bold text-blue-400">Eye Q</h1>
          </div>
          <h1 className="text-xl font-bold text-[#202020]">Welcome Back !</h1>
          <div className="flex w-full items-center justify-between rounded-full bg-gray-100 p-2">
            <button
              className={`w-[48%] rounded-full p-2 ${screen === "Login" ? "bg-yellow-400" : "bg-gray-100"} tansition-all cursor-pointer shadow-[8px_8px_16px_#d1d9d6,_-8px_-8px_16px_#ffffff] duration-300 active:shadow-[inset_8px_8px_16px_#d1d9d6,_inset-8px_-8px_16px_#ffffff]`}
              onClick={() => handleChnage("Login")}
            >
              Login
            </button>
            <button
              className={`w-[48%] rounded-full p-2 ${screen === "Register" ? "bg-yellow-400" : "bg-gray-100"} tansition-all cursor-pointer shadow-[8px_8px_16px_#d1d9d6,_-8px_-8px_16px_#ffffff] duration-300 active:shadow-[inset_8px_8px_16px_#d1d9d6,_inset-8px_-8px_16px_#ffffff]`}
              onClick={() => handleChnage("Register")}
            >
              Register
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-72 w-full flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <img
              src="/image-10.png"
              alt="Application logo"
              className="h-20 w-fit"
            />
            <h1 className="text-xl font-bold text-blue-400">Eye Q</h1>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-bold text-[#202020]">
              Create an account
            </h1>
            <p className="w-full text-center text-gray-400">
              Already have an account?{" "}
              <button
                className="cursor-pointer font-bold text-black"
                onClick={() => {
                  naviagate("/login");
                }}
              >
                Log in
              </button>
            </p>
          </div>
          <div className="flex w-full items-center justify-between rounded-full bg-gray-100 p-2">
            <button
              className={`w-[48%] rounded-full p-2 ${screen === "Login" ? "bg-yellow-400" : "bg-gray-100"} tansition-all cursor-pointer shadow-[8px_8px_16px_#d1d9d6,_-8px_-8px_16px_#ffffff] duration-300 active:shadow-[inset_8px_8px_16px_#d1d9d6,_inset-8px_-8px_16px_#ffffff]`}
              onClick={() => handleChnage("Login")}
            >
              Login
            </button>
            <button
              className={`w-[48%] rounded-full p-2 ${screen === "Register" ? "bg-yellow-400" : "tansition-all cursor-pointer bg-gray-100 shadow-[8px_8px_16px_#d1d9d6,_-8px_-8px_16px_#ffffff] duration-300 active:shadow-[inset_8px_8px_16px_#d1d9d6,_inset-8px_-8px_16px_#ffffff]"}`}
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
