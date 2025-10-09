import { FiSettings, FiUser, FiLogOut } from "react-icons/fi";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { clearNavigationHistory } from "../../utils/navigationGuard";

const Nav = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      
      // Clear navigation history to prevent back button access
      clearNavigationHistory();
      
      // Navigate to login with replace to prevent back navigation
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-fit w-full items-center justify-end gap-2 sm:gap-2.5 p-1 sm:p-0">
      <div className="relative" ref={dropdownRef}>
        <button 
          className="size-8 sm:size-10 flex justify-center items-center cursor-pointer rounded-full bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500 p-1 sm:p-2 text-center transition-colors duration-200 touch-manipulation"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <FiUser className="size-4 sm:size-5"/>
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <FiLogOut className="size-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
      {/* <button className="size-8 sm:size-10 flex justify-center items-center cursor-pointer rounded-full bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500 p-1 sm:p-2 text-center transition-colors duration-200 touch-manipulation">
        <FiSettings className="size-4 sm:size-5"/>
      </button> */}
    </div>
  );
};
export default Nav;
