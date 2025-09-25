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
    <div className="flex h-fit w-full flex-col justify-between gap-5">
      {/* Exam Details Section */}
      <div className="mt-4 flex h-22 w-full flex-col items-start justify-around">
        <h1 className="text-lg font-semibold">Review Your Exam</h1>
        <p className="text-sm text-gray-600">
          Please review your exam details before publishing
        </p>
      </div>

      {/* Exam Details Form */}
      {isEditing ? (
        <div className="space-y-5">
          <div className="flex h-22 w-full flex-col items-start justify-around">
            <h1 className="text-lg font-semibold">Exam Title</h1>
            <input
              type="text"
              value={editData.examTitle}
              onChange={(e) => setEditData({ ...editData, examTitle: e.target.value })}
              className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
            />
          </div>
          
          <div className="flex h-22 w-full flex-col items-start justify-around">
            <h1 className="text-lg font-semibold">Exam Date</h1>
            <input
              type="date"
              value={editData.examDate}
              onChange={(e) => setEditData({ ...editData, examDate: e.target.value })}
              className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
            />
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="flex h-22 w-44 flex-col items-start justify-around">
              <h1 className="text-lg font-semibold">Exam Time</h1>
              <input
                type="time"
                value={editData.examTime}
                onChange={(e) => setEditData({ ...editData, examTime: e.target.value })}
                className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
              />
            </div>
            <div className="flex h-22 w-36 flex-col items-start justify-around">
              <h1 className="text-lg font-semibold">Duration</h1>
              <input
                type="text"
                value={editData.examDuration}
                onChange={(e) => setEditData({ ...editData, examDuration: e.target.value })}
                className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
                placeholder="120 min"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-2 h-12 px-6 cursor-pointer rounded-full bg-green-500 hover:bg-green-600 text-white font-bold transition-colors duration-200"
            >
              <FiCheck className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 h-12 px-6 cursor-pointer rounded-full bg-gray-500 hover:bg-gray-600 text-white font-bold transition-colors duration-200"
            >
              <FiX className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Exam Title Display */}
          <div className="flex h-22 w-full flex-col items-start justify-around">
            <h1 className="text-lg font-semibold">Exam Title</h1>
            <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 bg-gray-50">
              {examData?.examTitle}
            </div>
          </div>
          
          {/* Exam Date Display */}
          <div className="flex h-22 w-full flex-col items-start justify-around">
            <h1 className="text-lg font-semibold">Exam Date</h1>
            <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 bg-gray-50">
              {formatDate(examData?.examDate)}
            </div>
          </div>

          {/* Duration and Creator Display */}
          <div className="flex w-full items-center justify-between">
            <div className="flex h-22 w-44 flex-col items-start justify-around">
              <h1 className="text-lg font-semibold">Duration</h1>
              <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 bg-gray-50">
                {examData?.examDuration} min
              </div>
            </div>
            {/* <div className="flex h-22 w-36 flex-col items-start justify-around">
              <h1 className="text-lg font-semibold">Created by</h1>
              <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 bg-gray-50 text-sm">
                {examData?.creatorEmail}
              </div>
            </div> */}
          </div>

          {/* Edit Button */}
          {/* <div className="flex justify-end">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 h-12 px-6 cursor-pointer rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors duration-200"
            >
              <FiEdit className="h-4 w-4" />
              Edit Details
            </button>
          </div> */}
        </div>
      )}

      {/* Questions Summary */}
      <div className="flex h-fit w-full flex-col items-start justify-around gap-3">
        <h1 className="text-lg font-semibold">Questions Summary</h1>
        
        {examData?.questions && examData.questions.length > 0 ? (
          <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3">
            <div className="flex items-center gap-2 mb-3">
              <FiFileText className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-700">
                {examData.questions.length} questions loaded successfully
              </span>
            </div>
            
            {examData.uploadedFileName && (
              <div className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Source file:</span> {examData.uploadedFileName}
              </div>
            )}

            <div className="max-h-32 overflow-y-auto rounded bg-gray-50 p-3">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Question Preview:</h4>
              <div className="space-y-2">
                {examData.questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-gray-600">Q{index + 1}:</span>
                    <span className="ml-2 text-gray-700">
                      {question.question?.length > 80
                        ? `${question.question.substring(0, 80)}...`
                        : question.question}
                    </span>
                  </div>
                ))}
                {examData.questions.length > 3 && (
                  <div className="text-sm text-gray-500">
                    ... and {examData.questions.length - 3} more questions
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 bg-amber-50">
            <div className="flex items-center gap-2 text-amber-600">
              <FiFileText className="h-5 w-5" />
              <span>No questions loaded. You can add questions manually later.</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex w-full gap-4">
        <button
          onClick={onPrev}
          className="flex-1 h-12 cursor-pointer rounded-full border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors duration-200"
        >
          Back to Form
        </button>
        <button
          onClick={handleContinue}
          disabled={isEditing}
          className="flex-1 h-12 cursor-pointer rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold transition-colors duration-200 disabled:opacity-50"
        >
          Continue to Publish
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;