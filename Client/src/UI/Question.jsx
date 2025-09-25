import React from "react";

const Question = ({ text, options }) => {
  const option = ["A", "B", "C", "D"];
  return (
    <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
      <h1 className="text-center text-base sm:text-lg lg:text-xl font-semibold text-gray-800 px-2">
        Q. {text}
      </h1>
      <ol className="space-y-3 sm:space-y-4">
        {options.map((opt, i) => (
          <li key={i} className="flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-gray-300 shadow-sm hover:shadow-md px-3 sm:px-5 py-3 sm:py-4 transition-shadow duration-200">
            <div className="w-7 h-7 sm:w-8 sm:h-8 text-white text-sm sm:text-base bg-yellow-500 rounded-full font-semibold flex items-center justify-center flex-shrink-0">
              {option[i]}  
            </div>
            <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{opt}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Question;
