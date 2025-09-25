import { useState } from "react";
import { useNavigate } from "react-router";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDoc, collection } from "firebase/firestore";
import { FiLoader, FiCheck, FiShare2, FiEye } from "react-icons/fi";

const PublishStep = ({ examData, onPrev }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [examLink, setExamLink] = useState("");
  
  // Publish settings - automatically applied (no UI)
  const isPublic = true; // Always public
  const allowAnonymous = false; // Never allow anonymous access
  const shuffleQuestions = true; // Always shuffle questions

  const handlePublish = async () => {
    if (!user || !examData) {
      alert("Missing user or exam data");
      return;
    }

    setPublishing(true);
    
    try {
      // Add publish settings to exam data
      const publishData = {
        ...examData,
        isPublic,
        allowAnonymous,
        shuffleQuestions,
        status: "published",
        publishedAt: new Date(),
        createdAt: new Date(),
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, "examDetails"), publishData);
      
      // Generate shareable link
      const baseUrl = window.location.origin;
      const shareableLink = `${baseUrl}/exam/${docRef.id}`;
      
      setExamLink(shareableLink);
      setPublished(true);
      
      console.log("✅ Exam published successfully with ID:", docRef.id);
      
    } catch (error) {
      console.error("❌ Error publishing exam:", error);
      alert("Error publishing exam. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(examLink);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = examLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Link copied to clipboard!");
    }
  };

  const handleGoHome = () => {
    navigate("/home");
  };

  if (published) {
    return (
      <div className="flex h-fit w-full flex-col items-center gap-4 p-2 sm:p-4 text-center">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-green-50 border border-r-2 border-b-2 border-l-2 border-green-300 border-r-green-400 border-b-green-400 border-l-green-400">
            <FiCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 text-center">Exam Published Successfully! 🎉</h2>
          <p className="text-center text-sm sm:text-base text-gray-600 px-2">
            Your exam "<span className="break-words font-medium">{examData?.examTitle}</span>" is now live and ready for students.
          </p>
        </div>

        <div className="w-full space-y-3 sm:space-y-4">
          <div className="flex h-fit w-full flex-col items-start justify-around gap-2">
            <h1 className="text-base sm:text-lg font-semibold">Shareable Link</h1>
            <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 text-sm sm:text-base outline-none">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={examLink}
                  readOnly
                  className="flex-1 rounded-xl border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm break-all focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-blue-600 transition-colors text-xs sm:text-sm touch-manipulation"
                >
                  <FiShare2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
          <button
            onClick={handleGoHome}
            className="flex-1 h-12 sm:h-14 cursor-pointer rounded-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 py-2 text-base sm:text-lg font-bold transition-colors touch-manipulation"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.open(examLink, '_blank')}
            className="flex items-center justify-center gap-2 h-12 sm:h-14 cursor-pointer rounded-full bg-green-500 px-4 sm:px-6 py-2 text-base sm:text-lg font-bold text-white hover:bg-green-600 active:bg-green-700 transition-colors touch-manipulation"
          >
            <FiEye className="h-3 w-3 sm:h-4 sm:w-4" />
            Preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-fit w-full flex-col justify-between gap-3 sm:gap-5 p-2 sm:p-0">
      <div className="text-center">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Publish Your Exam</h2>
        <p className="mt-1 text-sm sm:text-base text-gray-600">
          Your exam is ready! Click publish to make it available to students
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Exam Summary */}
        <div className="flex h-fit w-full flex-col items-start justify-around gap-2">
          <h1 className="text-base sm:text-lg font-semibold">Exam Summary</h1>
          <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 text-sm sm:text-base outline-none">
            <div className="space-y-2">
              <p><strong>Title:</strong> <span className="break-words">{examData?.examTitle}</span></p>
              <p><strong>Date:</strong> {examData?.examDate ? new Date(examData.examDate).toLocaleDateString() : "Not set"}</p>
              <p><strong>Duration:</strong> {examData?.examDuration} minutes</p>
              <p><strong>Questions:</strong> {examData?.questions?.length || 0} questions loaded</p>
              {examData?.uploadedFileName && (
                <p><strong>Source:</strong> <span className="break-words">{examData.uploadedFileName}</span></p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
        <button
          onClick={onPrev}
          disabled={publishing}
          className="hidden sm:flex flex-1 h-12 sm:h-14 cursor-pointer rounded-full border-2 border-gray-300 py-2 text-base sm:text-lg font-bold hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 touch-manipulation items-center justify-center"
        >
          Back to Review
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex flex-1 h-12 sm:h-14 items-center justify-center gap-2 cursor-pointer rounded-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 py-2 text-base sm:text-lg font-bold transition-colors disabled:opacity-50 touch-manipulation"
        >
          {publishing ? (
            <>
              <FiLoader className="h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish Exam"
          )}
        </button>
      </div>
    </div>
  );
};

export default PublishStep;