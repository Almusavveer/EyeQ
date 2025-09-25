import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { QUESTIONS } from "../data";
import Question from "../UI/Question";
import SpeechButton from "../UI/SpeechButton";
import ConfirmAnswer from "../Components/ConfirmAnswer";
import AnswerList from "../Components/AnswerList";
import Result from "./Result";

const ExamPage = () => {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [finished, setFinished] = useState(false);
  
  // Verification states
  const [isVerified, setIsVerified] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Verification function
  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!rollNumber.trim()) {
      setVerificationError("Please enter your roll number");
      return;
    }

    setVerifying(true);
    setVerificationError("");

    try {
      console.log("🔍 Verifying student with roll number:", rollNumber);
      
      // First, fetch exam details to get the creator
      if (!examId) {
        setVerificationError("Invalid exam ID");
        setVerifying(false);
        return;
      }

      const examRef = doc(db, "examDetails", examId);
      const examSnap = await getDoc(examRef);

      if (!examSnap.exists()) {
        setVerificationError("Exam not found. Contact your faculty.");
        setVerifying(false);
        return;
      }

      const examData = examSnap.data();
      const creatorId = examData.createdBy;

      if (!creatorId) {
        setVerificationError("Unable to verify student. Contact your faculty.");
        setVerifying(false);
        return;
      }

      // Check if student exists in the exam creator's student list
      const studentsRef = collection(db, "users", creatorId, "students");
      const q = query(studentsRef, where("rollNumber", "==", rollNumber.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Student found in creator's database
        const studentData = querySnapshot.docs[0].data();
        console.log("✅ Student verified:", studentData);
        setIsVerified(true);
      } else {
        // Student not found
        console.log("❌ Student not found in exam creator's database");
        setVerificationError("You are not allowed for this exam. Contact your faculty.");
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      setVerificationError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // Fetch exam data if examId is provided and user is verified
  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) {
        console.log("ℹ️ No examId provided, using default questions");
        // No examId provided, use default questions
        setQuestions(QUESTIONS);
        setLoading(false);
        return;
      }

      // Only fetch data if user is verified
      if (!isVerified) {
        setLoading(false);
        return;
      }

      console.log("🔍 Fetching exam data for ID:", examId);
      try {
        setLoading(true);
        const examRef = doc(db, "examDetails", examId);
        const examSnap = await getDoc(examRef);

        if (examSnap.exists()) {
          const data = examSnap.data();
          console.log("✅ Fetched exam data:", data);
          console.log("✅ Questions from database:", data.questions);
          console.log("✅ First question structure:", data.questions?.[0]);
          setExamData(data);
          
          // Transform questions to match expected format
          const transformedQuestions = (data.questions || []).map(q => ({
            ...q,
            text: q.question, // Map 'question' to 'text'
            options: q.options && q.options.length > 0 ? q.options : [
              q.answer || "Answer not available",
              "Option B",
              "Option C", 
              "Option D"
            ] // Generate options if missing
          }));
          
          console.log("✅ Transformed questions:", transformedQuestions[0]);
          setQuestions(transformedQuestions);
        } else {
          console.log("❌ Exam document not found");
          setError("Exam not found");
          // Fallback to default questions
          setQuestions(QUESTIONS);
        }
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Failed to load exam");
        // Fallback to default questions
        setQuestions(QUESTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId, isVerified]);

  useEffect(() => {
    if (!loading && !finished && questions[current]) speakQuestion(questions[current]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, finished, loading]);

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

  // Show verification form if not verified and examId exists
  if (examId && !isVerified) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Student Verification</h1>
            <p className="text-sm sm:text-base text-gray-600">Please enter your roll number to access the exam</p>
          </div>
          
          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number
              </label>
              <input
                type="text"
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter your roll number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                disabled={verifying}
              />
            </div>
            
            {verificationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{verificationError}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-black font-bold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Verifying...
                </>
              ) : (
                "Verify & Start Exam"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-lg text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="text-center space-y-4">
          <p className="text-lg text-red-600">{error}</p>
          <p className="text-base text-gray-600">Please check the exam link and try again.</p>
        </div>
      </div>
    );
  }

  if (finished) {
    return <Result answers={answers} questions={questions} />;
  }
  console.log(current);

  const q = questions[current];
  return (
    <div className="flex h-full w-full flex-col gap-6 sm:gap-8 lg:gap-10 bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-600">
          {examData?.examTitle || "Exam"}
        </h1>
        <p className="text-sm sm:text-base text-gray-400">{questions.length} questions</p>
        {examData?.examDuration && (
          <p className="text-sm sm:text-base text-gray-400">Duration: {examData.examDuration} minutes</p>
        )}
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
