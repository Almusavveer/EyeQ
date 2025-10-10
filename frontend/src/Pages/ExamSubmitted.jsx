import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ExamSubmitted = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get data from navigation state
    const { attemptedQuestions, totalQuestions, examTitle } = location.state || {
        attemptedQuestions: 0,
        totalQuestions: 0,
        examTitle: 'Exam'
    };

    const handleGoHome = () => {
        // Redirect to student verification page (exam page root)
        navigate('/exam');
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {/* Success Icon */}
                <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted Successfully!</h1>
                <p className="text-gray-600 mb-6">Your {examTitle} has been submitted.</p>

                {/* Stats */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{attemptedQuestions}</div>
                            <div className="text-sm text-gray-600">Questions Attempted</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{totalQuestions}</div>
                            <div className="text-sm text-gray-600">Total Questions</div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                    <p className="text-gray-700">
                        {attemptedQuestions === totalQuestions
                            ? "Great job! You attempted all questions."
                            : `You attempted ${attemptedQuestions} out of ${totalQuestions} questions.`
                        }
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleGoHome}
                    className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default ExamSubmitted;
