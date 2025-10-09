import React, { useState, useRef } from "react";

const SpeechButton = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser. Try Chrome or Edge.");
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // Enhanced configuration
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3; // Get multiple alternatives
    recognition.continuous = false;
    
    setIsListening(true);
    setError("");

    recognition.onstart = () => {
    };

    recognition.onresult = (event) => {
      const results = event.results[0];
      const transcript = results[0].transcript;
      const confidence = results[0].confidence;
      
      
      // Call the callback with the result
      if (onResult) {
        onResult(transcript);
      }
      
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      let errorMessage = "";
      switch(event.error) {
        case 'no-speech':
          errorMessage = "No speech detected. Please try again.";
          break;
        case 'audio-capture':
          errorMessage = "No microphone found. Please check your microphone.";
          break;
        case 'not-allowed':
          errorMessage = "Microphone access denied. Please allow microphone access.";
          break;
        case 'network':
          errorMessage = "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsListening(false);
      setError("Failed to start speech recognition. Please try again.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button 
        onClick={isListening ? stopListening : startListening}
        disabled={!!error}
        className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-white text-sm sm:text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 touch-manipulation ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
            : error 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
        }`}
        aria-label={
          isListening 
            ? "Stop listening. Click to stop speech recognition."
            : error 
            ? `Speech recognition error: ${error}. Button disabled.`
            : "Universal speech button. Click to speak your answer, confirm selections, or make changes through speech."
        }
        onFocus={() => {
          if (!isListening && !error) {
            // Provide audio feedback when button gets focus
            const utterance = new SpeechSynthesisUtterance("Speech button focused. Use this single button for all operations: speak your answer, say confirm to submit, or say change to select again.");
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
          }
        }}
      >
        {isListening ? (
          <>
            <span className="text-lg animate-pulse" aria-hidden="true">🔴</span>
            <span>Stop Listening</span>
          </>
        ) : (
          <>
            <span className="text-lg" aria-hidden="true">🎤</span>
            <span>Speak Answer</span>
          </>
        )}
      </button>
      
      {isListening && (
        <div className="flex items-center space-x-2 text-blue-600" aria-live="polite">
          <div className="animate-bounce w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
          <span className="text-xs">Listening for your answer...</span>
        </div>
      )}
      
      {error && (
        <div 
          className="max-w-xs text-xs text-red-600 text-center bg-red-50 p-2 rounded" 
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
      
      {!isListening && !error && (
        <div 
          className="text-xs text-gray-500 text-center max-w-xs"
          aria-live="polite"
        >
          Say your answer → "confirm" → or "change" for new selection
        </div>
      )}
    </div>
  );
};

export default SpeechButton;
