import React from 'react';

const QuestionNavigation = ({ questions, current, answers, goToQuestion }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Questions</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => goToQuestion(index)}
            className={`w-10 h-10 rounded-full border-2 ${
              index === current
                ? 'bg-blue-500 text-white border-blue-500'
                : answers[index]
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionNavigation;
