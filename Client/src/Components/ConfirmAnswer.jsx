import { useEffect, useRef, useState } from "react";
import { speakText } from "../utils/speechUtils";

const ConfirmAnswer = ({ answer, onConfirm, onReject }) => {
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const finishedRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState("Preparing to listen...");
  const [showManualButtons, setShowManualButtons] = useState(false);

  useEffect(() => {
    if (!answer) return;
    if (finishedRef.current) return;

    finishedRef.current = false;

    // Use improved speech synthesis
    const speakConfirmation = async () => {
      try {
        await speakText(
          `You said ${answer}. Do you want to confirm? Say yes or no.`,
          {
            rate: 0.8,
            lang: "en-US", // US English for better pronunciation
            pitch: 1
          }
        );
        startListening();
      } catch (error) {
        console.error("Speech synthesis failed:", error);
        // Fallback to basic synthesis
        const utter = new window.SpeechSynthesisUtterance(
          `You said ${answer}. Do you want to confirm? Say yes or no.`
        );
        utter.rate = 0.8;
        utter.lang = "en-US";
        utter.onend = startListening;
        window.speechSynthesis.speak(utter);
      }
    };

    speakConfirmation();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      finishedRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

  const startListening = () => {
    if (finishedRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechFeedback("Speech recognition not supported. Please use manual buttons.");
      setShowManualButtons(true);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setSpeechFeedback("Listening... Say 'yes' or 'no'");
    };

    rec.onresult = (e) => {
      setIsListening(false);
      
      if (!e.results || !e.results[0] || !e.results[0][0]) {
        retry();
        return;
      }
      
      const heard = e.results[0][0].transcript.toLowerCase();
      console.log("Confirmation heard:", heard);
      
      if (heard.includes("yes")) {
        setSpeechFeedback("Confirmed! Processing your answer...");
        finishedRef.current = true;
        rec.stop();
        onConfirm();
      } else if (heard.includes("no")) {
        setSpeechFeedback("Rejected. Let's try again...");
        finishedRef.current = true;
        rec.stop();
        onReject();
      } else {
        setSpeechFeedback(`I heard "${heard}". Please say "yes" or "no"`);
        rec.stop();
        setTimeout(retry, 1000);
      }
    };
    
    rec.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        setSpeechFeedback("Microphone access denied. Please use manual buttons.");
        setShowManualButtons(true);
      } else {
        setSpeechFeedback("Speech error. Trying again...");
        setTimeout(retry, 1000);
      }
    };
    
    rec.onend = () => {
      setIsListening(false);
      if (!finishedRef.current) {
        setTimeout(retry, 500);
      }
    };

    recognitionRef.current = rec;
    rec.start();

    // Timeout after 8 seconds and show manual buttons as fallback
    timeoutRef.current = setTimeout(() => {
      if (!finishedRef.current) {
        rec.stop();
        setSpeechFeedback("No response detected. You can use manual buttons or try speaking again.");
        setShowManualButtons(true);
      }
    }, 8000);
  };

  const retry = async () => {
    if (finishedRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    try {
      setSpeechFeedback("Let me repeat...");
      await speakText(
        `I didn't catch that. You said ${answer}. Please say yes or no.`,
        {
          rate: 0.8,
          lang: "en-US",
          pitch: 1
        }
      );
      startListening();
    } catch (error) {
      console.error("Retry speech failed:", error);
      setSpeechFeedback("Speech error. Please use manual buttons or try again.");
      setShowManualButtons(true);
    }
  };

  // Manual button handlers
  const handleManualConfirm = () => {
    finishedRef.current = true;
    if (recognitionRef.current) recognitionRef.current.stop();
    setSpeechFeedback("Confirmed!");
    onConfirm();
  };

  const handleManualReject = () => {
    finishedRef.current = true;
    if (recognitionRef.current) recognitionRef.current.stop();
    setSpeechFeedback("Rejected!");
    onReject();
  };

  const tryAgainSpeech = () => {
    setShowManualButtons(false);
    setSpeechFeedback("Let me ask again...");
    setTimeout(() => {
      speakText(`You said ${answer}. Is this correct? Say yes or no.`, {
        rate: 0.8,
        lang: "en-US"
      }).then(() => {
        startListening();
      }).catch(() => {
        setSpeechFeedback("Speech error. Please use manual buttons.");
        setShowManualButtons(true);
      });
    }, 500);
  };

  if (!answer) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* Answer Display */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Please Confirm Your Answer
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-700">You selected:</p>
          <p className="text-xl font-bold text-blue-800">{answer}</p>
        </div>
      </div>

      {/* Speech Status */}
      <div className="text-center mb-4">
        {isListening ? (
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="animate-bounce w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium">🎤 Listening for your response...</span>
          </div>
        ) : (
          <div className="text-gray-600">
            <span>🔊 {speechFeedback}</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 mb-4">
        Say <strong>"YES"</strong> to confirm or <strong>"NO"</strong> to try again
      </div>

      {/* Manual Buttons - Show when needed */}
      {showManualButtons && (
        <div className="space-y-3">
          <div className="text-center text-sm text-gray-500 mb-3">
            Having trouble with speech? Use these buttons:
          </div>
          <div className="flex space-x-4 justify-center">
            <button 
              onClick={handleManualConfirm}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow"
            >
              ✅ Yes, Confirm
            </button>
            <button 
              onClick={handleManualReject}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow"
            >
              ❌ No, Try Again
            </button>
          </div>
          <div className="text-center mt-2">
            <button 
              onClick={tryAgainSpeech}
              className="text-blue-500 hover:text-blue-700 text-sm underline"
            >
              🎤 Try Speech Again
            </button>
          </div>
        </div>
      )}

      {/* Always show a small "Need Help?" button */}
      {!showManualButtons && (
        <div className="text-center mt-4">
          <button 
            onClick={() => setShowManualButtons(true)}
            className="text-gray-400 hover:text-gray-600 text-sm underline"
          >
            Need help? Show manual buttons
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfirmAnswer;