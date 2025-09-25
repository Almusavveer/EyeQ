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
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <FiCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Exam Published Successfully! 🎉</h2>
          <p className="text-center text-gray-600">
            Your exam "{examData?.examTitle}" is now live and ready for students.
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-700">Shareable Link</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={examLink}
                readOnly
                className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
              >
                <FiShare2 className="h-4 w-4" />
                Copy
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-700">Exam Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Title:</strong> {examData?.examTitle}</p>
              <p><strong>Duration:</strong> {examData?.examDuration} minutes</p>
              <p><strong>Questions:</strong> {examData?.questions?.length || 0}</p>
              <p><strong>Access:</strong> {isPublic ? "Public" : "Private"}</p>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-4">
          <button
            onClick={handleGoHome}
            className="flex-1 rounded-full bg-yellow-400 py-3 font-semibold text-black hover:bg-yellow-500 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.open(examLink, '_blank')}
            className="flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600 transition-colors"
          >
            <FiEye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6 rounded-2xl bg-white p-8 shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Publish Your Exam</h2>
        <p className="mt-2 text-gray-600">
          Configure your exam settings and make it available to students
        </p>
      </div>

      <div className="space-y-6">
        {/* Exam Summary */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="mb-3 font-semibold text-gray-700">Exam Summary</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Title:</strong> {examData?.examTitle}</p>
            <p><strong>Date:</strong> {examData?.examDate ? new Date(examData.examDate).toLocaleDateString() : "Not set"}</p>
            <p><strong>Duration:</strong> {examData?.examDuration} minutes</p>
            <p><strong>Questions:</strong> {examData?.questions?.length || 0} questions loaded</p>
            {examData?.uploadedFileName && (
              <p><strong>Source:</strong> {examData.uploadedFileName}</p>
            )}
          </div>
        </div>

        {/* Publish Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Publish Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPublic ? <FiUnlock className="h-4 w-4" /> : <FiLock className="h-4 w-4" />}
                <span className="font-medium">Access Level</span>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{isPublic ? "Public" : "Private"}</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Allow Anonymous Access</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowAnonymous}
                  onChange={(e) => setAllowAnonymous(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{allowAnonymous ? "Yes" : "No"}</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Enable Timer</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={enableTimer}
                  onChange={(e) => setEnableTimer(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{enableTimer ? "Yes" : "No"}</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Shuffle Questions</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{shuffleQuestions ? "Yes" : "No"}</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Show Results After Completion</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showResults}
                  onChange={(e) => setShowResults(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{showResults ? "Yes" : "No"}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full gap-4">
        <button
          onClick={onPrev}
          disabled={publishing}
          className="flex-1 rounded-full border-2 border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back to Review
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-yellow-400 py-3 font-semibold text-black hover:bg-yellow-500 transition-colors disabled:opacity-50"
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