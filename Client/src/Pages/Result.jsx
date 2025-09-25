import React, { useEffect } from "react";

const Result = ({ answers, questions }) => {
  const score = answers.reduce((acc, a) => {
    const q = questions.find(q => q.text === a.question);
    return q && q.correctAnswer === a.answer ? acc + 1 : acc;
  }, 0);

  useEffect(() => {
    const u = new SpeechSynthesisUtterance(
      `Exam completed. Your score is ${score} out of ${questions.length}.`
    );
    window.speechSynthesis.speak(u);
  }, [score, questions.length]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-4">
          <div className="text-4xl sm:text-5xl lg:text-6xl">✅</div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Exam Completed
          </h2>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 inline-block">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700">
              Score: <span className="text-yellow-500">{score}</span> / {questions.length}
            </h3>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4 sm:space-y-6">
          {answers.map((a, i) => {
            const q = questions.find(q => q.text === a.question);
            const correct = q?.correctAnswer === a.answer;
            return (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold text-gray-600">
                      {i + 1}
                    </div>
                    <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-800 leading-relaxed">
                      {a.question}
                    </h4>
                  </div>
                  
                  <div className="ml-9 sm:ml-11 space-y-2 sm:space-y-3">
                    <div className="text-sm sm:text-base text-gray-600">
                      <span className="font-medium">Your answer:</span>{" "}
                      <span className={correct ? "text-green-600" : "text-red-600"}>
                        {a.answer}
                      </span>
                    </div>
                    
                    <div className="text-sm sm:text-base text-gray-600">
                      <span className="font-medium">Correct answer:</span>{" "}
                      <span className="text-green-600">{q?.correctAnswer}</span>
                    </div>
                    
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm sm:text-base font-medium ${
                      correct 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      <span>{correct ? "✔" : "✘"}</span>
                      <span>{correct ? "Correct" : "Wrong"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Result;