import { useEffect, useRef } from "react";

const ConfirmAnswer = ({ answer, onConfirm, onReject }) => {
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!answer) return;
    if (finishedRef.current) return;

    finishedRef.current = false;

    const utter = new window.SpeechSynthesisUtterance(
      `You said ${answer}. Do you want to confirm? Say yes or no.`
    );
    utter.onend = startListening;
    window.speechSynthesis.speak(utter);

    // Auto start listening after speaking (lines 14-17)
    // Listening will start after speech synthesis finishes (handled by utter.onend)
    // If you want to start listening immediately, uncomment the next line:
    startListening();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      finishedRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

  const startListening = () => {
    if (finishedRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition API is not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      if (!e.results || !e.results[0] || !e.results[0][0]) {
        retry();
        return;
      }
      const heard = e.results[0][0].transcript.toLowerCase();
      if (heard.includes("yes")) {
        finishedRef.current = true;
        rec.stop();
        onConfirm();
      } else if (heard.includes("no")) {
        finishedRef.current = true;
        rec.stop();
        onReject();
      } else {
        rec.stop();
        retry();
      }
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
    if (finishedRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const u = new window.SpeechSynthesisUtterance(
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
        <button onClick={() => { finishedRef.current = true; onConfirm(); }}>✅ Yes</button>{" "}
        <button onClick={() => { finishedRef.current = true; onReject(); }}>❌ No</button>
      </div>
    </div>
  );
};

export default ConfirmAnswer;