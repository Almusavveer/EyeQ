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
    <div className="w-full border p-3 sm:p-4 lg:p-5 border-gray-200 rounded-lg flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-3 line-clamp-2">
        {examTitle}
      </h1>
      
      {/* Exam Details */}
      <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-4">
        {/* Date */}
        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
          <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
          <p>{formatDate(examDate)}</p>
        </div>
        
        {/* Duration */}
        {examDuration && (
          <div className="flex items-center text-gray-500 text-xs sm:text-sm">
            <FiClock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
            <p>{formatDuration(examDuration)}</p>
          </div>
        )}
        
        {/* Link preview */}
        <div className="flex items-center text-gray-400 text-xs">
          <FiLink className="w-3 h-3 mr-2 flex-shrink-0" />
          <p className="truncate text-xs">{generateExamLink()}</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-auto gap-2 sm:gap-3">
        <button 
          onClick={handleViewResults}
          className="flex items-center justify-center gap-1.5 sm:gap-2 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 py-2.5 sm:py-2 px-3 sm:px-4 font-medium text-xs sm:text-sm rounded-md cursor-pointer transition-colors duration-200 touch-manipulation"
        >
          <FiBarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>View Results</span>
        </button>
        
        <button 
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-1.5 sm:gap-2 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 py-2.5 sm:py-2 px-3 sm:px-4 font-medium text-xs sm:text-sm rounded-md cursor-pointer transition-colors duration-200 touch-manipulation"
        >
          {copySuccess ? (
            <>
              <FiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Card;
