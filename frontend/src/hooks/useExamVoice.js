import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { normalizeSpeechInput } from '../utils/speechUtils';

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
    examId,
    setTimerStarted,
    isLoaded
}) => {
    // Refs to hold the latest state and props to avoid stale closures
    const questionsRef = useRef(questions);
    const currentQuestionRef = useRef(currentQuestion);
    const isLoadedRef = useRef(isLoaded);

    // Refs to hold the latest versions of the handler functions
    const handleAnswerRef = useRef(handleAnswer);
    const handleNextRef = useRef(handleNext);
    const handlePrevRef = useRef(handlePrev);

    // Voice-related states
    const [speechSupported, setSpeechSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceStep, setVoiceStepState] = useState('question'); // 'question' or 'listening'
    
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
    }, [questions, currentQuestion, isLoaded, handleAnswer, handleNext, handlePrev]);

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
            const normalizedTranscript = normalizeSpeechInput(transcript);
            handleVoiceResult(normalizedTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            // The 'onend' event will be fired automatically after an error,
            // so we can centralize our state reset logic there.
        };

        recognition.onend = () => {
            // This event fires whenever recognition stops for any reason (result, no-speech, error).
            // This is the single, reliable place to reset our state for the next listening session.
            setIsListening(false);
            setVoiceStep('question');
            isProcessingVoiceRef.current = false;
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
            // We don't need to manually set state here. The 'onend' handler will take care of it.
            if (recognitionRef.current) {
                // This will trigger the 'onend' event handler where state is reset.
                recognitionRef.current.stop();
            }
        };

        // Handle navigation commands
        if (transcript.includes('next') || transcript.includes('go next') || transcript.includes('next question')) {
            console.log('Calling handleNext via ref');
            handleNextRef.current();
            stopRecognition();
            return;
        } 
        
        if (transcript.includes('previous') || transcript.includes('prev') || transcript.includes('back') || transcript.includes('go back') || transcript.includes('previous question')) {
            console.log('Calling handlePrev via ref');
            handlePrevRef.current();
            stopRecognition();
            return;
        }

        // Handle option selection
        let optionIndex = -1;
        if (transcript.includes('option a') || transcript.includes('option 1') || transcript === 'a' || transcript === '1') optionIndex = 0;
        else if (transcript.includes('option b') || transcript.includes('option 2') || transcript === 'b' || transcript === '2') optionIndex = 1;
        else if (transcript.includes('option c') || transcript.includes('option 3') || transcript === 'c' || transcript === '3') optionIndex = 2;
        else if (transcript.includes('option d') || transcript.includes('option 4') || transcript === 'd' || transcript === '4') optionIndex = 3;

        if (optionIndex !== -1 && currentQuestionRef.current && currentQuestionRef.current.options[optionIndex]) {
            handleAnswerRef.current(currentQuestionRef.current.id, currentQuestionRef.current.options[optionIndex].id);
        }

        stopRecognition();
    };

    // Start voice input
    const startVoiceInput = () => {
        if (recognitionRef.current && !isListening && currentVoiceStepRef.current === 'question' && timerStarted && currentQuestionRef.current && questionsRef.current.length > 0) {
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

