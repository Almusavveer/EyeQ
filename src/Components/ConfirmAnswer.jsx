import React, { useEffect, useRef } from "react";

const ConfirmAnswer = ({ answer, onConfirm, onReject }) => {
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!answer) return;

    const utter = new SpeechSynthesisUtterance(
      `You said ${answer}. Do you want to confirm? Say yes or no.`
    );
    utter.onend = startListening; // auto-start listening after TTS
    window.speechSynthesis.speak(utter);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      const heard = e.results[0][0].transcript.toLowerCase();
      if (heard.includes("yes")) onConfirm();
      else if (heard.includes("no")) onReject();
      else retry();
    };
    rec.onerror = retry;
    rec.onend = retry;

    recognitionRef.current = rec;
    rec.start();

    timeoutRef.current = setTimeout(() => {
      rec.stop();
      retry();
    }, 5000);
  };

  const retry = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const u = new SpeechSynthesisUtterance(
      `I didn't catch that. You said ${answer}. Please say yes or no.`
    );
    u.onend = startListening;
    window.speechSynthesis.speak(u);
  };

  if (!answer) return null;

  return (
    <div>
      <p>You said: <strong>{answer}</strong></p>
      {/* Optional manual buttons */}
      <div style={{ marginTop: 8 }}>
        <button onClick={onConfirm}>✅ Yes</button>{" "}
        <button onClick={onReject}>❌ No</button>
      </div>
    </div>
  );
};

export default ConfirmAnswer;