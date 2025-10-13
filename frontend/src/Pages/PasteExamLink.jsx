import { useState } from "react";
import { useNavigate } from "react-router";

const PasteExamLink = () => {
  const [examLink, setExamLink] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateExamLink = (link) => {
    if (!link.trim()) {
      return { isValid: false, error: "Please enter an exam link" };
    }

    try {
      const url = new URL(link);
      const currentOrigin = window.location.origin;

      // Check if the URL is from the same origin
      if (url.origin !== currentOrigin) {
        return { isValid: false, error: "Invalid exam link. Please use a link from this platform." };
      }

      // Check if the URL follows the expected pattern: /exam/{examId}
      const pathParts = url.pathname.split('/').filter(part => part);
      if (pathParts.length !== 2 || pathParts[0] !== 'exam') {
        return { isValid: false, error: "Invalid exam link format. Please contact your teacher for the correct link." };
      }

      const examId = pathParts[1];
      if (!examId || examId.length < 10) { // Firestore IDs are typically longer
        return { isValid: false, error: "Invalid exam link. Please contact your teacher for the correct link." };
      }

      return { isValid: true, examId };
    } catch {
      return { isValid: false, error: "Invalid URL format. Please paste a valid exam link." };
    }
  };

  const handleStart = () => {
    setError("");

    const validation = validateExamLink(examLink);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    // Navigate to exam with the validated exam ID
    navigate(`/exam/${validation.examId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Enter Exam Link</h2>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Paste your exam link here"
          value={examLink}
          onChange={e => setExamLink(e.target.value)}
        />
        {error && (
          <div className="w-full text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </div>
        )}
        <button
          className="w-full bg-[#FBC02D] text-white font-semibold py-2 rounded-lg hover:bg-[#F9A825] transition"
          onClick={handleStart}
          disabled={!examLink.trim()}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
};

export default PasteExamLink;