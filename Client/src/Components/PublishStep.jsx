import { useState } from "react";
import { useNavigate } from "react-router";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDoc, collection } from "firebase/firestore";
import { FiLoader, FiCheck, FiShare2, FiEye, FiLock, FiUnlock } from "react-icons/fi";

const PublishStep = ({ examData, onPrev }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [examLink, setExamLink] = useState("");
  
  // Publish settings
  const [isPublic, setIsPublic] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [enableTimer, setEnableTimer] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showResults, setShowResults] = useState(true);

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
        enableTimer,
        shuffleQuestions,
        showResults,
        status: "published",
        publishedAt: new Date(),
        createdAt: new Date(),
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, "exams"), publishData);
      
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
      <div className="flex w-full flex-col items-center gap-4 sm:gap-6 rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-lg">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-100">
            <FiCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 text-center">Exam Published Successfully! 🎉</h2>
          <p className="text-center text-sm sm:text-base text-gray-600 px-2">
            Your exam "{examData?.examTitle}" is now live and ready for students.
          </p>
        </div>

        <div className="w-full space-y-3 sm:space-y-4">
          <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
            <h3 className="mb-2 font-semibold text-sm sm:text-base text-gray-700">Shareable Link</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={examLink}
                readOnly
                className="flex-1 rounded-lg border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm break-all"
              />
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-blue-600 transition-colors text-xs sm:text-sm touch-manipulation"
              >
                <FiShare2 className="h-3 w-3 sm:h-4 sm:w-4" />
                Copy
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
            <h3 className="mb-2 font-semibold text-sm sm:text-base text-gray-700">Exam Details</h3>
            <div className="space-y-1 text-xs sm:text-sm text-gray-600">
              <p><strong>Title:</strong> <span className="break-words">{examData?.examTitle}</span></p>
              <p><strong>Duration:</strong> {examData?.examDuration} minutes</p>
              <p><strong>Questions:</strong> {examData?.questions?.length || 0}</p>
              <p><strong>Access:</strong> {isPublic ? "Public" : "Private"}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
          <button
            onClick={handleGoHome}
            className="flex-1 rounded-full bg-yellow-400 py-3 font-semibold text-black hover:bg-yellow-500 active:bg-yellow-600 transition-colors touch-manipulation text-sm sm:text-base"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.open(examLink, '_blank')}
            className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-4 sm:px-6 py-3 font-semibold text-white hover:bg-green-600 active:bg-green-700 transition-colors touch-manipulation text-sm sm:text-base"
          >
            <FiEye className="h-3 w-3 sm:h-4 sm:w-4" />
            Preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-6 rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-lg">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Publish Your Exam</h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Configure your exam settings and make it available to students
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Exam Summary */}
        <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
          <h3 className="mb-2 sm:mb-3 font-semibold text-sm sm:text-base text-gray-700">Exam Summary</h3>
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <p><strong>Title:</strong> <span className="break-words">{examData?.examTitle}</span></p>
            <p><strong>Date:</strong> {examData?.examDate ? new Date(examData.examDate).toLocaleDateString() : "Not set"}</p>
            <p><strong>Duration:</strong> {examData?.examDuration} minutes</p>
            <p><strong>Questions:</strong> {examData?.questions?.length || 0} questions loaded</p>
            {examData?.uploadedFileName && (
              <p><strong>Source:</strong> <span className="break-words">{examData.uploadedFileName}</span></p>
            )}
          </div>
        </div>

        {/* Publish Settings */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-base text-gray-700">Publish Settings</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                {isPublic ? <FiUnlock className="h-3 w-3 sm:h-4 sm:w-4" /> : <FiLock className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="font-medium text-sm sm:text-base">Access Level</span>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-xs sm:text-sm">{isPublic ? "Public" : "Private"}</span>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-sm sm:text-base">Allow Anonymous Access</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowAnonymous}
                  onChange={(e) => setAllowAnonymous(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-xs sm:text-sm">{allowAnonymous ? "Yes" : "No"}</span>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-sm sm:text-base">Enable Timer</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={enableTimer}
                  onChange={(e) => setEnableTimer(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-xs sm:text-sm">{enableTimer ? "Yes" : "No"}</span>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-sm sm:text-base">Shuffle Questions</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-xs sm:text-sm">{shuffleQuestions ? "Yes" : "No"}</span>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-sm sm:text-base">Show Results After Completion</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showResults}
                  onChange={(e) => setShowResults(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-xs sm:text-sm">{showResults ? "Yes" : "No"}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
        <button
          onClick={onPrev}
          disabled={publishing}
          className="flex-1 rounded-full border-2 border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 touch-manipulation text-sm sm:text-base"
        >
          Back to Review
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-yellow-400 py-3 font-semibold text-black hover:bg-yellow-500 active:bg-yellow-600 transition-colors disabled:opacity-50 touch-manipulation text-sm sm:text-base"
        >
          {publishing ? (
            <>
              <FiLoader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
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