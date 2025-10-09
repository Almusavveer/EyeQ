import { useEffect, useState, useRef } from "react";
import React from "react";
import { useParams } from "react-router";
import { QUESTIONS } from "../data";
import Question from "../UI/Question";
import AnswerList from "../Components/AnswerList";
import Result from "./Result";
import { speakText, preprocessTextForSpeech, normalizeSpeechInput } from "../utils/speechUtils";
import { examAPI, studentAPI } from "../utils/api";

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
  const [isNavigating, setIsNavigating] = useState(false); // Flag to prevent double reading during navigation
  const [initialInstructionsGiven, setInitialInstructionsGiven] = useState(false); // Track if initial instructions were already given
  const recognitionRef = useRef(null);
  
  // Verification states
  const [isVerified, setIsVerified] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verifying, setVerifying] = useState(false);
  
  // Student details state
  const [studentData, setStudentData] = useState(null);
  
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [examStartTime, setExamStartTime] = useState(null);
  const [instructionsComplete, setInstructionsComplete] = useState(false);
  // Removed per-question timer states (no longer needed):
  // const [questionTimeRemaining, setQuestionTimeRemaining] = useState(null);
  // const [timePerQuestion, setTimePerQuestion] = useState(null);
  const timerRef = useRef(null);
  // const questionTimerRef = useRef(null); // No longer needed

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
      
      // First, fetch exam details to get the creator
      if (!examId) {
        setVerificationError("Invalid exam ID");
        setVerifying(false);
        return;
      }

      // Get exam details from backend
      const examData = await examAPI.getExamDetails(examId);
      
      if (!examData) {
        setVerificationError("Exam not found. Contact your faculty.");
        setVerifying(false);
        return;
      }

      const creatorId = examData.createdBy;

      if (!creatorId) {
        setVerificationError("Unable to verify student. Contact your faculty.");
        setVerifying(false);
        return;
      }

      // Check if student exists in the exam creator's student list using backend API
      const studentDetails = await studentAPI.getStudentDetails(creatorId, rollNumber.trim());
      
      if (studentDetails) {
        // Student found in creator's database
        setStudentData(studentDetails);
        setIsVerified(true);
      } else {
        // Student not found
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

      try {
        setLoading(true);
        
        // Get exam data from backend API
        const data = await examAPI.getExamDetails(examId);

        if (data) {
          setExamData(data);
          
          // Transform questions to match expected format
          const transformedQuestions = (data.questions || []).map(q => ({
            ...q,
            text: q.question || q.text, // Map 'question' to 'text' or use existing 'text'
            options: q.options && q.options.length > 0 ? q.options : [
              q.answer || "Answer not available",
              "Option B",
              "Option C", 
              "Option D"
            ] // Generate options if missing
          }));
          
          setQuestions(transformedQuestions);
        } else {
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
    if (!loading && !finished && questions[current] && !isNavigating) {
      // Provide orientation announcement ONLY for the very first time on question 1
      if (current === 0 && !initialInstructionsGiven) {
        const announceOrientation = async () => {
          try {
            const durationText = examData?.examDuration ? ` You have ${examData.examDuration} minutes to complete this exam.` : '';
            await speakText(`Welcome to the exam. You are on question ${current + 1} of ${questions.length}.${durationText} I will read the question and options. To interact with the exam, simply click anywhere on the screen to activate the microphone. Speak your answer to select an option, then say "confirm" to submit. If you want to change your selection, say "change" and speak a new option. You can also say "repeat" anytime to hear the question again. To navigate, say "next" or "skip" to go forward, or "previous" or "back" to go back. The timer will start now.`, {
              rate: 0.9,
              lang: "en-US"
            });
            // Mark instructions as complete to start timer
            setInstructionsComplete(true);
            setInitialInstructionsGiven(true);
            // Then read the first question
            setTimeout(() => speakQuestion(questions[current]), 1000);
          } catch (error) {
            console.error("Failed to announce orientation:", error);
            speakQuestion(questions[current]);
          }
        };
        announceOrientation();
      } else {
        // For all other cases (including revisiting question 1), just read the question
        setTimeout(() => speakQuestion(questions[current]), 300);
      }
    }
    
    // Reset navigation flag after question change is processed
    if (isNavigating) {
      setTimeout(() => setIsNavigating(false), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, finished, loading, isNavigating]);

  // Initialize timer when instructions are complete
  useEffect(() => {
    if (instructionsComplete && examData?.examDuration && timeRemaining === null) {
      const startTime = Date.now();
      setExamStartTime(startTime);
      const totalSeconds = examData.examDuration * 60;
      
      setTimeRemaining(totalSeconds);
      // Removed per-question timer calculation
      // setTimePerQuestion(secondsPerQuestion);
      // setQuestionTimeRemaining(secondsPerQuestion);
    }
  }, [instructionsComplete, examData, timeRemaining, questions.length]);

  // Per-question timer countdown effect - DISABLED
  // Now using only total exam timer, not per-question timing
  /*
  useEffect(() => {
    if (questionTimeRemaining !== null && questionTimeRemaining > 0 && !finished && instructionsComplete) {
      questionTimerRef.current = setInterval(() => {
        setQuestionTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up for this question - auto advance
            
            // Save current answer (even if empty) and move to next question
            const newAnswers = [...answers];
            const currentQuestion = questions[current];
            const answerText = selectedOption !== null 
              ? currentQuestion?.options[selectedOption] 
              : "Not answered (time expired)";

            newAnswers[current] = {
              question: currentQuestion?.text || currentQuestion?.question,
              answer: answerText,
              isCorrect: false // Mark as incorrect since time expired
            };
            setAnswers(newAnswers);
            
            // Reset states for next question
            setSelectedOption(null);
            setQuestionReadingComplete(false);
            
            const nextQuestion = current + 1;
            if (nextQuestion < questions.length) {
              setCurrent(nextQuestion);
              // Reset question timer for next question
              setQuestionTimeRemaining(timePerQuestion);
              
              // Announce time expiration and new question
              setTimeout(() => {
                speakText(`Time expired for the previous question. Moving to question ${nextQuestion + 1}.`, {
                  rate: 0.9,
                  lang: "en-US"
                }).then(() => {
                  setTimeout(() => speakQuestion(questions[nextQuestion]), 500);
                }).catch(console.error);
              }, 100);
            } else {
              // Last question - finish exam
              handleSubmitExam();
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (questionTimerRef.current) {
          clearInterval(questionTimerRef.current);
        }
      };
    }
  }, [questionTimeRemaining, finished, instructionsComplete, current, questions, selectedOption, answers, timePerQuestion]);
  */

  // Reset question timer when moving to a new question manually - DISABLED
  /*
  useEffect(() => {
    if (timePerQuestion && instructionsComplete) {
      setQuestionTimeRemaining(timePerQuestion);
    }
  }, [current, timePerQuestion, instructionsComplete]);
  */

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !finished && instructionsComplete) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto submit exam
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [timeRemaining, finished]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Removed questionTimerRef cleanup (no longer used)
    };
  }, []);

  // Announce exam completion when finished
  useEffect(() => {
    if (finished) {
      const announceCompletion = async () => {
        try {
          await speakText(`Exam completed successfully. You answered ${answers.length} out of ${questions.length} questions. Thank you for taking the exam.`, {
            rate: 0.8,
            lang: "en-US",
            pitch: 1,
            volume: 1
          });
        } catch (error) {
          console.error("Failed to speak completion:", error);
        }
      };
      announceCompletion();
    }
  }, [finished, answers.length, questions.length]);

  // Exam submission handler
  const handleSubmitExam = async () => {
    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Removed questionTimerRef cleanup (no longer used)
    
    // Calculate time taken
    const timeTaken = examStartTime ? Math.round((Date.now() - examStartTime) / 60000) : 0;
    
    // Prepare exam results for submission
    const examResults = {
      studentId: studentData?.rollNumber || studentData?.studentId || "student_" + Date.now(),
      studentName: studentData?.name || "Unknown Student",
      examId: examData?.examId || examId || "exam_" + Date.now(),
      examTitle: examData?.examTitle || examData?.title || "Exam",
      answers: answers,
      questions: questions,
      examDuration: examData?.examDuration,
      timeTaken: timeTaken
    };
    
    try {
      // Submit results using API utility
      const result = await examAPI.submitExamResults(examResults);
    } catch (error) {
      console.error('❌ Error submitting exam results:', error);
      // Continue with exam completion even if submission fails
    }
    
    // Complete the exam
    setFinished(true);
  };

  // Navigation handlers
  const handleNextQuestion = async () => {
    // Save current answer if one is selected
    if (selectedOption !== null) {
      const currentQuestion = questions[current];
      const answerText = currentQuestion?.options[selectedOption];
      const nextAnswers = [
        ...answers.slice(0, current),
        {
          question: currentQuestion?.text || currentQuestion?.question,
          answer: answerText
        },
        ...answers.slice(current + 1)
      ];
      setAnswers(nextAnswers);
    }

    // Move to next question
    if (current < questions.length - 1) {
      setIsNavigating(true); // Set flag to prevent double reading
      const nextQuestion = current + 1;
      setCurrent(nextQuestion);
      
      // Reset states for next question and restore any previous answer
      const nextAnswer = answers[nextQuestion];
      if (nextAnswer && typeof nextAnswer === 'object' && nextAnswer.answer) {
        // Find the index of the answer in the options
        const currentQuestion = questions[nextQuestion];
        const answerIndex = currentQuestion?.options?.indexOf(nextAnswer.answer);
        setSelectedOption(answerIndex >= 0 ? answerIndex : null);
      } else {
        setSelectedOption(null);
      }
      
      setSpeechFeedback("");
      setSpeechError("");
      setQuestionReadingComplete(false);
      
      // Don't reset question timer when navigating - let it continue from where it left off
      // The overall exam timer continues, question timer is paused during navigation
      // if (timePerQuestion) {
      //   setQuestionTimeRemaining(timePerQuestion);
      // }
      
      // Announce new question and then read it
      try {
        await speakText(`Question ${nextQuestion + 1} of ${questions.length}`, {
          rate: 0.8,
          pitch: 1,
          volume: 0.8
        });
        
        // Read the question after a brief pause, then restart speech recognition
        setTimeout(async () => {
          await speakQuestion(questions[nextQuestion]);
          restartSpeechRecognition();
        }, 500);
      } catch (error) {
        console.error("Failed to announce next question:", error);
        restartSpeechRecognition();
      }
    }
  };

  const handlePreviousQuestion = async () => {
    // Save current answer if one is selected
    if (selectedOption !== null) {
      const currentQuestion = questions[current];
      const answerText = currentQuestion?.options[selectedOption];
      const nextAnswers = [
        ...answers.slice(0, current),
        {
          question: currentQuestion?.text || currentQuestion?.question,
          answer: answerText
        },
        ...answers.slice(current + 1)
      ];
      setAnswers(nextAnswers);
    }

    // Move to previous question
    if (current > 0) {
      setIsNavigating(true); // Set flag to prevent double reading
      const prevQuestion = current - 1;
      setCurrent(prevQuestion);
      
      // Reset states for previous question and restore previous answer
      const previousAnswer = answers[prevQuestion];
      if (previousAnswer && typeof previousAnswer === 'object' && previousAnswer.answer) {
        // Find the index of the answer in the options
        const currentQuestion = questions[prevQuestion];
        const answerIndex = currentQuestion?.options?.indexOf(previousAnswer.answer);
        setSelectedOption(answerIndex >= 0 ? answerIndex : null);
      } else {
        setSelectedOption(null);
      }
      
      setSpeechFeedback("");
      setSpeechError("");
      setQuestionReadingComplete(false);
      
      // Don't reset question timer when navigating - let it continue from where it left off
      // The overall exam timer continues, question timer is paused during navigation  
      // if (timePerQuestion) {
      //   setQuestionTimeRemaining(timePerQuestion);
      // }
      
      // Announce previous question and then read it
      try {
        await speakText(`Going back to question ${prevQuestion + 1} of ${questions.length}`, {
          rate: 0.8,
          pitch: 1,
          volume: 0.8
        });
        
        // Read the question after a brief pause, then restart speech recognition
        setTimeout(async () => {
          await speakQuestion(questions[prevQuestion]);
          restartSpeechRecognition();
        }, 500);
      } catch (error) {
        console.error("Failed to announce previous question:", error);
        restartSpeechRecognition();
      }
    }
  };

  // Format time remaining for display
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to safely restart speech recognition after navigation
  const restartSpeechRecognition = () => {
    // Wait for any speech synthesis to complete before restarting recognition
    setTimeout(() => {
      if (questionReadingComplete && !isListening) {
        startListening();
      }
    }, 1000); // Longer delay to ensure speech synthesis is complete
  };

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
      setSpeechFeedback("Listening...");
    };

    recognition.onresult = (event) => {
      const results = event.results[0];
      const transcript = results[0].transcript;
      const confidence = results[0].confidence;
      
      
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
      
      // Check if this question already has an answer
      const hasSelectedAnswer = selectedOption !== null;
      
      if (hasSelectedAnswer) {
        // For questions with existing answers, provide shorter context
        const questionText = `Question: ${processedQuestionText}`;
        const selectedAnswerText = q.options[selectedOption];
        const currentSelectionText = `You previously selected: ${preprocessTextForSpeech(selectedAnswerText)}`;
        const promptText = `Say "confirm" to keep this answer, or speak a different option to change it.`;
        
        const fullText = `${questionText}. ${currentSelectionText}. ${promptText}`;
        
        
        await speakText(fullText, {
          rate: 0.8,
          pitch: 1,
          volume: 1,
          lang: 'en-US'
        });
      } else {
        // For new questions, provide full options
        const questionText = `Question: ${processedQuestionText}`;
        const optionsText = q.options && q.options.length > 0 
          ? `Your options are: ${q.options.map((opt, idx) => `Option ${idx + 1}: ${preprocessTextForSpeech(opt)}`).join(". ")}`
          : "";
        
        const fullText = `${questionText}. ${optionsText}. Please speak your answer.`;
        
        
        await speakText(fullText, {
          rate: 0.8,     // Slower for better comprehension
          pitch: 1,      // Normal pitch
          volume: 1,     // Full volume
          lang: 'en-US'  // US English for better technical pronunciation
        });
      }
      
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

    return match || speech;
  };

  const onSpeech = async (spoken) => {
    
    const q = questions[current];
    if (!q) return;

    const lower = spoken.toLowerCase().trim();
    
    // Handle special commands first
    if (lower.includes("repeat") || lower.includes("again")) {
      setSpeechFeedback("Repeating question...");
      await speakQuestion(q);
      return;
    }
    
    // Handle navigation commands
    if (lower.includes("next") || lower.includes("skip")) {
      setSpeechFeedback("Moving to next question...");
      
      // Stop speech recognition first to prevent interference
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      
      // Small delay to ensure recognition is stopped before speech synthesis
      setTimeout(() => {
        handleNextQuestion();
      }, 200);
      return;
    }
    
    if (lower.includes("previous") || lower.includes("back")) {
      setSpeechFeedback("Going back to previous question...");
      
      // Stop speech recognition first to prevent interference
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      
      // Small delay to ensure recognition is stopped before speech synthesis
      setTimeout(() => {
        handlePreviousQuestion();
      }, 200);
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
      
      const next = current + 1;
      const isLastQuestion = next >= questions.length;
      
      if (isLastQuestion) {
        setSpeechFeedback("Answer confirmed! Submitting exam...");
        try {
          await speakText("Answer submitted successfully. Submitting your exam now.", {
            rate: 0.9,
            lang: "en-US"
          });
        } catch (error) {
          console.error("Failed to speak submission:", error);
        }
      } else {
        setSpeechFeedback("Answer confirmed! Moving to next question...");
        try {
          await speakText("Answer submitted successfully. Moving to next question.", {
            rate: 0.9,
            lang: "en-US"
          });
        } catch (error) {
          console.error("Failed to speak submission:", error);
        }
      }
      
      // Reset and move to next question or finish exam
      setSelectedOption(null);
      setQuestionReadingComplete(false);
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
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6 bg-white rounded-xl shadow-lg p-8">
          {/* Success Icon */}
          <div className="text-6xl mb-4">✅</div>
          
          {/* Completion Message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">
              Exam Completed Successfully!
            </h2>
            <p className="text-gray-600">
              Your answers have been submitted. Thank you for taking the exam.
            </p>
            <p className="text-sm text-gray-500">
              You can close this tab now. Results will be shared by your instructor.
            </p>
          </div>
          
          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p><strong>Questions Answered:</strong> {answers.length} of {questions.length}</p>
            <p><strong>Exam:</strong> {examData?.examTitle || "Exam"}</p>
            <p><strong>Time Taken:</strong> {examStartTime ? Math.round((Date.now() - examStartTime) / 60000) : 0} minutes</p>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div 
      className="flex h-full w-full flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10 bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 cursor-pointer min-h-screen"
      onClick={handleScreenClick}
      role="button"
      tabIndex={0}
      aria-label="Click anywhere on the screen to activate speech recognition. Speak your answer, say confirm to submit, say change to select again, or say next, skip, previous, or back to navigate."
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleScreenClick(e);
        }
      }}
    >
      <div className="flex flex-col gap-2 lg:gap-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
          {/* Left side - Student Details */}
          <div className="flex flex-col items-center lg:items-start gap-2 order-2 lg:order-1">
            {/* Student Information */}
            {studentData && (
              <div className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-6 shadow-md lg:shadow-lg border border-gray-100 w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[220px]">
                <div className="space-y-2 lg:space-y-4">
                  {/* Hide decorative header on mobile */}
                  <div className="hidden lg:block text-center lg:text-left">
                    <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2 sm:mb-3 opacity-80">
                      Student Details
                    </div>
                  </div>
                  
                  <div className="space-y-1 lg:space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight text-center lg:text-left">
                        {studentData.name || studentData.studentName || "Student"}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 text-xs lg:text-sm">
                      <span className="text-gray-400 font-medium">Roll:</span>
                      <span className="text-gray-700 font-medium">
                        {studentData.rollNumber}
                      </span>
                    </div>
                    
                    {studentData.class && (
                      <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 text-xs lg:text-sm">
                        <span className="text-gray-400 font-medium">Class:</span>
                        <span className="text-gray-700 font-medium">
                          {studentData.class}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Center - Exam Title */}
          <div className="flex-1 flex flex-col items-center px-2 sm:px-4 order-1 lg:order-2">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 w-full max-w-[400px] lg:max-w-[500px]">
                <div className="text-center space-y-1 lg:space-y-3">
                {/* Hide decorative header on mobile */}
                <div className="hidden lg:block text-xs text-indigo-600 font-semibold uppercase tracking-wider opacity-80">
                  Examination
                </div>
                
                <h1 className="text-base lg:text-2xl xl:text-3xl font-bold text-gray-800 leading-tight">
                  {examData?.examTitle || "Exam"}
                </h1>
                
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="flex items-center gap-1 text-gray-500">
                    <span className="text-sm">📝</span>
                    <span className="text-sm font-medium">{questions.length} questions</span>
                  </div>
                  
                  {(examData?.examDate || examData?.examTime) && (
                    <>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <span className="text-sm">�</span>
                        <span className="text-sm font-medium">
                          {(() => {
                            try {
                              const time = new Date(examData?.examDate || examData?.examTime);
                              return !isNaN(time.getTime()) ? time.toLocaleDateString() : 'Today';
                            } catch {
                              return 'Today';
                            }
                          })()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Hide decorative line on mobile */}
                <div className="hidden lg:flex items-center justify-center pt-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-24"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Timer */}
          <div className="flex flex-col items-center sm:items-end gap-2 sm:w-40">
            {/* Timer Display - Now showing only total exam time */}
            {timeRemaining !== null && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-lg min-w-[120px]">
                <div className="text-center">
                  {/* Total Exam Time */}
                  <div>
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Total Time</div>
                    <div className={`text-lg sm:text-xl font-bold tabular-nums ${
                      timeRemaining <= 60 ? 'text-red-600' : 
                      timeRemaining <= 300 ? 'text-orange-600' : 
                      'text-blue-600'
                    }`}>
                      {formatTime(timeRemaining)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
              <div className="text-gray-500 text-xs sm:text-sm px-2 text-center">
                {questionReadingComplete ? (
                  <div className="space-y-1">
                    <div>🎤 Click anywhere to speak your answer</div>
                    <div className="text-xs opacity-75">
                      Say: "next", "previous", "repeat", "confirm", or "change"
                    </div>
                  </div>
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

          {/* Navigation Controls - Voice Only */}
          <div className="flex justify-between items-center gap-4 px-2 sm:px-0 pt-2 sm:pt-4">
            {/* Previous Button - Voice Control Only */}
            <div
              className={`
                flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all duration-200 cursor-default
                ${current === 0 
                  ? 'bg-gray-200 text-gray-400' 
                  : 'bg-gray-600 text-white shadow-md'
                }
              `}
              aria-label="Previous question (voice command only)"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm sm:text-base">Previous</span>
            </div>

            {/* Question Counter */}
            <div className="text-center px-2">
              <div className="text-sm sm:text-base font-medium text-gray-700">
                Question {current + 1} of {questions.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-[#FBC02D] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Next/Submit Button - Voice Control Only */}
            <div
              className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-[#FBC02D] text-black font-medium rounded-lg shadow-md cursor-default"
              aria-label={current === questions.length - 1 ? "Submit exam (voice command only)" : "Next question (voice command only)"}
            >
              <span className="text-sm sm:text-base">
                {current === questions.length - 1 ? 'Submit' : 'Next'}
              </span>
              {current === questions.length - 1 ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </div>
        </div>
      )}

      {/* <AnswerList answers={answers} /> */}
    </div>
  );
};

export default ExamPage;
