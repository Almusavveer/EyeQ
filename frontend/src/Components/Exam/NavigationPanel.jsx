import React from 'react';

const NavigationPanel = ({ questions, onNavigateToQuestion, currentQuestionId }) => {
    if (questions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg h-full flex items-center justify-center">
                <p className="text-gray-500">Loading questions...</p>
            </div>
        );
    }

    const handleQuestionClick = (questionId) => {
        if (onNavigateToQuestion) {
            onNavigateToQuestion(questionId);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Question Navigation</h3>
            <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {questions.map(q => {
                    // Determine button style based on question state
                    let statusClass = 'bg-gray-200 hover:bg-gray-300 text-gray-700'; // Not Answered
                    if (q.id === currentQuestionId) {
                        statusClass = 'bg-blue-500 text-white ring-2 ring-offset-2 ring-blue-500'; // Current
                    } else if (q.isFlagged) {
                        statusClass = 'bg-yellow-400 hover:bg-yellow-500 text-white'; // Flagged
                    } else if (q.answer != null) {
                        statusClass = 'bg-green-500 hover:bg-green-600 text-white'; // Answered
                    }

                    return (
                        <button
                            key={q.id}
                            onClick={() => handleQuestionClick(q.id)}
                            className={`w-10 h-10 rounded-md font-bold transition-all duration-200 flex items-center justify-center ${statusClass}`}
                        >
                            {q.id}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default NavigationPanel;
