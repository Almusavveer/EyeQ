import { useState } from "react";
import { FiEdit, FiCheck, FiX, FiFileText } from "react-icons/fi";

const ReviewStep = ({ examData, onNext, onPrev }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    examTitle: examData?.examTitle || "",
    examDuration: examData?.examDuration || "",
    examDate: examData?.examDate ? new Date(examData.examDate).toISOString().split('T')[0] : "",
    examTime: examData?.examDate ? new Date(examData.examDate).toTimeString().slice(0, 5) : ""
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // Combine date and time
    const updatedDate = new Date(`${editData.examDate}T${editData.examTime}:00`);
    
    const updatedExamData = {
      ...examData,
      examTitle: editData.examTitle,
      examDuration: editData.examDuration,
      examDate: updatedDate
    };
    
    setIsEditing(false);
    // Pass updated data to parent
    onNext(updatedExamData);
  };

  const handleCancelEdit = () => {
    // Reset to original data
    setEditData({
      examTitle: examData?.examTitle || "",
      examDuration: examData?.examDuration || "",
      examDate: examData?.examDate ? new Date(examData.examDate).toISOString().split('T')[0] : "",
      examTime: examData?.examDate ? new Date(examData.examDate).toTimeString().slice(0, 5) : ""
    });
    setIsEditing(false);
  };

  const handleContinue = () => {
    onNext(examData);
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="flex h-fit w-full flex-col justify-between gap-3 sm:gap-5 p-2 sm:p-0">
      {/* Exam Details Section */}
      <div className="mt-2 sm:mt-4 flex h-fit sm:h-22 w-full flex-col items-start justify-around gap-2">
        <h1 className="text-base sm:text-lg font-semibold">Review Your Exam</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Please review your exam details before publishing
        </p>
      </div>

      {/* Exam Details Form */}
      {isEditing ? (
        <div className="space-y-3 sm:space-y-5">
          <div className="flex h-fit sm:h-22 w-full flex-col items-start justify-around gap-2">
            <h1 className="text-base sm:text-lg font-semibold">Exam Title</h1>
            <input
              type="text"
              value={editData.examTitle}
              onChange={(e) => setEditData({ ...editData, examTitle: e.target.value })}
              className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-2 sm:p-3 text-sm sm:text-base outline-none"
            />
          </div>
          
          <div className="flex h-fit sm:h-22 w-full flex-col items-start justify-around gap-2">
            <h1 className="text-base sm:text-lg font-semibold">Exam Date</h1>
            <input
              type="date"
              value={editData.examDate}
              onChange={(e) => setEditData({ ...editData, examDate: e.target.value })}
              className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-2 sm:p-3 text-sm sm:text-base outline-none"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-end">
            <div className="flex-1">
              <h1 className="text-base sm:text-lg font-semibold mb-2">Exam Time</h1>
              <input
                type="time"
                value={editData.examTime}
                onChange={(e) => setEditData({ ...editData, examTime: e.target.value })}
                className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 sm:p-3 text-base sm:text-base outline-none focus:ring-2 focus:ring-yellow-200"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-base sm:text-lg font-semibold mb-2">Duration (minutes)</h1>
              <input
                type="number"
                value={editData.examDuration}
                onChange={(e) => setEditData({ ...editData, examDuration: e.target.value })}
                className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 sm:p-3 text-base sm:text-base outline-none focus:ring-2 focus:ring-yellow-200"
                placeholder="120"
                min="1"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveEdit}
              className="flex items-center justify-center gap-2 h-12 px-4 sm:px-6 cursor-pointer rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold transition-colors duration-200 touch-manipulation text-sm sm:text-base"
            >
              <FiCheck className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center justify-center gap-2 h-12 px-4 sm:px-6 cursor-pointer rounded-full bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-bold transition-colors duration-200 touch-manipulation text-sm sm:text-base"
            >
              <FiX className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-5">
          {/* Exam Title Display */}
          <div className="flex h-fit sm:h-22 w-full flex-col items-start justify-around gap-2">
            <h1 className="text-base sm:text-lg font-semibold">Exam Title</h1>
            <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-2 sm:p-3 bg-gray-50 text-sm sm:text-base break-words">
              {examData?.examTitle}
            </div>
          </div>
          
          {/* Exam Date Display */}
          <div className="flex h-fit sm:h-22 w-full flex-col items-start justify-around gap-2">
            <h1 className="text-base sm:text-lg font-semibold">Exam Date</h1>
            <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-2 sm:p-3 bg-gray-50 text-sm sm:text-base break-words">
              {(examData?.examDate || examData?.examTime) ? (() => {
                try {
                  const date = new Date(examData.examDate || examData.examTime);
                  return !isNaN(date.getTime()) ? date.toLocaleDateString() : "Not set";
                } catch {
                  return "Not set";
                }
              })() : "Not set"}
            </div>
          </div>

          {/* Exam Time and Duration Display */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-end">
            <div className="flex-1">
              <h1 className="text-base sm:text-lg font-semibold mb-2">Exam Time</h1>
              <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-2 sm:p-3 bg-gray-50 text-sm sm:text-base">
                {(examData?.examDate || examData?.examTime) ? (() => {
                  try {
                    const date = new Date(examData.examDate || examData.examTime);
                    return !isNaN(date.getTime()) ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Not set";
                  } catch {
                    return "Not set";
                  }
                })() : "Not set"}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-base sm:text-lg font-semibold mb-2">Duration (minutes)</h1>
              <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-2 sm:p-3 bg-gray-50 text-sm sm:text-base">
                {examData?.examDuration} min
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions Summary */}
      <div className="flex h-fit w-full flex-col items-start justify-around gap-2 sm:gap-3">
        <h1 className="text-base sm:text-lg font-semibold">Questions Summary</h1>
        
        {examData?.questions && examData.questions.length > 0 ? (
          <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-2 sm:p-3">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <FiFileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
              <span className="font-medium text-green-700 text-sm sm:text-base">
                {examData.questions.length} questions loaded successfully
              </span>
            </div>
            
            {examData.uploadedFileName && (
              <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 break-words">
                <span className="font-medium">Source file:</span> {examData.uploadedFileName}
              </div>
            )}

            <div className="max-h-32 sm:max-h-40 overflow-y-auto rounded bg-gray-50 p-2 sm:p-3">
              <h4 className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">Question Preview:</h4>
              <div className="space-y-1 sm:space-y-2">
                {examData.questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="text-xs sm:text-sm">
                    <span className="font-medium text-gray-600">Q{index + 1}:</span>
                    <span className="ml-2 text-gray-700 break-words">
                      {question.question?.length > 60
                        ? `${question.question.substring(0, 60)}...`
                        : question.question}
                    </span>
                  </div>
                ))}
                {examData.questions.length > 3 && (
                  <div className="text-xs sm:text-sm text-gray-500">
                    ... and {examData.questions.length - 3} more questions
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-2 sm:p-3 bg-amber-50">
            <div className="flex items-center gap-2 text-amber-600">
              <FiFileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">No questions loaded. You can add questions manually later.</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
        <button
          onClick={onPrev}
          className="hidden sm:flex flex-1 h-12 sm:h-14 cursor-pointer rounded-full border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 touch-manipulation text-base sm:text-lg items-center justify-center"
        >
          Back to Form
        </button>
        <button
          onClick={handleContinue}
          disabled={isEditing}
          className="flex flex-1 h-12 sm:h-14 items-center justify-center cursor-pointer rounded-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 py-2 text-base sm:text-lg font-bold transition-colors duration-200 disabled:opacity-50 touch-manipulation"
        >
          Continue to Publish
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;