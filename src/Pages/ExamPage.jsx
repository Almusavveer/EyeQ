import React, { useEffect, useState } from "react";
import { QUESTIONS } from "../data";
import Question from "../UI/Question";
import SpeechButton from "../UI/SpeechButton";
import ConfirmAnswer from "../Components/ConfirmAnswer";
import AnswerList from "../Components/AnswerList";
import Result from "./Result";

const ExamPage = () => {
  const [questions] = useState(QUESTIONS);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!finished && questions[current]) speakQuestion(questions[current]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, finished]);

  const speakQuestion = (q) => {
    if (!q) return;
    const u = new SpeechSynthesisUtterance(
      `${q.text}. Options are: ${q.options.join(", ")}`
    );
    window.speechSynthesis.speak(u);
  };

  // Interpret speech (option number, ordinal, or text)
  const interpret = (speech, q) => {
    const ans = speech.toLowerCase().trim();
    let match = null;

    q.options.forEach((opt, idx) => {
      const n = idx + 1;
      const keys = [
        `option ${n}`, `choice ${n}`, `${n}`, opt.toLowerCase()
      ];
      if (n === 1) keys.push("first");
      if (n === 2) keys.push("second");
      if (n === 3) keys.push("third");
      if (n === 4) keys.push("fourth");
      if (keys.some(k => ans.includes(k))) match = opt;
    });

    return match || speech;
  };

  const onSpeech = (spoken) => {
    const q = questions[current];
    if (!q) return;

    const lower = spoken.toLowerCase();
    if (lower.includes("repeat")) {
      speakQuestion(q);
      return;
    }

    setPendingAnswer(interpret(spoken, q));
  };

  const confirmAnswer = () => {
    const q = questions[current];
    const nextAnswers = [...answers, { question: q.text, answer: pendingAnswer }];
    setAnswers(nextAnswers);
    setPendingAnswer(null);

    const next = current + 1;
    if (next < questions.length) setCurrent(next);
    else setFinished(true);
  };

  const rejectAnswer = () => {
    setPendingAnswer(null);
    speakQuestion(questions[current]);
  };

  if (finished) {
    return <Result answers={answers} questions={questions} />;
  }

  const q = questions[current];

  return (
    <div>
      <h2>Exam</h2>

      {q && !pendingAnswer && (
        <>
          <Question text={q.text} options={q.options} />
          <SpeechButton onResult={onSpeech} />
        </>
      )}

      {pendingAnswer && (
        <ConfirmAnswer
          answer={pendingAnswer}
          onConfirm={confirmAnswer}
          onReject={rejectAnswer}
        />
      )}

      <AnswerList answers={answers} />
    </div>
  );
};

export default ExamPage;