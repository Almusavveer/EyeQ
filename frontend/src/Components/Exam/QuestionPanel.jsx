import React from 'react';

const QuestionPanel = ({ question, onAnswer }) => {
  if (!question) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg h-full flex items-center justify-center">
        <p className="text-gray-500">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Question {question.id}
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">{question.questionText}</p>
      </div>
      <div className="space-y-4">
        {question.options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
          return (
            <div
              key={option.id}
              onClick={() => onAnswer(question.id, option.id)}
              className={`flex items-center p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                question.answer === option.id
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <span className={`w-8 h-8 rounded-full border-2 flex-shrink-0 mr-4 flex items-center justify-center font-bold text-sm ${
                question.answer === option.id ? 'border-blue-600 bg-blue-500 text-white' : 'border-gray-400 text-gray-600'
              }`}>
                {optionLetter}
              </span>
              <span className="font-medium text-gray-700">{option.text}</span>
            </div>
          );
        })}
      </div>
      {question.answer !== null && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            ✓ Selected: {String.fromCharCode(65 + question.answer)}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionPanel;
