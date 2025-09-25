import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router";
import { useAuthState } from "react-firebase-hooks/auth";
import PdfUpload from "../Components/PdfUpload";

const ExamBuilderForm = ({ onNext }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("01:30");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  // Handle authentication redirect in useEffect to avoid setState during render
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) return <div>Loading...</div>;
  
  // Don't render the form if user is not authenticated
  if (!user) return null;

  // Callback handlers for PdfUpload component
  const handleQuestionsExtracted = (extractedQuestions, fileName) => {
    setQuestions(extractedQuestions);
    setUploadedFileName(fileName);
    console.log('✅ Questions received in form:', extractedQuestions.length);
  };

  const handleUploadStart = (file) => {
    console.log('� Upload started:', file.name);
    // Reset previous questions when starting new upload
    setQuestions([]);
    setUploadedFileName("");
  };

  const handleUploadError = (errorMessage) => {
    console.error('❌ Upload error:', errorMessage);
    // Could show a toast notification here
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      console.error("User must be authenticated to create exams");
      return;
    }
    
    // Validation
    if (!title.trim()) {
      alert("Exam title is required");
      return;
    }
    if (!date || !time) {
      alert("Exam date and time are required");
      return;
    }
    if (!duration || isNaN(duration) || duration <= 0) {
      alert("Valid exam duration is required");
      return;
    }
    
    try {
      // Prepare exam data
      const finalDate = new Date(`${date}T${time}:00`);
      
      const examData = {
        examTitle: title.trim(),
        examDate: finalDate,
        examDuration: duration,
        createdBy: user.uid,
        creatorEmail: user.email,
        questions: questions, // Include extracted questions
        hasQuestions: questions.length > 0,
        uploadedFileName: uploadedFileName
      };

      console.log("Moving to review step with exam data:", examData);
      
      // Move to next step instead of navigating to review page
      onNext(examData);
    } catch (error) {
      console.error("Error preparing exam data:", error.message);
    }
  };

  return (
    <form
      className="flex h-fit w-full flex-col justify-between gap-5"
      onSubmit={handleSubmit}
    >
      <div className="mt-4 flex h-22 w-full flex-col items-start justify-around">
        <h1 className="text-lg font-semibold">Exam Title</h1>
        <input
          type="text"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
          className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
          placeholder="Maths test"
        />
      </div>
      <div className="flex h-22 w-full flex-col items-start justify-around">
        <h1 className="text-lg font-semibold">Exam Date</h1>
        <input
          type="date"
          value={date}
          onChange={({ target }) => setDate(target.value)}
          className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
        />
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex h-22 w-44 flex-col items-start justify-around">
          <h1 className="text-lg font-semibold">Exam Time</h1>
          <input
            type="time"
            value={time}
            onChange={({ target }) => setTime(target.value)}
            className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
          />
        </div>
        <div className="flex h-22 w-36 flex-col items-start justify-around">
          <h1 className="text-lg font-semibold">Exam Duration</h1>
          <input
            type="text"
            value={duration}
            onChange={({ target }) => setDuration(target.value)}
            className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
            placeholder="120 min"
          />
        </div>
      </div>

      <PdfUpload
        onQuestionsExtracted={handleQuestionsExtracted}
        onUploadStart={handleUploadStart}
        onUploadError={handleUploadError}
        maxSizeMB={10}
        className="w-full"
      />

      <button
        type="submit"
        className="h-12 w-full cursor-pointer rounded-full bg-yellow-400 hover:bg-yellow-500 py-2 text-lg font-bold transition-colors duration-200"
      >
        Save & Continue
      </button>
    </form>
  );
};

export default ExamBuilderForm;