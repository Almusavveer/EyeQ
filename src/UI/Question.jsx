import React from "react";

const Question = ({ text, options }) => {
  const option = ["A", "B", "C", "D"];
  return (
    <div className="flex h-80 flex-col">
      <h1 className="text-center text-xl font-semibold">Q. {text}</h1>
      <ol className="mt-4 list-inside">
        {options.map((opt, i) => (

          <li key={i} className="mt-4 flex rounded-2xl gap-4 border-gray-300 shadow-md border px-5 py-3 items-center">
           <div className="w-8 text-white p-1 bg-yellow-500 items-center rounded-full font-semibold justify-center flex">
            {option[i]}  
           </div>
           {opt}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Question;
