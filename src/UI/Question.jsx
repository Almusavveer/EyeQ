import React from "react";

const Question = ({ text, options }) => {
  return (
    <div>
      <h3>{text}</h3>
      <ol>
        {options.map((opt, i) => (
          <li key={i}>{opt}</li>
        ))}
      </ol>
    </div>
  );
};

export default Question;