import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiFacebook } from "react-icons/fi";
import { auth } from "../firebase";
import { useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { userAPI } from "../utils/api";

const Option = ({error, setError}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          await handleUserRegistration(user);
          
          // Redirect to the page they were trying to access, or default to home
          const redirectTo = location.state?.from?.pathname || "/home";
          navigate(redirectTo, { replace: true });
        }
      } catch (err) {
        setError(err.message);
      }
    };
    
    handleRedirectResult();
  }, [navigate, setError, location]);

  const handleUserRegistration = async (user) => {
    // Check if user already exists in backend, create if not
    try {
      const existingUser = await userAPI.getUser(user.uid);
      
      if (!existingUser) {
        // User doesn't exist, create new user record
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          role: "teacher" // default role
        };
        
        await userAPI.createUser(userData);
      } else {
      }
    } catch (error) {
      console.error("Error handling user registration:", error);
      // Continue anyway, authentication was successful
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      
      try {
        // Try popup first
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await handleUserRegistration(user);
        
        // Redirect to the page they were trying to access, or default to home
        const redirectTo = location.state?.from?.pathname || "/home";
        navigate(redirectTo, { replace: true });
      } catch (popupError) {
        // If popup fails due to COOP or other issues, fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message.includes('Cross-Origin-Opener-Policy')) {
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <span className="h-px flex-1 bg-gray-300"></span>
        <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap px-2">or continue with</p>
        <span className="h-px flex-1 bg-gray-300"></span>
      </div>
      <div className="flex w-full">
        <button
          className="flex w-full cursor-pointer items-center justify-center gap-2 sm:gap-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 py-2.5 sm:py-3 px-4 text-sm sm:text-base font-medium transition-colors duration-200 touch-manipulation active:bg-gray-100"
          onClick={handleGoogleSignup}
        >
          <FcGoogle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          <span>Continue with Google</span>
        </button>
        {/* <button className="flex w-36 cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-2">
          <FiFacebook className="size-6" />
          Facebook
        </button> */}
      </div>
    </div>
  );
};
export default Option;
