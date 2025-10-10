import { useState, useEffect, useRef, useLayoutEffect } from 'react';

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
 * @param {Function} params.speakText - Function to speak text to the user
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
    examId,
    setTimerStarted,
    isLoaded,
    speakText
}) => {
    // Refs to hold the latest state and props to avoid stale closures
    const questionsRef = useRef(questions);
    const currentQuestionRef = useRef(currentQuestion);
    const isLoadedRef = useRef(isLoaded);

    // Refs to hold the latest versions of the handler functions
    const handleAnswerRef = useRef(handleAnswer);
    const handleNextRef = useRef(handleNext);
    const handlePrevRef = useRef(handlePrev);
    const speakTextRef = useRef(speakText);

    // Voice-related states
    const [speechSupported, setSpeechSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceStep, setVoiceStepState] = useState('question'); // 'question', 'listening', or 'confirming'
    const [pendingOptionId, setPendingOptionId] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    
    const recognitionRef = useRef(null);
    const currentVoiceStepRef = useRef('question');
    const isProcessingVoiceRef = useRef(false);

    // Update refs with useLayoutEffect for synchronous update after render
    useLayoutEffect(() => {
        questionsRef.current = questions;
        currentQuestionRef.current = currentQuestion;
        isLoadedRef.current = isLoaded;
        // Keep the handler refs updated with the latest functions from props
        handleAnswerRef.current = handleAnswer;
        handleNextRef.current = handleNext;
        handlePrevRef.current = handlePrev;
        speakTextRef.current = speakText;
    }, [questions, currentQuestion, isLoaded, handleAnswer, handleNext, handlePrev, speakText]);

    // Function to safely set the voice step state and ref
    const setVoiceStep = (step) => {
        setVoiceStepState(step);
        currentVoiceStepRef.current = step;
    };

    // Initialize speech recognition on component mount
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            return;
        }

        setSpeechSupported(true);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            handleVoiceResult(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            setIsListening(false);
            isProcessingVoiceRef.current = false;
            // Only reset the voice step to 'question' if we are not in the middle of a confirmation flow.
            if (currentVoiceStepRef.current !== 'confirming') {
                setVoiceStep('question');
            }
        };
        
        recognitionRef.current = recognition;

        // Cleanup function to stop recognition if the component unmounts
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []); // Empty dependency array ensures this runs only once

    // Handle voice recognition results
    const handleVoiceResult = (transcript) => {
        if (isProcessingVoiceRef.current || !isLoadedRef.current || questionsRef.current.length === 0) {
            console.log('Ignoring voice result due to processing or invalid state.');
            isProcessingVoiceRef.current = false;
            if (recognitionRef.current) recognitionRef.current.stop();
            return;
        }
        
        isProcessingVoiceRef.current = true;
        console.log('Handling voice result, transcript:', transcript);
        
        const stopRecognition = () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };

        // Handle navigation commands (allowed in both modes)
        if (transcript.includes('next') || transcript.includes('go next') || transcript.includes('next question')) {
            console.log('Calling handleNext via ref');
            setPendingOptionId(null);
            setIsConfirming(false);
            setVoiceStep('question');
            handleNextRef.current();
            stopRecognition();
            return;
        } 
        
        if (transcript.includes('previous') || transcript.includes('prev') || transcript.includes('back') || transcript.includes('go back') || transcript.includes('previous question')) {
            console.log('Calling handlePrev via ref');
            setPendingOptionId(null);
            setIsConfirming(false);
            setVoiceStep('question');
            handlePrevRef.current();
            stopRecognition();
            return;
        }

        if (isConfirming) {
            // In confirmation mode
            if (transcript.includes('confirm') || transcript.includes('yes') || transcript.includes('ok') || transcript.includes('okay') || transcript.includes('proceed')) {
                // Confirm the selection and go to next
                console.log('Confirming selection and going to next question');
                setPendingOptionId(null);
                setIsConfirming(false);
                setVoiceStep('question'); // FIX: Reset the voice step to allow the next command cycle
                handleNextRef.current();
                stopRecognition();
                return;
            } else {
                // Check if user said a different option
                let newOptionIndex = -1;
                if (transcript.includes('option a') || transcript.includes('option 1') || transcript === 'a' || transcript === '1') newOptionIndex = 0;
                else if (transcript.includes('option b') || transcript.includes('option 2') || transcript === 'b' || transcript === '2') newOptionIndex = 1;
                else if (transcript.includes('option c') || transcript.includes('option 3') || transcript === 'c' || transcript === '3') newOptionIndex = 2;
                else if (transcript.includes('option d') || transcript.includes('option 4') || transcript === 'd' || transcript === '4') newOptionIndex = 3;

                if (newOptionIndex !== -1 && currentQuestionRef.current && currentQuestionRef.current.options[newOptionIndex]) {
                    const newOptionId = currentQuestionRef.current.options[newOptionIndex].id;
                    const newOptionText = currentQuestionRef.current.options[newOptionIndex].text;
                    handleAnswerRef.current(currentQuestionRef.current.id, newOptionId);
                    setPendingOptionId(newOptionId);
                    // FIX: After changing the option, speak and then re-start listening for the new confirmation.
                    speakTextRef.current(`You selected ${newOptionText}. Confirm or speak a different option.`).then(() => {
                        if (recognitionRef.current) {
                            setIsListening(true);
                            recognitionRef.current.start();
                        }
                    }).catch((error) => {
                        console.error('Error speaking confirmation:', error);
                    });
                    isProcessingVoiceRef.current = false;
                    return;
                }
                stopRecognition();
            }
        } else {
            // Normal mode: Handle option selection
            let optionIndex = -1;
            if (transcript.includes('option a') || transcript.includes('option 1') || transcript === 'a' || transcript === '1') optionIndex = 0;
            else if (transcript.includes('option b') || transcript.includes('option 2') || transcript === 'b' || transcript === '2') optionIndex = 1;
            else if (transcript.includes('option c') || transcript.includes('option 3') || transcript === 'c' || transcript === '3') optionIndex = 2;
            else if (transcript.includes('option d') || transcript.includes('option 4') || transcript === 'd' || transcript === '4') optionIndex = 3;

            if (optionIndex !== -1 && currentQuestionRef.current && currentQuestionRef.current.options[optionIndex]) {
                const optionId = currentQuestionRef.current.options[optionIndex].id;
                const optionText = currentQuestionRef.current.options[optionIndex].text;
                handleAnswerRef.current(currentQuestionRef.current.id, optionId);
                setPendingOptionId(optionId);
                setIsConfirming(true);
                setVoiceStep('confirming');
                speakTextRef.current(`You selected ${optionText}. Confirm or speak a different option.`).then(() => {
                    // After speaking, start listening again for confirmation
                    if (recognitionRef.current) {
                        setIsListening(true);
                        recognitionRef.current.start();
                    }
                }).catch((error) => {
                    console.error('Error speaking confirmation:', error);
                });
                isProcessingVoiceRef.current = false;
                return;
            }
            stopRecognition();
        }
    };

    // Start voice input
    const startVoiceInput = () => {
        if (recognitionRef.current && !isListening && (currentVoiceStepRef.current === 'question' || currentVoiceStepRef.current === 'confirming') && timerStarted && currentQuestionRef.current && questionsRef.current.length > 0) {
            console.log('Starting voice input');
            setIsListening(true);
            setVoiceStep('listening');
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
                setIsListening(false);
                setVoiceStep('question');
            }
        }
    };

    return {
        speechSupported,
        isListening,
        voiceStep,
        startVoiceInput,
        setVoiceStep
    };
};

