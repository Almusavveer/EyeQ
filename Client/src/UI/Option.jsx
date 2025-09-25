import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiFacebook } from "react-icons/fi";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router";
import { useEffect } from "react";

const Option = ({error, setError}) => {
  const navigate = useNavigate()
  
  // Check for redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          await handleUserRegistration(user);
          navigate("/home");
        }
      } catch (err) {
        setError(err.message);
      }
    };
    
    handleRedirectResult();
  }, [navigate, setError]);

  const handleUserRegistration = async (user) => {
    // Check if Firestore doc already exists
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: "teacher", // default role
        createdAt: serverTimestamp(),
      });
      console.log("Signup with google");
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
        navigate("/home");
      } catch (popupError) {
        // If popup fails due to COOP or other issues, fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message.includes('Cross-Origin-Opener-Policy')) {
          console.log("Popup blocked, using redirect method");
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
