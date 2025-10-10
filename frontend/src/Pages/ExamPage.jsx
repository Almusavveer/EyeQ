import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ExamHeader from '../Components/Exam/ExamHeader';
import QuestionPanel from '../Components/Exam/QuestionPanel';
import NavigationPanel from '../Components/Exam/NavigationPanel';
import ExamFooter from '../Components/Exam/ExamFooter';
import StudentVerification from '../Components/Exam/StudentVerification';
import { useExamData } from '../hooks/useExamData';
import { useStudentVerification } from '../hooks/useStudentVerification';
import { useExamVoice } from '../hooks/useExamVoice';
import { speakText } from '../utils/speechUtils';

/**
 * Main Page Component (ExamPage)
 * Voice-enabled exam experience for blind students
 */
const ExamPage = () => {
    const { examId } = useParams();
    const navigate = useNavigate();

    // State for exam data
    const [examTitle, setExamTitle] = useState('Loading...');
    const [examDuration, setExamDuration] = useState(0); // in minutes
    const [questions, setQuestions] = useState([]);
    const [currentQuestionId, setCurrentQuestionId] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timerStarted, setTimerStarted] = useState(false);
    const [welcomeSpoken, setWelcomeSpoken] = useState(false);
    const [lastReadQuestionId, setLastReadQuestionId] = useState(null);

    // Custom hooks
    const { studentName, studentId, isVerified, handleStudentVerified } = useStudentVerification(examId);
    const { availableExams, showExamSelection, loadingExams, fetchAvailableExams } = useExamData(
        examId, isVerified, studentId, questions, setQuestions, setExamTitle, setExamDuration, setError, setLoading
    );

    // Find the current question object from the array
    const currentQuestion = questions.find(q => q.id === currentQuestionId);
    const isLoaded = questions.length > 0;

    // Voice handling functions
    const handleAnswer = (questionId, optionId) => {
        setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answer: optionId, isFlagged: false } : q));
    };

    const handleNext = () => {
        console.log('handleNext called, currentQuestionId:', currentQuestionId, 'questions.length:', questions.length);
        if (currentQuestionId < questions.length) {
            setCurrentQuestionId(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        console.log('handlePrev called, currentQuestionId:', currentQuestionId);
        if (currentQuestionId > 1) {
            setCurrentQuestionId(prev => prev - 1);
        }
    };

    const handleNavigateToQuestion = (questionId) => {
        setCurrentQuestionId(questionId);
    };

    // Voice hook (after dependencies)
    const { startVoiceInput } = useExamVoice({
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
    });

    // Speak welcome message when exam is loaded
    useEffect(() => {
        if (isVerified && questions.length > 0 && !welcomeSpoken) {
            speakText(`Welcome ${studentName}. Instructions: You can navigate using voice commands like next, previous, or say option A, B, C, D to select answers. Click on the screen to start voice input.`).then(() => {
                setWelcomeSpoken(true);
            }).catch((error) => {
                console.error('Error speaking welcome:', error);
                setWelcomeSpoken(true); // Still set to true to proceed
            });
        }
    }, [isVerified, questions.length, welcomeSpoken, studentName]);

    // Start timer when exam is ready and welcome spoken
    useEffect(() => {
        if (isVerified && examId && questions.length > 0 && !timerStarted && welcomeSpoken) {
            setTimerStarted(true);
        }
    }, [isVerified, examId, questions.length, timerStarted, welcomeSpoken]);

    // Read current question when it changes and timer is started
    useEffect(() => {
        if (currentQuestion && timerStarted && currentQuestionId !== lastReadQuestionId) {
            speakText(`Question: ${currentQuestion.questionText}. Options: A. ${currentQuestion.options[0].text}, B. ${currentQuestion.options[1].text}, C. ${currentQuestion.options[2].text}, D. ${currentQuestion.options[3].text}`).then(() => {
                setLastReadQuestionId(currentQuestionId);
            }).catch((error) => {
                console.error('Error speaking question:', error);
            });
        }
    }, [currentQuestion, timerStarted, currentQuestionId, lastReadQuestionId]);

    // Handle student verification with exam fetching
    const handleStudentVerifiedWithExams = async (studentData) => {
        handleStudentVerified(studentData);

        // If no examId provided, fetch available exams after verification
        if (!examId) {
            await fetchAvailableExams();
        }
    };

    const handleSubmit = async () => {
        // Calculate attempted questions (questions that have an answer)
        const attemptedQuestions = questions.filter(q => q.answer !== null).length;

        try {
            // Save final submission to examResults collection for teacher viewing
            const submissionData = {
                studentId,
                studentName,
                rollNumber: studentId,
                answers: questions.map(q => q.answer ?? null),
                flagged: questions.map(q => q.isFlagged ?? false),
                attemptedQuestions,
                totalQuestions: questions.length,
                submittedAt: new Date(),
                examId,
                examTitle
            };

            await setDoc(doc(db, 'examResults', examId, 'submissions', studentId), submissionData);

            // Navigate to the submission confirmation page with exam data
            navigate('/exam-submitted', {
                state: {
                    attemptedQuestions,
                    totalQuestions: questions.length,
                    examTitle
                }
            });
        } catch (error) {
            console.error('Error submitting exam:', error);
            alert('Failed to submit exam. Please try again.');
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowRight') {
                handleNext();
            } else if (event.key === 'ArrowLeft') {
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentQuestionId, questions.length]);

    // Show verification screen if not verified
    if (!isVerified) {
        return <StudentVerification onVerified={handleStudentVerifiedWithExams} examId={examId} />;
    }

    // Show exam selection if no examId provided and verified
    if (showExamSelection && isVerified) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Exams</h1>
                        <p className="text-gray-600">Choose an exam to begin</p>
                    </div>

                    {/* Content */}
                    {loadingExams ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading available exams...</p>
                        </div>
                    ) : availableExams.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Exams Available</h2>
                            <p className="text-gray-600">There are no exams available at the moment.</p>
                            <p className="text-gray-500 mt-1">Please contact your teacher for more information.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableExams.map((exam) => (
                                <div key={exam.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{exam.examTitle}</h3>
                                                <p className="text-gray-600 text-sm line-clamp-3">{exam.examDescription || 'No description available'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <polyline points="12,6 12,12 16,14"></polyline>
                                                </svg>
                                                Duration: {exam.examDuration || 60} minutes
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 11H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h5m0-7h5a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2z"></path>
                                                </svg>
                                                Questions: {exam.questions?.length || 0}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/exam/${exam.id}`)}
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                                        >
                                            Take Exam
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-screen bg-gray-100 font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-gray-100 font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">Error</div>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-100 font-sans flex flex-col overflow-hidden cursor-pointer" onClick={startVoiceInput}>
            <ExamHeader
                studentName={studentName}
                studentId={studentId}
                examTitle={examTitle}
                examDuration={examDuration}
                timerStarted={timerStarted}
            />

            {/* Main content area that grows to fill available space */}
            <main className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">

                {/* Section 1: Question and Options */}
                <div className="lg:col-span-2">
                   <QuestionPanel question={currentQuestion} onAnswer={handleAnswer} />
                </div>

                {/* Section 2: Question Navigation */}
                <div className="lg:col-span-1">
                   <NavigationPanel
                       questions={questions}
                       currentQuestionId={currentQuestionId}
                       onNavigateToQuestion={handleNavigateToQuestion}
                   />
                </div>

            </main>

            <ExamFooter
                onNext={handleNext}
                onPrev={handlePrev}
                onSubmit={handleSubmit}
                currentQuestionId={currentQuestionId}
                totalQuestions={questions.length}
            />
        </div>
    );
};

export default ExamPage;
