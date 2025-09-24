import { useState } from 'react';
import { FiCopy, FiCheck, FiBarChart2, FiCalendar, FiLink, FiClock } from 'react-icons/fi';

const Card = ({ 
  examTitle = "Untitled Exam", 
  examDate, 
  examId, 
  onViewResults,
  examLink,
  examDuration,
  createdAt 
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "Date not set";
    
    let date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format duration
  const formatDuration = (duration) => {
    if (!duration) return null;
    return `${duration} minutes`;
  };

  // Generate exam link
  const generateExamLink = () => {
    if (examLink) return examLink;
    if (examId) return `${window.location.origin}/exam/${examId}`;
    return `${window.location.origin}/exam/pending`;
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      const link = generateExamLink();
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      
      // Reset copy success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Handle view results click
  const handleViewResults = () => {
    if (onViewResults) {
      onViewResults(examId);
    } else {
      // Default behavior - navigate to results page
      window.location.href = `/results/${examId}`;
    }
  };

  return (
    <div className="w-full border p-4 border-gray-200 rounded-lg flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <h1 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
        {examTitle}
      </h1>
      
      {/* Exam Details */}
      <div className="space-y-2 mb-4">
        {/* Date */}
        <div className="flex items-center text-gray-500 text-sm">
          <FiCalendar className="w-4 h-4 mr-2" />
          <p>{formatDate(examDate)}</p>
        </div>
        
        {/* Duration */}
        {examDuration && (
          <div className="flex items-center text-gray-500 text-sm">
            <FiClock className="w-4 h-4 mr-2" />
            <p>{formatDuration(examDuration)}</p>
          </div>
        )}
        
        {/* Link preview */}
        <div className="flex items-center text-gray-400 text-xs">
          <FiLink className="w-3 h-3 mr-2" />
          <p className="truncate">{generateExamLink()}</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center justify-between mt-auto gap-2">
        <button 
          onClick={handleViewResults}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 py-2 px-3 font-medium text-sm rounded-md cursor-pointer transition-colors duration-200"
        >
          <FiBarChart2 className="w-4 h-4" />
          View Results
        </button>
        
        <button 
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 py-2 px-3 font-medium text-sm rounded-md cursor-pointer transition-colors duration-200"
        >
          {copySuccess ? (
            <>
              <FiCheck className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy className="w-4 h-4" />
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Card;
