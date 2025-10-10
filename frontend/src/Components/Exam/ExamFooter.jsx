import React from 'react';

const ExamFooter = ({ onNext, onPrev, onSubmit, currentQuestionId, totalQuestions }) => {
    const isLastQuestion = currentQuestionId === totalQuestions;
    const isFirstQuestion = currentQuestionId === 1;

    return (
        <footer className="sticky bottom-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-10">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center">
                <button
                    onClick={onPrev}
                    disabled={isFirstQuestion}
                    className={`font-bold py-2 px-4 rounded-lg ${
                        isFirstQuestion
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-500 text-white hover:bg-gray-600 cursor-pointer'
                    }`}
                >
                    Previous
                </button>
                {isLastQuestion ? (
                    <button
                        onClick={onSubmit}
                        className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 cursor-pointer"
                    >
                        Submit Exam
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 cursor-pointer"
                    >
                        Next
                    </button>
                )}
            </div>
        </footer>
    );
};

export default ExamFooter;
