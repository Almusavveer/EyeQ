import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router";
import PasswordReset from "../Components/PasswordReset";

const LoginFom = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home", { replace: true });
    } catch (error) {
      setError(
        "We couldn’t find an account with that email. Want to sign up instead?",
      );
    }
  };
  return (
    <div className="w-full max-w-md mx-auto">
      <form
        action=""
        className="flex flex-col gap-4 sm:gap-6"
        onSubmit={handleSubmit}
      >
        <label htmlFor="email" className="flex flex-col gap-2">
          <span className="text-sm sm:text-base font-medium text-gray-700">Email</span>
          <input
            type="email"
            id="email"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            className="w-full rounded-full border border-gray-200 bg-[#fbfbfb] px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all duration-200"
            placeholder="jon@gmail.com"
          />
        </label>
        <label htmlFor="password" className="flex flex-col gap-2">
          <span className="text-sm sm:text-base font-medium text-gray-700">Password</span>
          <div className="flex w-full items-center justify-between rounded-full border border-gray-200 bg-[#fbfbfb] px-4 py-2.5 sm:py-3 outline-none focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-100 transition-all duration-200">
            <input
              type={show ? "text" : "password"}
              id="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              className="flex-1 bg-transparent outline-none text-sm sm:text-base"
              placeholder="••••••••"
            />
            {show ? (
              <FiEye
                className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200 touch-manipulation"
                onClick={() => setShow(!show)}
              />
            ) : (
              <FiEyeOff
                className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200 touch-manipulation"
                onClick={() => setShow(!show)}
              />
            )}
          </div>
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer touch-manipulation">
            <input type="checkbox" name="" id="remember" className="w-4 h-4" /> 
            <span className="text-sm text-gray-600">Remember Me</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPasswordReset(true)}
            className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 touch-manipulation"
          >
            Forgot Password?
          </button>
        </div>
        <button 
          type="submit"
          className="w-full cursor-pointer rounded-full bg-yellow-400 hover:bg-yellow-500 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-800 transition-colors duration-200 touch-manipulation active:bg-yellow-600"
        >
          Submit
        </button>
      </form>
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm sm:text-base">{error}</p>
        </div>
      )}
      
      {showPasswordReset && (
        <PasswordReset
          email={email}
          onClose={() => setShowPasswordReset(false)}
        />
      )}
    </div>
  );
};
export default LoginFom;
