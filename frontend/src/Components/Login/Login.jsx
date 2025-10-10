import { useState, useEffect } from "react";
import LoginFom from "../../UI/LoginFom";
import Option from "../../UI/Option";
import Welcome from "../../UI/Welcome";
import { useNavigate } from "react-router";
import { useAuth } from "../../Context/AuthContext";

const Login = () => {
  const [error, setError] = useState();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render login form if user is authenticated
  if (user) {
    return null;
  }

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
              navigate("/register");
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
