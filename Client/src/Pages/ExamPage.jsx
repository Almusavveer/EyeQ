import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { QUESTIONS } from "../data";
import Question from "../UI/Question";
import AnswerList from "../Components/AnswerList";
import Result from "./Result";
import { speakText, preprocessTextForSpeech, normalizeSpeechInput } from "../utils/speechUtils";

const ExamPage = () => {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [finished, setFinished] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState("");
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [questionReadingComplete, setQuestionReadingComplete] = useState(false);
  const recognitionRef = useRef(null);
  
  // Verification states
  const [isVerified, setIsVerified] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Verification function
  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!rollNumber.trim()) {
      setVerificationError("Please enter your roll number");
      return;
    }

    setVerifying(true);
    setVerificationError("");

    try {
      console.log("🔍 Verifying student with roll number:", rollNumber);
      
      // First, fetch exam details to get the creator
      if (!examId) {
        setVerificationError("Invalid exam ID");
        setVerifying(false);
        return;
      }

      const examRef = doc(db, "examDetails", examId);
      const examSnap = await getDoc(examRef);

      if (!examSnap.exists()) {
        setVerificationError("Exam not found. Contact your faculty.");
        setVerifying(false);
        return;
      }

      const examData = examSnap.data();
      const creatorId = examData.createdBy;

      if (!creatorId) {
        setVerificationError("Unable to verify student. Contact your faculty.");
        setVerifying(false);
        return;
      }

      // Check if student exists in the exam creator's student list
      const studentsRef = collection(db, "users", creatorId, "students");
      const q = query(studentsRef, where("rollNumber", "==", rollNumber.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Student found in creator's database
        const studentData = querySnapshot.docs[0].data();
        console.log("✅ Student verified:", studentData);
        setIsVerified(true);
      } else {
        // Student not found
        console.log("❌ Student not found in exam creator's database");
        setVerificationError("You are not allowed for this exam. Contact your faculty.");
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      setVerificationError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // Fetch exam data if examId is provided and user is verified
  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) {
        console.log("ℹ️ No examId provided, using default questions");
        // No examId provided, use default questions
        setQuestions(QUESTIONS);
        setLoading(false);
        return;
      }

      // Only fetch data if user is verified
      if (!isVerified) {
        setLoading(false);
        return;
      }

      console.log("🔍 Fetching exam data for ID:", examId);
      try {
        setLoading(true);
        const examRef = doc(db, "examDetails", examId);
        const examSnap = await getDoc(examRef);

        if (examSnap.exists()) {
          const data = examSnap.data();
          console.log("✅ Fetched exam data:", data);
          console.log("✅ Questions from database:", data.questions);
          console.log("✅ First question structure:", data.questions?.[0]);
          setExamData(data);
          
          // Transform questions to match expected format
          const transformedQuestions = (data.questions || []).map(q => ({
            ...q,
            text: q.question, // Map 'question' to 'text'
            options: q.options && q.options.length > 0 ? q.options : [
              q.answer || "Answer not available",
              "Option B",
              "Option C", 
              "Option D"
            ] // Generate options if missing
          }));
          
          console.log("✅ Transformed questions:", transformedQuestions[0]);
          setQuestions(transformedQuestions);
        } else {
          console.log("❌ Exam document not found");
          setError("Exam not found");
          // Fallback to default questions
          setQuestions(QUESTIONS);
        }
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Failed to load exam");
        // Fallback to default questions
        setQuestions(QUESTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId, isVerified]);

  useEffect(() => {
    if (!loading && !finished && questions[current]) {
      // Provide orientation announcement for first question
      if (current === 0) {
        const announceOrientation = async () => {
          try {
            await speakText(`Welcome to the exam. You are on question ${current + 1} of ${questions.length}. I will read the question and options. To interact with the exam, simply click anywhere on the screen to activate the microphone. Speak your answer to select an option, then say "confirm" to submit. If you want to change your selection, say "change" and speak a new option. You can also say "repeat" anytime to hear the question again.`, {
              rate: 0.9,
              lang: "en-US"
            });
            // Then read the first question
            setTimeout(() => speakQuestion(questions[current]), 1000);
          } catch (error) {
            console.error("Failed to announce orientation:", error);
            speakQuestion(questions[current]);
          }
        };
        announceOrientation();
      } else {
        speakQuestion(questions[current]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, finished, loading]);

  // Speech recognition functions
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition not supported in this browser. Try Chrome or Edge.");
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
    recognition.maxAlternatives = 3;
    recognition.continuous = false;
    
    setIsListening(true);
    setSpeechError("");

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setSpeechFeedback("Listening...");
    };

    recognition.onresult = (event) => {
      const results = event.results[0];
      const transcript = results[0].transcript;
      const confidence = results[0].confidence;
      
      console.log("Speech result:", transcript, "Confidence:", confidence);
      
      // Process the speech result
      onSpeech(transcript);
      
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
      
      setSpeechError(errorMessage);
      setSpeechFeedback(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSpeechError("");
        setSpeechFeedback("");
      }, 5000);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsListening(false);
      setSpeechError("Failed to start speech recognition. Please try again.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Handle screen click to activate speech
  const handleScreenClick = (e) => {
    // Don't activate speech if clicking on specific interactive elements
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'A') {
      return;
    }
    
    // Don't allow speech activation until question reading is complete
    if (!questionReadingComplete) {
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakQuestion = async (q) => {
    if (!q) return;
    
    // Reset the completion flag when starting to read a new question
    setQuestionReadingComplete(false);
    
    try {
      // Preprocess the question text for better pronunciation of technical terms
      const processedQuestionText = preprocessTextForSpeech(q.text);
      
      // Create a more natural question reading
      const questionText = `Question: ${processedQuestionText}`;
      const optionsText = q.options && q.options.length > 0 
        ? `Your options are: ${q.options.map((opt, idx) => `Option ${idx + 1}: ${preprocessTextForSpeech(opt)}`).join(". ")}`
        : "";
      
      const fullText = `${questionText}. ${optionsText}. Please speak your answer.`;
      
      console.log("Speaking:", fullText);
      
      await speakText(fullText, {
        rate: 0.8,     // Slower for better comprehension
        pitch: 1,      // Normal pitch
        volume: 1,     // Full volume
        lang: 'en-US'  // US English for better technical pronunciation
      });
      
      // Set completion flag when reading is finished
      setQuestionReadingComplete(true);
      
    } catch (error) {
      console.error("Failed to speak question:", error);
      // Fallback to basic speech synthesis
      const u = new SpeechSynthesisUtterance(`${q.text}. Options are: ${q.options.join(", ")}`);
      u.rate = 0.8;
      u.onend = () => {
        setQuestionReadingComplete(true);
      };
      window.speechSynthesis.speak(u);
    }
  };

  // Enhanced speech interpretation with better matching
  const interpret = (speech, q) => {
    if (!speech || !q || !q.options) return speech;
    
    // Normalize the speech input for better programming term matching
    const normalizedSpeech = normalizeSpeechInput(speech);
    const ans = normalizedSpeech.toLowerCase().trim();
    
    console.log("Speech normalization:", { original: speech, normalized: normalizedSpeech });
    
    let match = null;
    let highestConfidence = 0;

    q.options.forEach((opt, idx) => {
      const n = idx + 1;
      const letter = String.fromCharCode(65 + idx); // A, B, C, D
      
      // Normalize the option text for comparison
      const normalizedOption = normalizeSpeechInput(opt);
      
      // Multiple ways to reference each option
      const patterns = [
        `option ${n}`,
        `choice ${n}`,
        `number ${n}`,
        `${n}`,
        letter.toLowerCase(),
        `option ${letter.toLowerCase()}`,
        opt.toLowerCase(),
        normalizedOption.toLowerCase() // Add normalized version
      ];
      
      // Add ordinal numbers
      const ordinals = ["first", "second", "third", "fourth", "fifth"];
      if (idx < ordinals.length) {
        patterns.push(ordinals[idx]);
      }
      
      // Check for exact matches first (highest confidence)
      patterns.forEach(pattern => {
        if (ans === pattern) {
          match = opt;
          highestConfidence = 100;
        } else if (ans.includes(pattern) && highestConfidence < 50) {
          match = opt;
          highestConfidence = 50;
        }
      });
      
      // Check for partial content matching (lower confidence)
      if (highestConfidence < 30) {
        // Use both original and normalized option text for word matching
        const optWords = normalizedOption.toLowerCase().split(' ');
        const speechWords = ans.split(' ');
        let wordMatches = 0;
        
        optWords.forEach(optWord => {
          speechWords.forEach(speechWord => {
            if (optWord.length > 2 && speechWord.includes(optWord)) {
              wordMatches++;
            }
          });
        });
        
        // Also try matching original option words (fallback)
        if (wordMatches === 0) {
          const originalOptWords = opt.toLowerCase().split(' ');
          originalOptWords.forEach(optWord => {
            speechWords.forEach(speechWord => {
              if (optWord.length > 2 && speechWord.includes(optWord)) {
                wordMatches++;
              }
            });
          });
        }
        
        const confidence = (wordMatches / Math.max(optWords.length, 1)) * 30;
        if (confidence > highestConfidence && confidence > 10) {
          match = opt;
          highestConfidence = confidence;
        }
      }
    });

    console.log("Speech interpretation:", { 
      spoken: speech, 
      matched: match, 
      confidence: highestConfidence 
    });

    return match || speech;
  };

  const onSpeech = async (spoken) => {
    console.log("Speech received:", spoken);
    
    const q = questions[current];
    if (!q) return;

    const lower = spoken.toLowerCase().trim();
    
    // Handle special commands first
    if (lower.includes("repeat") || lower.includes("again")) {
      console.log("Repeating question...");
      setSpeechFeedback("Repeating question...");
      await speakQuestion(q);
      return;
    }
    
    // Handle confirmation commands
    if (selectedOption !== null && (lower.includes("yes") || lower.includes("confirm") || lower.includes("submit"))) {
      // User wants to confirm their current selection
      const selectedOptionText = q.options[selectedOption];
      const nextAnswers = [
        ...answers,
        { question: q.text, answer: selectedOptionText },
      ];
      setAnswers(nextAnswers);
      setSpeechFeedback("Answer confirmed! Moving to next question...");
      
      try {
        await speakText("Answer submitted successfully. Moving to next question.", {
          rate: 0.9,
          lang: "en-US"
        });
      } catch (error) {
        console.error("Failed to speak submission:", error);
      }
      
      // Reset and move to next question
      setSelectedOption(null);
      setQuestionReadingComplete(false);
      const next = current + 1;
      if (next < questions.length) {
        setCurrent(next);
      } else {
        setFinished(true);
      }
      return;
    }
    
    // Handle change/cancel commands
    if (selectedOption !== null && (lower.includes("no") || lower.includes("change") || lower.includes("different"))) {
      setSelectedOption(null);
      setSpeechFeedback("Selection cleared. Please speak your new answer.");
      try {
        await speakText("Okay, let's select again. Please speak your answer.", {
          rate: 0.9,
          lang: "en-US"
        });
      } catch (error) {
        console.error("Failed to speak change message:", error);
      }
      return;
    }

    // Try to interpret as an answer selection
    const interpretedAnswer = interpret(spoken, q);
    console.log("Interpreted answer:", interpretedAnswer);
    
    // Check if this is a valid option
    if (q.options && q.options.includes(interpretedAnswer)) {
      const optionIndex = q.options.indexOf(interpretedAnswer);
      setSelectedOption(optionIndex);
      setSpeechFeedback(`You selected: ${interpretedAnswer}`);
      
      // Provide simple confirmation instruction
      try {
        await speakText(`You selected ${interpretedAnswer}. Say "confirm" to submit this answer, or speak a different option to change.`, {
          rate: 0.9,
          lang: "en-US"
        });
      } catch (error) {
        console.error("Failed to speak selection:", error);
        setSpeechFeedback("Selection made. Say 'confirm' to submit or speak a different option.");
      }
    } else {
      // Option not recognized clearly
      setSpeechFeedback(`I heard: ${spoken}. Please try again or speak more clearly.`);
      try {
        await speakText(`I heard ${spoken}, but I'm not sure which option you mean. Please try again by saying "option 1", "option 2", or speaking part of the answer text.`, {
          rate: 0.9,
          lang: "en-US"
        });
      } catch (error) {
        console.error("Failed to speak error message:", error);
      }
    }
  };

  // Show verification form if not verified and examId exists
  if (examId && !isVerified) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Student Verification</h1>
            <p className="text-sm sm:text-base text-gray-600">Please enter your roll number to access the exam</p>
          </div>
          
          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number
              </label>
              <input
                type="text"
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter your roll number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                disabled={verifying}
              />
            </div>
            
            {verificationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{verificationError}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-black font-bold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Verifying...
                </>
              ) : (
                "Verify & Start Exam"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-lg text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="text-center space-y-4">
          <p className="text-lg text-red-600">{error}</p>
          <p className="text-base text-gray-600">Please check the exam link and try again.</p>
        </div>
      </div>
    );
  }

  if (finished) {
    return <Result answers={answers} questions={questions} />;
  }
  console.log(current);

  const q = questions[current];
  return (
    <div 
      className="flex h-full w-full flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10 bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 cursor-pointer min-h-screen"
      onClick={handleScreenClick}
      role="button"
      tabIndex={0}
      aria-label="Click anywhere on the screen to activate speech recognition. Speak your answer, say confirm to submit, or say change to select again."
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleScreenClick(e);
        }
      }}
    >
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-600 text-center sm:text-left">
          {examData?.examTitle || "Exam"}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm md:text-base text-gray-400">
            {questions.length} questions
          </p>
          {examData?.examDuration && (
            <p className="text-xs sm:text-sm md:text-base text-gray-400">
              Duration: {examData.examDuration} minutes
            </p>
          )}
        </div>
      </div>
      
      {/* Question Navigation */}
      <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 overflow-x-auto scrollbar-hide pb-2 px-1">
        {questions.map((_, index) => (
          <div
            className={`
              flex items-center justify-center rounded-full flex-shrink-0 
              h-7 w-7 text-xs font-bold
              sm:h-8 sm:w-8 sm:text-sm 
              md:h-9 md:w-9 md:text-base 
              lg:h-10 lg:w-10 lg:text-lg 
              xl:h-12 xl:w-12 xl:text-xl 
              ${current === index ? "bg-[#FBC02D] text-white shadow-md" : "bg-gray-200 text-gray-600"} 
              transition-all duration-200 hover:shadow-lg
              min-w-[28px] min-h-[28px]
              sm:min-w-[32px] sm:min-h-[32px]
              md:min-w-[36px] md:min-h-[36px]
              lg:min-w-[40px] lg:min-h-[40px]
              xl:min-w-[48px] xl:min-h-[48px]
            `}
            key={index}
            role="button"
            aria-label={`Question ${index + 1} ${current === index ? '(current)' : ''}`}
            tabIndex={0}
          >
            {index + 1}
          </div>
        ))}
      </div>
      
      {q && (
        <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 min-h-0">
          <Question 
            text={q.text} 
            options={q.options} 
            selectedIndex={selectedOption}
          />
          
          {/* Speech feedback and status */}
          <div className="text-center space-y-2 px-2">
            {isListening && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                <div className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full" style={{animationDelay: '0.1s'}}></div>
                <div className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full" style={{animationDelay: '0.2s'}}></div>
                <span className="text-xs sm:text-sm font-medium">Listening...</span>
              </div>
            )}
            
            {speechError && (
              <div className="text-red-600 text-xs sm:text-sm bg-red-50 p-2 sm:p-3 rounded-lg mx-2">
                {speechError}
              </div>
            )}
            
            {!isListening && !speechError && (
              <div className="text-gray-500 text-xs sm:text-sm px-2">
                {questionReadingComplete ? (
                  <>🎤 Click anywhere to speak your answer</>
                ) : (
                  <>🔊 Listening to question... Please wait</>
                )}
              </div>
            )}
          </div>

          {selectedOption !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-center mx-2 sm:mx-0">
              <p className="text-sm sm:text-lg text-blue-800 mb-1 sm:mb-2" aria-live="polite">
                Selected: <strong className="break-words">{q.options[selectedOption]}</strong>
              </p>
              <p className="text-xs sm:text-sm text-blue-600">
                Say "confirm" to submit or speak a different option to change
              </p>
            </div>
          )}
        </div>
      )}

      {/* <AnswerList answers={answers} /> */}
    </div>
  );
};

export default ExamPage;
