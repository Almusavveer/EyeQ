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
    <div className="flex h-28 flex-col justify-around">
      <div className="flex items-center justify-between">
        <span className="h-0 w-27 border border-gray-300"></span>
        <p>or continue with</p>
        <span className="h-0 w-27 border border-gray-300"></span>
      </div>
      <div className="mx-auto flex w-full items-center justify-between">
        <button
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-2"
          onClick={handleGoogleSignup}
        >
          <FcGoogle className="size-6" />
          Google
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
