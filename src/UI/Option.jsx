import { signInWithPopup } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiFacebook } from "react-icons/fi";
import { auth, db } from "../firebase";

const Option = ({error, setError}) => {
  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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
      console.log("logged in");
      
      // navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="flex h-28 flex-col justify-around">
      <div className="flex items-center justify-between">
        <span className="h-0 w-30 border border-gray-300"></span>
        <p>or continue with</p>
        <span className="h-0 w-30 border border-gray-300"></span>
      </div>
      <div className="mx-auto flex w-72 items-center justify-between">
        <button
          className="flex w-30 cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-2"
          onClick={handleGoogleSignup}
        >
          <FcGoogle className="size-6" />
          Google
        </button>
        <button className="flex w-36 cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-2">
          <FiFacebook className="size-6" />
          Facebook
        </button>
      </div>
    </div>
  );
};
export default Option;
