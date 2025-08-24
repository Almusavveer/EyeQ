import React from "react";

const AnswerList = ({ answers }) => (
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

export default AnswerList;