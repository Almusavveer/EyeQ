import React from "react";

const AnswerList = () => {
  // Static demo data
  const answers = [
    { question: "What is Java?", answer: "A programming language" },
    { question: "2 + 2 = ?", answer: "4" },
    { question: "Capital of France?", answer: "Paris" },
  ];
  return (
    <div>
      <h4>Answered so far:</h4>
      <ul>
        {answers.map((a, i) => (
          <li key={i}>
            <strong>{a.question}</strong> → {a.answer}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnswerList;