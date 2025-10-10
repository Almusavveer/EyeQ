import { useState, useEffect, useRef } from 'react';
import { speakText } from '../utils/speechUtils';

/**
 * Custom hook for managing voice functionality in the exam
 * @param {Object} params - Parameters for the hook
 * @param {Object} params.currentQuestion - Current question object
 * @param {Function} params.handleAnswer - Function to handle answer selection
 * @param {Function} params.handleNext - Function to go to next question
 * @param {Function} params.handlePrev - Function to go to previous question
 * @param {Function} params.setCurrentQuestionId - Function to set current question ID
 * @param {Array} params.questions - Array of all questions
 * @param {string} params.studentName - Student name for welcome message
 * @param {string} params.examTitle - Exam title for welcome message
 * @param {boolean} params.timerStarted - Whether timer has started
 * @param {boolean} params.isVerified - Whether student is verified
 * @param {string} params.examId - Exam ID
 * @returns {Object} Voice-related state and functions
 */
export const useExamVoice = ({
    currentQuestion,
    handleAnswer,
    handleNext,
    handlePrev,
    setCurrentQuestionId,
    questions,
    studentName,
    examTitle,
    timerStarted,
    isVerified,
    examId
}) => {
    // Voice-related states
    const [speechSupported, setSpeechSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceStep, setVoiceStep] = useState('welcome'); // welcome, instructions, question, confirm, review_answer, listening
    const [pendingAnswer, setPendingAnswer] = useState(null);
    const [navigationDirection, setNavigationDirection] = useState(null); // 'next', 'prev', or null
    const recognitionRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setSpeechSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase().trim();
                handleVoiceResult(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                setVoiceStep('question');
                speakText("Voice recognition failed. Please try again by clicking the screen.");
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    // Handle voice recognition results
    const handleVoiceResult = (transcript) => {
        setIsListening(false);

        if (voiceStep === 'confirm') {
            if (transcript.includes('confirm') || transcript.includes('yes') || transcript.includes('correct')) {
                // Confirm the answer
                handleAnswer(currentQuestion.id, pendingAnswer);
                setPendingAnswer(null);
                setVoiceStep('question');
                speakText("Answer confirmed. Moving to next question.");
                setTimeout(() => {
                    handleNext();
                }, 2000);
            } else if (transcript.includes('change') || transcript.includes('no') || transcript.includes('wrong')) {
                // Allow changing answer
                setPendingAnswer(null);
                setVoiceStep('question');
                speakText("Please select your answer again by clicking the screen.");
            } else {
                // Didn't understand, ask again
                speakText("I didn't understand. Please say 'confirm' to accept this answer or 'change' to select a different option.");
                setTimeout(() => setVoiceStep('confirm'), 1000);
            }
        } else if (voiceStep === 'review_answer') {
            if (transcript.includes('yes') || transcript.includes('change') || transcript.includes('update')) {
                // User wants to change answer
                setVoiceStep('question');
                speakText("Please select your new answer by clicking the screen.");
            } else if (transcript.includes('no') || transcript.includes('keep') || transcript.includes('same')) {
                // User wants to keep current answer
                setVoiceStep('question');
                if (navigationDirection === 'next') {
                    speakText("Keeping your current answer. Moving to next question.");
                    setTimeout(() => handleNext(), 2000);
                } else if (navigationDirection === 'prev') {
                    speakText("Keeping your current answer. Moving to previous question.");
                    setTimeout(() => handlePrev(), 2000);
                }
                setNavigationDirection(null);
            } else {
                // Didn't understand, ask again
                const currentAnswer = currentQuestion?.answer;
                const answerLetter = currentAnswer !== null ? String.fromCharCode(65 + currentAnswer) : 'none';
                speakText(`You currently have ${answerLetter} selected. Do you want to change your answer? Say yes to change or no to keep it.`);
                setTimeout(() => setVoiceStep('review_answer'), 1000);
            }
        } else if (voiceStep === 'listening') {
            // Parse answer choice
            const answerMap = {
                'a': 0, 'option a': 0, 'first': 0, 'one': 0, 'choice a': 0,
                'b': 1, 'option b': 1, 'second': 1, 'two': 1, 'choice b': 1,
                'c': 2, 'option c': 2, 'third': 2, 'three': 2, 'choice c': 2,
                'd': 3, 'option d': 3, 'fourth': 3, 'four': 3, 'choice d': 3
            };

            const optionIndex = answerMap[transcript];
            if (optionIndex !== undefined && currentQuestion && currentQuestion.options[optionIndex]) {
                const selectedOption = currentQuestion.options[optionIndex].id;
                setPendingAnswer(selectedOption);
                setVoiceStep('confirm');
                speakText(`You selected ${String.fromCharCode(65 + optionIndex)}. Do you want to confirm this option or want to change?`);
            } else {
                speakText("I didn't understand your answer. Please say A, B, C, or D, or click again to try voice input.");
                setVoiceStep('question');
            }
        }
    };

    // Start voice input
    const startVoiceInput = () => {
        if (recognitionRef.current && !isListening && voiceStep === 'question') {
            setIsListening(true);
            setVoiceStep('listening');
            recognitionRef.current.start();
        }
    };

    // Speak current question and options
    const speakCurrentQuestion = async () => {
        if (!currentQuestion) return;

        try {
            await speakText(`Question ${currentQuestion.id}: ${currentQuestion.questionText}`);

            // Wait a bit then speak options
            setTimeout(async () => {
                for (let i = 0; i < currentQuestion.options.length; i++) {
                    const optionLetter = String.fromCharCode(65 + i);
                    await speakText(`Option ${optionLetter}: ${currentQuestion.options[i].text}`);
                    // Small pause between options
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                // After reading all options, prompt for answer
                setTimeout(() => {
                    speakText("Please click the screen to speak your answer. Say A, B, C, or D.");
                    setVoiceStep('question');
                }, 1000);
            }, 1500);
        } catch (error) {
            console.error('Error speaking question:', error);
        }
    };

    // Speak question with current answer for review
    const speakQuestionWithAnswer = async () => {
        if (!currentQuestion) return;

        try {
            await speakText(`Question ${currentQuestion.id}: ${currentQuestion.questionText}`);

            const currentAnswer = currentQuestion.answer;
            if (currentAnswer !== null) {
                const answerLetter = String.fromCharCode(65 + currentAnswer);
                const answerText = currentQuestion.options[currentAnswer]?.text || 'Unknown';
                await speakText(`Your current answer is ${answerLetter}: ${answerText}`);
                setTimeout(() => {
                    speakText("Do you want to change your answer? Say yes to change or no to keep it.");
                    setVoiceStep('review_answer');
                }, 1000);
            } else {
                // No answer selected, proceed to normal question reading
                speakCurrentQuestion();
            }
        } catch (error) {
            console.error('Error speaking question with answer:', error);
        }
    };

    // Start exam instructions and welcome
    const startExamInstructions = async () => {
        if (!speechSupported) return;

        try {
            // Welcome message
            await speakText(`Welcome ${studentName} to your exam: ${examTitle}`);

            // Instructions
            setTimeout(async () => {
                await speakText("Exam Instructions: This is a voice-enabled exam designed for blind students. I will read each question and all answer options to you. After I finish reading, click anywhere on the screen to activate voice input. Then speak your answer by saying A, B, C, or D. I will confirm your selection and ask if you want to confirm or change your answer. Use arrow keys or say next and previous to navigate between questions. When navigating to a question you've already answered, I'll read your current answer and ask if you want to change it. The exam will automatically start when instructions are complete.");

                // Start timer after instructions
                setTimeout(() => {
                    speakText("Instructions complete. Starting your exam now. Here is question 1.");
                    setVoiceStep('question');
                    speakCurrentQuestion();
                }, 3000);
            }, 2000);
        } catch (error) {
            console.error('Error with exam instructions:', error);
            // Fallback: start exam anyway
            setVoiceStep('question');
        }
    };

    // Enhanced navigation with answer review
    const handleNavigation = (direction) => {
        if (direction === 'next' && currentQuestion.id >= questions.length) return;
        if (direction === 'prev' && currentQuestion.id <= 1) return;

        // Check if current question has an answer
        if (currentQuestion && currentQuestion.answer !== null) {
            setNavigationDirection(direction);
            // Don't navigate yet - let the voice system handle the review
            return;
        }

        // No answer, proceed normally
        if (direction === 'next') {
            handleNext();
        } else {
            handlePrev();
        }
    };

    // Handle navigation to specific question number
    const handleNavigateToQuestion = (questionId) => {
        const targetQuestion = questions.find(q => q.id === questionId);
        if (!targetQuestion) return;

        // Check if target question has an answer
        if (targetQuestion.answer !== null) {
            // Set navigation direction based on relative position
            const direction = questionId > currentQuestion.id ? 'next' : 'prev';
            setNavigationDirection(direction);
            // Don't navigate yet - let the voice system handle the review
            return;
        }

        // No answer, navigate directly
        setCurrentQuestionId(questionId);
        setVoiceStep('question');
    };

    // Start instructions when exam data is loaded and verified
    useEffect(() => {
        if (isVerified && examId && questions.length > 0 && !timerStarted && speechSupported) {
            startExamInstructions();
        } else if (isVerified && examId && questions.length > 0 && !speechSupported) {
            // Fallback for non-speech browsers
            setVoiceStep('question');
        }
    }, [isVerified, examId, questions.length, timerStarted, speechSupported]);

    // Speak question when currentQuestion changes
    useEffect(() => {
        if (timerStarted && currentQuestion && voiceStep === 'question') {
            // Check if question has an answer - if so, review it
            if (currentQuestion.answer !== null) {
                speakQuestionWithAnswer();
            } else {
                speakCurrentQuestion();
            }
        }
    }, [currentQuestion?.id, timerStarted]);

    return {
        speechSupported,
        isListening,
        voiceStep,
        startVoiceInput,
        handleNavigation,
        handleNavigateToQuestion,
        setVoiceStep
    };
};
