import React from "react";

const SpeechButton = ({ onResult }) => {
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.start();
  };

  return (
    <button 
      onClick={startListening}
      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 touch-manipulation active:bg-blue-700"
    >
      <span className="text-lg">🎤</span>
      <span>Speak Answer</span>
    </button>
  );
};

export default SpeechButton;