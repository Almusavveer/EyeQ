import { useState } from "react";
import LoginFom from "../../UI/LoginFom";
import Option from "../../UI/Option";
import Welcome from "../../UI/Welcome";
import { useNavigate } from "react-router";

const Login = () => {
  const [error, setError] = useState();
  const naviagate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8">
        <Welcome />
        <LoginFom />
        <Option error={error} setError={setError} />
        <p className="w-full text-center text-xs sm:text-sm text-gray-400 px-4">
          Don't have an account?{" "}
          <button
            className="cursor-pointer font-bold text-black hover:text-blue-400 transition-colors duration-200 touch-manipulation"
            onClick={() => {
              naviagate("/register");
            }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
