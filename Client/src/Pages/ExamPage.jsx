import { useEffect, useState } from "react";
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
      `${q.text}. Options are: ${q.options.join(", ")}`,
    );
    window.speechSynthesis.speak(u);
  };

  // Interpret speech (option number, ordinal, or text)
  const interpret = (speech, q) => {
    const ans = speech.toLowerCase().trim();
    let match = null;

    q.options.forEach((opt, idx) => {
      const n = idx + 1;
      const keys = [`option ${n}`, `choice ${n}`, `${n}`, opt.toLowerCase()];
      if (n === 1) keys.push("first");
      if (n === 2) keys.push("second");
      if (n === 3) keys.push("third");
      if (n === 4) keys.push("fourth");
      if (keys.some((k) => ans.includes(k))) match = opt;
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
    const nextAnswers = [
      ...answers,
      { question: q.text, answer: pendingAnswer },
    ];
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
  console.log(current);

  const q = questions[current];
  return (
    <div className="flex h-full w-full flex-col gap-6 sm:gap-8 lg:gap-10 bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-600">Exam</h1>
        <p className="text-sm sm:text-base text-gray-400">{questions.length} questions</p>
      </div>
      
      {/* Question Navigation */}
      <div className="flex gap-3 sm:gap-4 lg:gap-5 overflow-auto pb-2">
        {questions.map((_, index) => (
          <div
            className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full flex-shrink-0 ${current === index ? "bg-[#FBC02D]" : "bg-gray-200"} text-sm sm:text-base lg:text-xl font-bold text-white transition-colors duration-200`}
            key={index}
          >
            {index + 1}
          </div>
        ))}
      </div>
      
      {q && !pendingAnswer && (
        <div className="flex-1 space-y-4 sm:space-y-6">
          <Question text={q.text} options={q.options} />
          <div className="flex justify-center">
            <SpeechButton onResult={onSpeech} />
          </div>
        </div>
      )}

      {pendingAnswer && (
        <div className="flex-1 flex items-center justify-center">
          <ConfirmAnswer
            answer={pendingAnswer}
            onConfirm={confirmAnswer}
            onReject={rejectAnswer}
          />
        </div>
      )}

      {/* <AnswerList answers={answers} /> */}
    </div>
  );
};

export default ExamPage;
