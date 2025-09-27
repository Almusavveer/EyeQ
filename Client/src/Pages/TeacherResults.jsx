import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../Context/AuthContext';
import { FiArrowLeft, FiDownload, FiUser, FiCalendar, FiClock } from 'react-icons/fi';

const TeacherResults = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamResults = async () => {
      if (!user || !examId) return;
      
      try {
        // Fetch exam details
        const examRef = doc(db, 'examDetails', examId);
        const examSnap = await getDoc(examRef);
        
        if (!examSnap.exists()) {
          setError('Exam not found');
          return;
        }
        
        const exam = examSnap.data();
        
        // Check if current user is the exam creator
        if (exam.createdBy !== user.uid) {
          setError('You are not authorized to view these results');
          return;
        }
        
        setExamData(exam);
        
        // Fetch student results (this would need to be implemented based on your data structure)
        // For now, showing placeholder structure
        const resultsRef = collection(db, 'examResults', examId, 'submissions');
        const resultsSnap = await getDocs(resultsRef);
        
        const results = [];
        resultsSnap.forEach((doc) => {
          results.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setStudentResults(results);
        
      } catch (err) {
        console.error('Error fetching exam results:', err);
        setError('Failed to load exam results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamResults();
  }, [user, examId]);

  const calculateScore = (answers, questions) => {
    if (!answers || !questions) return 0;
    return answers.reduce((score, answer) => {
      const question = questions.find(q => q.text === answer.question);
      return question && question.correctAnswer === answer.answer ? score + 1 : score;
    }, 0);
  };

  const exportResults = () => {
    // Implement CSV export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Student Name,Roll Number,Score,Total Questions,Percentage,Submission Time\n" +
      studentResults.map(result => 
        `${result.studentName || 'N/A'},${result.rollNumber || 'N/A'},${calculateScore(result.answers, examData?.questions)},${examData?.questions?.length || 0},${((calculateScore(result.answers, examData?.questions) / (examData?.questions?.length || 1)) * 100).toFixed(1)}%,${new Date(result.submittedAt?.toDate?.() || result.submittedAt).toLocaleString()}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${examData?.examTitle || 'exam'}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/home')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{examData?.examTitle}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center">
                    <FiCalendar className="h-4 w-4 mr-1" />
                    {new Date(examData?.examTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <FiClock className="h-4 w-4 mr-1" />
                    {examData?.examDuration} minutes
                  </div>
                  <div className="flex items-center">
                    <FiUser className="h-4 w-4 mr-1" />
                    {studentResults.length} submissions
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={exportResults}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <FiDownload className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Submissions</h3>
            <p className="text-3xl font-bold text-blue-600">{studentResults.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Score</h3>
            <p className="text-3xl font-bold text-green-600">
              {studentResults.length > 0 
                ? (studentResults.reduce((sum, result) => sum + calculateScore(result.answers, examData?.questions), 0) / studentResults.length).toFixed(1)
                : '0'
              }
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Pass Rate</h3>
            <p className="text-3xl font-bold text-purple-600">
              {studentResults.length > 0
                ? (studentResults.filter(result => 
                    (calculateScore(result.answers, examData?.questions) / (examData?.questions?.length || 1)) >= 0.6
                  ).length / studentResults.length * 100).toFixed(0)
                : '0'
              }%
            </p>
          </div>
        </div>

        {/* Student Results Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Student Results</h2>
          </div>
          
          {studentResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No submissions yet</p>
              <p className="text-sm mt-2">Student results will appear here once they complete the exam</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentResults.map((result, index) => {
                    const score = calculateScore(result.answers, examData?.questions);
                    const total = examData?.questions?.length || 0;
                    const percentage = total > 0 ? (score / total * 100).toFixed(1) : '0';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.studentName || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.rollNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{score}/{total}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(result.submittedAt?.toDate?.() || result.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            className="text-blue-600 hover:text-blue-900 font-medium"
                            onClick={() => {
                              // Implement detailed view functionality
                              console.log('View detailed results for:', result);
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherResults;