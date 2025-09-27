import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "../Context/AuthContext";
import { db } from "../firebase";
import Nav from "../Components/Home/Nav";
import Card from "../UI/Card";
import { FiPlus, FiLoader, FiUsers } from "react-icons/fi";

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
          where("createdBy", "==", user.uid),
          orderBy("createdAt", "desc")
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
    <div className="flex h-fit gap-3 sm:gap-5 flex-col p-2 sm:p-0">
      <Nav />
      
      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          className="w-full font-bold cursor-pointer rounded-lg bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 py-3 sm:py-4 transition-colors duration-200 touch-manipulation text-sm sm:text-base"
          onClick={() => navigate("/exambuilder")}
        >
          <FiPlus className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Create New Exam
        </button>
        
        <button
          className="w-full font-bold cursor-pointer rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-3 sm:py-4 transition-colors duration-200 touch-manipulation text-sm sm:text-base"
          onClick={() => navigate("/students")}
        >
          <FiUsers className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Manage Students
        </button>
      </div>
      
      <div className="flex h-[80vh] sm:h-[80%] flex-col gap-3 sm:gap-4 overflow-y-auto px-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2" />
            <span className="text-sm sm:text-base">Loading exams...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p className="text-sm sm:text-base">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 underline text-sm sm:text-base touch-manipulation"
            >
              Try again
            </button>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm sm:text-base">No exams found. Create your first exam!</p>
          </div>
        ) : (
          exams.map((exam) => (
            <Card
              key={exam.id}
              examTitle={exam.examTitle}
              examDate={exam.examDate || exam.examTime}
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
