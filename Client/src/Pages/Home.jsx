import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";
import { db } from "../firebase";
import Nav from "../Components/Home/Nav";
import Card from "../UI/Card";
import { FiPlus, FiLoader } from "react-icons/fi";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's exams from Firebase
  useEffect(() => {
    const fetchExams = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const examsRef = collection(db, "examDetails");
        const q = query(
          examsRef,
          where("createdBy", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const examData = [];
        
        querySnapshot.forEach((doc) => {
          examData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Sort by createdAt on the client side (newest first)
        examData.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return bDate - aDate;
        });
        
        setExams(examData);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Failed to load exams");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchExams();
    }
  }, [user]);

  // Handle view results
  const handleViewResults = (examId) => {
    navigate(`/results/${examId}`);
  };

  // Show loading if auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FiLoader className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-fit gap-5 flex-col">
      <Nav />
      <button
        className="w-full font-bold cursor-pointer rounded-lg bg-yellow-400 hover:bg-yellow-500 py-2 transition-colors duration-200"
        onClick={() => navigate("/exambuilder")}
      >
        <FiPlus className="inline w-5 h-5 mr-2" />
        Create New Exam
      </button>
      
      <div className="flex h-[80%] flex-col gap-4 overflow-y-scroll">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="w-6 h-6 animate-spin mr-2" />
            <span>Loading exams...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 underline"
            >
              Try again
            </button>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No exams found. Create your first exam!</p>
          </div>
        ) : (
          exams.map((exam) => (
            <Card
              key={exam.id}
              examTitle={exam.examTitle}
              examDate={exam.examTime}
              examId={exam.id}
              onViewResults={handleViewResults}
              examDuration={exam.examDuration}
              createdAt={exam.createdAt}
            />
          ))
        )}
      </div>
    </div>
  );
};
export default Home;
