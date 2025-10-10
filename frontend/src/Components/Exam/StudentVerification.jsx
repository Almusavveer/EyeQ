import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { speakText } from "../../utils/speechUtils";

const StudentVerification = ({ onVerified, examId }) => {
  const [rollNumber, setRollNumber] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [welcomeSpoken, setWelcomeSpoken] = useState(false);

  // Check if speech recognition is supported
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const spokenRollNumber = transcript.trim().replace(/\s+/g, ''); // Remove spaces
        setRollNumber(spokenRollNumber);
        setIsListening(false);

        // Auto-verify after capturing roll number
        setTimeout(() => {
          verifyStudent(spokenRollNumber);
        }, 1000); // Small delay to show the captured roll number
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setVerificationError('Voice recognition failed. Please try again or type your roll number manually.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startVoiceInput = async () => {
    // Enable speech on first interaction
    if (!speechEnabled) {
      setSpeechEnabled(true);

      // Speak welcome message on first interaction
      if (!welcomeSpoken) {
        try {
          await speakText("Welcome to the exam system. To verify yourself please click anywhere on the screen to activate voice input, then speak your roll number clearly.");
          setWelcomeSpoken(true);
        } catch (error) {
          console.error('Text-to-speech error:', error);
        }
      }
      return; // Don't start listening yet, just enable speech
    }

    // If speech is already enabled, proceed with voice input
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setVerificationError("");
      recognitionRef.current.start();
    }
  };

  const verifyStudent = async (rollNumberToVerify = rollNumber) => {
    if (!rollNumberToVerify.trim()) {
      setVerificationError("Please enter your roll number");
      return;
    }
    setVerifying(true);
    setVerificationError("");
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      let foundStudent = null;
      const knownUserIds = ["I5rUsd1SxEXIJ7hSu6UQiCo6VPE3"];
      const allUserIds = [...new Set([
        ...usersSnapshot.docs.map(doc => doc.id),
        ...knownUserIds
      ])];
      for (const userId of allUserIds) {
        const studentsSnapshot = await getDocs(collection(db, "users", userId, "students"));
        const student = studentsSnapshot.docs.find(studentDoc => {
          const data = studentDoc.data();
          const dbRollNumber = data.rollNumber?.toString();
          const inputRollNumber = rollNumberToVerify.trim();
          const isActive = data.active === undefined || data.active === true;
          return isActive && dbRollNumber === inputRollNumber;
        });
        if (student) {
          foundStudent = student.data();
          break;
        }
      }
      if (!foundStudent) {
        const alternativeCollections = ["Students", "students", "student"];
        for (const collectionName of alternativeCollections) {
          const snapshot = await getDocs(collection(db, collectionName));
          const found = snapshot.docs.find(doc => {
            const data = doc.data();
            const dbRollNumber = data.rollNumber?.toString();
            const inputRollNumber = rollNumberToVerify.trim();
            const isActive = data.active === undefined || data.active === true;
            return isActive && dbRollNumber === inputRollNumber;
          });
          if (found) {
            foundStudent = found.data();
            break;
          }
        }
      }
      if (foundStudent) {
        // Check if student has already submitted this exam
        if (examId) {
          const submissionDoc = await getDoc(doc(db, 'examResults', examId, 'submissions', rollNumberToVerify.trim()));
          if (submissionDoc.exists()) {
            setVerificationError("You have already submitted this exam. You cannot retake it.");
            setVerifying(false);
            return;
          }
        }
        setVerificationError("");
        // Speak success message
        try {
          await speakText("Verification successful. Starting your exam now.");
        } catch (error) {
          console.error('Text-to-speech error:', error);
        }
        onVerified(foundStudent);
      } else {
        setVerificationError("You are not authorized to take this exam. Please contact your teacher.");
        // Speak error message
        try {
          await speakText("Verification failed. You are not authorized to take this exam. Please contact your teacher.");
        } catch (error) {
          console.error('Text-to-speech error:', error);
        }
      }
    } catch (error) {
      setVerificationError("Verification failed. Please try again.");
      // Speak error message
      try {
        await speakText("Verification failed. Please try again.");
      } catch (error) {
        console.error('Text-to-speech error:', error);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      verifyStudent();
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 cursor-pointer"
      onClick={startVoiceInput}
    >
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
            isListening ? 'bg-red-100 animate-pulse' : speechEnabled ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {isListening ? (
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 00-4 4v6a4 4 0 008 0V5a4 4 0 00-4-4z"/>
                <path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4M8 23h8"/>
              </svg>
            ) : speechEnabled ? (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Student Verification</h1>
          <p className="text-gray-600 mb-4">
            {!speechEnabled
              ? "Click anywhere to enable voice features"
              : isListening
                ? "Listening... Speak your roll number clearly"
                : speechSupported
                  ? "Click anywhere to activate voice input, then speak your roll number"
                  : "Enter your roll number below"
            }
          </p>
          {!speechSupported && (
            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
              Voice input not supported in this browser. Please type your roll number manually.
            </p>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Roll Number
            </label>
            <input
              type="text"
              id="rollNumber"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your roll number"
              disabled={verifying || isListening}
            />
          </div>
          {verificationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {verificationError}
              </div>
            </div>
          )}
          <button
            onClick={() => verifyStudent()}
            disabled={verifying || !rollNumber.trim() || isListening}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              verifying || !rollNumber.trim() || isListening
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95'
            }`}
          >
            {verifying ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : isListening ? (
              'Listening for voice input...'
            ) : (
              'Verify & Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentVerification;
