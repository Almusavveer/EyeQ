import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { useNavigate, useParams, useLocation } from "react-router";
import { useAuthState } from "react-firebase-hooks/auth";
import { FiLoader } from "react-icons/fi";

const Review = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isNewExam, setIsNewExam] = useState(false);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDuration, setEditDuration] = useState("");

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // Check if we have new exam data from navigation state
        if (
          location.state &&
          location.state.examData &&
          location.state.isNewExam
        ) {
          const newExamData = location.state.examData;
          setIsNewExam(true);
          setExamData(newExamData);

          // Set edit form data for new exam
          setEditTitle(newExamData.examTitle || "");
          setEditDuration(newExamData.examDuration || "");

          // Format date and time for inputs
          if (newExamData.examDate) {
            const examDate = new Date(newExamData.examDate);
            setEditDate(examDate.toISOString().split("T")[0]);
            setEditTime(examDate.toTimeString().slice(0, 5));
          }

          console.log("Loaded new exam data for review:", newExamData);
        }
        // Otherwise, fetch existing exam data from Firebase
        else if (examId) {
          await fetchExistingExamData();
        } else {
          setError("No exam data provided");
        }
      } catch (err) {
        console.error("Error initializing data:", err);
        setError("Failed to load exam data");
      } finally {
        setLoading(false);
      }
    };

    const fetchExistingExamData = async () => {
      const examRef = doc(db, "examDetails", examId);
      const examSnap = await getDoc(examRef);

      if (examSnap.exists()) {
        const data = { id: examSnap.id, ...examSnap.data() };
        setExamData(data);
        setIsNewExam(false);

        // Set edit form data for existing exam
        setEditTitle(data.examTitle || "");
        setEditDuration(data.examDuration || "");

        // Format date and time for inputs
        const examTimestamp = data.examDate || data.examTime;
        if (examTimestamp) {
          const examDate = examTimestamp.toDate();
          setEditDate(examDate.toISOString().split("T")[0]);
          setEditTime(examDate.toTimeString().slice(0, 5));
        }
      } else {
        setError("Exam not found");
      }
    };

    initializeData();
  }, [examId, location.state]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Not set";

    let date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePublishExam = async () => {
    try {
      setSaving(true);

      // Validation
      if (!editTitle.trim()) {
        alert("Exam title is required");
        setSaving(false);
        return;
      }
      if (!editDate || !editTime) {
        alert("Exam date and time are required");
        setSaving(false);
        return;
      }
      if (!editDuration || isNaN(editDuration) || editDuration <= 0) {
        alert("Valid exam duration is required");
        setSaving(false);
        return;
      }

      const finalDate = new Date(`${editDate}T${editTime}:00`);
      const examDateTs = Timestamp.fromDate(finalDate);

      if (isNewExam) {
        // Create new exam in Firebase
        const examDocData = {
          examTitle: editTitle.trim(),
          examDate: examDateTs,
          examDuration: editDuration,
          createdBy: examData.createdBy,
          creatorEmail: examData.creatorEmail,
          createdAt: Timestamp.now(),
          published: true,
          publishedAt: Timestamp.now(),
        };

        // Include questions and related data if available
        if (examData.questions && examData.questions.length > 0) {
          examDocData.questions = examData.questions;
          examDocData.hasQuestions = true;
          examDocData.questionCount = examData.questions.length;
          examDocData.uploadedFileName = examData.uploadedFileName || "";
          
          console.log("Saving questions to database:", {
            count: examData.questions.length,
            fileName: examData.uploadedFileName,
            sampleQuestion: examData.questions[0]?.question
          });
        } else {
          examDocData.hasQuestions = false;
          examDocData.questionCount = 0;
          console.log("No questions to save - creating exam without questions");
        }

        const docRef = await addDoc(collection(db, "examDetails"), examDocData);

        console.log("New exam created and published with ID:", docRef.id);
        console.log("Questions saved:", examData.questions ? examData.questions.length : 0);
        
        // Show success message
        const questionCount = examData.questions ? examData.questions.length : 0;
        if (questionCount > 0) {
          alert(`Exam published successfully with ${questionCount} questions!`);
        } else {
          alert("Exam published successfully!");
        }
      } else {
        // Update existing exam in Firebase
        const examRef = doc(db, "examDetails", examId);
        const updateData = {
          examTitle: editTitle.trim(),
          examDate: examDateTs,
          examDuration: editDuration,
          updatedAt: Timestamp.now(),
          published: true,
          publishedAt: Timestamp.now(),
        };

        // Include questions if available from form data
        if (examData.questions && examData.questions.length > 0) {
          updateData.questions = examData.questions;
          updateData.hasQuestions = true;
          updateData.questionCount = examData.questions.length;
          updateData.uploadedFileName = examData.uploadedFileName || "";
        }

        await updateDoc(examRef, updateData);

        console.log("Existing exam updated and published successfully");
        console.log("Questions updated:", examData.questions ? examData.questions.length : 0);
        
        // Show success message
        const questionCount = examData.questions ? examData.questions.length : 0;
        if (questionCount > 0) {
          alert(`Exam updated successfully with ${questionCount} questions!`);
        } else {
          alert("Exam updated successfully!");
        }
      }

      navigate("/home");
    } catch (error) {
      console.error("Error publishing exam:", error.message);
      setError("Failed to publish exam");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FiLoader className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading exam data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => navigate("/home")}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No exam data found</p>
      </div>
    );
  }

  return (
    <div className="flex h-fit w-full flex-col justify-between gap-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-center text-2xl font-semibold">Review Your Exam</h2>
      </div>

      {/* Always Editable Form */}
      <div className="space-y-6">
        <div className="flex h-22 w-full flex-col items-start justify-around">
          <h3 className="text-lg font-semibold">Exam Title</h3>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
            placeholder="Enter exam title"
          />
        </div>

        <div className="flex h-fit sm:h-22 w-full flex-col items-start justify-around gap-2">
          <h3 className="text-base sm:text-lg font-semibold">Exam Date</h3>
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-2 sm:p-3 text-sm sm:text-base outline-none"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-end">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Exam Time</h3>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 sm:p-3 text-base sm:text-base outline-none focus:ring-2 focus:ring-yellow-200"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Duration (minutes)</h3>
            <input
              type="number"
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
              className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 sm:p-3 text-base sm:text-base outline-none focus:ring-2 focus:ring-yellow-200"
              placeholder="120"
              min="1"
            />
          </div>
        </div>

        {/* Questions Summary */}
        {examData.questions && examData.questions.length > 0 && (
          <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">📋 Questions Summary</h3>
            <div className="space-y-2 text-sm text-green-700">
              <p><strong>Questions extracted:</strong> {examData.questions.length}</p>
              {examData.uploadedFileName && (
                <p><strong>Source file:</strong> {examData.uploadedFileName}</p>
              )}
              <div className="mt-3">
                <p className="font-medium mb-1">Question preview:</p>
                <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                  {examData.questions.slice(0, 5).map((question, index) => (
                    <div key={index} className="p-2 bg-white rounded border">
                      <strong>Q{index + 1}:</strong> {question.question}
                      {question.options && question.options.length > 0 && (
                        <div className="ml-4 mt-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="text-gray-600">
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {examData.questions.length > 5 && (
                    <div className="text-center text-green-600 font-medium">
                      ...and {examData.questions.length - 5} more questions
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!examData.hasQuestions && (
          <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ No Questions</h3>
            <p className="text-sm text-yellow-700">
              This exam will be created without any questions. You can add questions later by editing the exam.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handlePublishExam}
            disabled={saving}
            className="h-12 w-full cursor-pointer rounded-full bg-yellow-400 py-2 text-lg font-bold transition-colors duration-200 hover:bg-yellow-500 disabled:opacity-50"
          >
            {saving
              ? "Publishing..."
              : isNewExam
                ? "Save & Publish Exam"
                : "Publish Exam"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;
