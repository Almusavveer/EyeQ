import { useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";

const PdfUpload = ({ 
  onQuestionsExtracted, 
  onUploadStart, 
  onUploadError,
  disabled = false,
  maxSizeMB = 10,
  className = ""
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const fileInputRef = useRef(null);

  const uploadPdfToBackend = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // Use production API URL when deployed, localhost for development
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://eyeq-backend-0wa9.onrender.com/api/upload' 
      : 'http://127.0.0.1:5000/api/upload';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle the new API response format
      if (result.questions) {
        return result.questions;
      } else if (result.length && Array.isArray(result)) {
        // Backward compatibility with old format
        return result;
      } else {
        // Handle case where no questions were found
        return [];
      }
    } catch (error) {
      console.error('PDF upload failed:', error);
      throw error;
    }
  };

  const handleDivClick = () => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async ({ target: { files } }) => {
    const file = files[0];
    
    if (!file) return;
    
    // Reset previous state
    setError("");
    setExtractedQuestions([]);
    setUploadedFileName("");
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      const errorMsg = 'Please select a PDF file only.';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }
    
    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorMsg = `File size must be less than ${maxSizeMB}MB.`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    try {
      setIsProcessing(true);
      setUploadedFileName(file.name);
      
      // Notify parent component that upload started
      onUploadStart?.(file);
      
      console.log('📄 Uploading PDF to backend:', file.name);
      
      const questions = await uploadPdfToBackend(file);
      
      if (questions && questions.length > 0) {
        setExtractedQuestions(questions);
        console.log('✅ Successfully extracted questions:', questions.length);
        console.log('📋 Questions:', questions);
        
        // Notify parent component with extracted questions
        onQuestionsExtracted?.(questions, file.name);
      } else {
        const errorMsg = 'No questions found in the PDF. Please check the format.';
        setError(errorMsg);
        onUploadError?.(errorMsg);
      }
      
    } catch (error) {
      console.error('❌ PDF processing error:', error);
      const errorMsg = error.message || 'Failed to process PDF. Please try again.';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }

    // Clear the input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getUploadAreaStyle = () => {
    if (disabled) return 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60';
    if (error) return 'border-red-400 bg-red-50';
    if (extractedQuestions.length > 0) return 'border-green-400 bg-green-50';
    return 'border-[#cccccc] bg-[#f0f0f0f0] hover:bg-gray-50';
  };

  const renderUploadContent = () => {
    if (isProcessing) {
      return (
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-blue-600 font-medium text-sm sm:text-base">📄 Processing PDF...</p>
          <p className="text-xs sm:text-sm text-gray-600 break-words px-2">Extracting questions from {uploadedFileName}</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center">
          <p className="text-red-600 font-medium text-sm sm:text-base">❌ Error</p>
          <p className="text-xs sm:text-sm text-red-500 max-w-xs mx-auto break-words px-2">{error}</p>
          <p className="text-xs text-gray-500 mt-1">Click to try again</p>
        </div>
      );
    }
    
    if (extractedQuestions.length > 0) {
      return (
        <div className="text-center">
          <p className="text-green-600 font-medium text-sm sm:text-base">✅ PDF Processed Successfully!</p>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xs mx-auto break-words px-2">{uploadedFileName}</p>
          <p className="text-xs sm:text-sm text-green-600 font-semibold">
            {extractedQuestions.length} question{extractedQuestions.length !== 1 ? 's' : ''} extracted
          </p>
          <p className="text-xs text-gray-500 mt-1">Click to upload a different file</p>
        </div>
      );
    }
    
    return (
      <div className="text-center">
        <p className="font-medium text-sm sm:text-base">Drop your PDF file here, or Browse</p>
        <p className="text-xs text-gray-500 mt-1">PDF files only, max {maxSizeMB}MB</p>
      </div>
    );
  };

  return (
    <div className={className}>
      <div
        className={`flex h-36 sm:h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 sm:gap-4 rounded-md border-2 sm:border-3 border-dashed transition-all duration-200 p-4 ${getUploadAreaStyle()}`}
        onClick={handleDivClick}
      >
        <FiUploadCloud className={`size-12 sm:size-16 ${isProcessing ? 'animate-pulse' : ''}`} />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          disabled={disabled || isProcessing}
          style={{ display: "none" }}
        />
        {renderUploadContent()}
      </div>
     
    </div>
  );
};

export default PdfUpload;