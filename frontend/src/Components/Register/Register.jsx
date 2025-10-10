import RegisterFom from "../../UI/RegisterForm"
import Option from "../../UI/Option"
import { useState, useEffect } from "react";
import Welcome from "../../UI/Welcome";
import { useNavigate } from "react-router";
import { useAuth } from "../../Context/AuthContext";

const Register = () => {
  const [error, setError] = useState();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users away from register page
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

  // Don't render register form if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8">
        <Welcome />
        <RegisterFom error={error} setError={setError}/>
        <Option error={error} setError={setError}/>
      </div>
    </div>
  )
}
export default Register
