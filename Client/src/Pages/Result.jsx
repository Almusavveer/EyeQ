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
    <div>
      <h2>✅ Exam Completed</h2>
      <h3>Score: {score} / {questions.length}</h3>
      <ul>
        {answers.map((a, i) => {
          const q = questions.find(q => q.text === a.question);
          const correct = q?.correctAnswer === a.answer;
          return (
            <li key={i}>
              <strong>{a.question}</strong><br/>
              Your answer: {a.answer}<br/>
              Correct answer: {q?.correctAnswer}
              <div style={{color: correct ? "green" : "red"}}>
                {correct ? "✔ Correct" : "✘ Wrong"}
              </div>
              <hr/>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Result;