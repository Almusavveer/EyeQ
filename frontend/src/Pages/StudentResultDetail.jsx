import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiCalendar, FiTarget, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const StudentResultDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, examData } = location.state || {};

  const [detailedAnswers, setDetailedAnswers] = useState([]);

  useEffect(() => {
    if (result && examData?.questions) {
      // Create detailed answer breakdown
      const answers = result.answers || [];
      const detailed = examData.questions.map((question, index) => {
        const studentAnswer = answers[index];
        const options = question.options || [];

        // Convert student answer (number) to option id for comparison
        const studentAnswerId = studentAnswer !== null && studentAnswer !== undefined ? studentAnswer : null;

        // Determine correct answer id (could be index, letter, or text)
        let correctAnswerId = question.correctAnswer;

        if (correctAnswerId === null || correctAnswerId === undefined) {
          correctAnswerId = null;
        } else if (typeof correctAnswerId === 'number') {
          // Already an index
          correctAnswerId = correctAnswerId;
        } else if (typeof correctAnswerId === 'string' && correctAnswerId.length === 1 && correctAnswerId.match(/[A-D]/i)) {
          // Letter like "A", "B", etc.
          correctAnswerId = correctAnswerId.toUpperCase().charCodeAt(0) - 65;
        } else {
          // Try to find the matching option by text
          const foundIndex = options.findIndex(opt => {
            const optText = typeof opt === 'string' ? opt : (opt.text || opt);
            return optText && correctAnswerId && optText.trim().toLowerCase() === correctAnswerId.toString().trim().toLowerCase();
          });
          correctAnswerId = foundIndex >= 0 ? foundIndex : null;
        }

        const isCorrect = studentAnswerId === correctAnswerId;
        const isAttempted = studentAnswerId !== null;

        return {
          questionNumber: index + 1,
          questionText: question.question || question.text || '',
          studentAnswer: studentAnswerId,
          correctAnswer: correctAnswerId,
          isCorrect,
          isAttempted,
          options: (options || []).map((opt, optIndex) => ({
            id: optIndex,
            text: opt.text || opt,
            letter: String.fromCharCode(65 + optIndex)
          }))
        };
      });
      setDetailedAnswers(detailed);
    }
  }, [result, examData]);

  if (!result || !examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">No result data found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const score = detailedAnswers.filter(ans => ans.isCorrect).length;
  const totalQuestions = detailedAnswers.length;
  const attemptedQuestions = detailedAnswers.filter(ans => ans.isAttempted).length;
  const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <FiArrowLeft className="h-5 w-5" />
              <span>Back to Results</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{examData.examTitle}</h1>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <FiUser className="h-4 w-4 mr-2" />
                  <span><strong>Student:</strong> {result.studentName || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span><strong>Roll Number:</strong> {result.rollNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2" />
                  <span><strong>Submitted:</strong> {new Date(result.submittedAt?.toDate?.() || result.submittedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{score}/{totalQuestions}</div>
                <div className="text-sm text-blue-800">Score</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{percentage}%</div>
                <div className="text-sm text-green-800">Percentage</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{attemptedQuestions}</div>
                <div className="text-sm text-purple-800">Attempted</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">{totalQuestions - attemptedQuestions}</div>
                <div className="text-sm text-gray-800">Unattempted</div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Question Breakdown</h2>

          {detailedAnswers.map((answer, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    answer.isCorrect
                      ? 'bg-green-100 text-green-700'
                      : answer.isAttempted
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {answer.questionNumber}
                  </div>
                  <div className="flex items-center space-x-2">
                    {answer.isCorrect ? (
                      <FiCheckCircle className="h-5 w-5 text-green-600" />
                    ) : answer.isAttempted ? (
                      <FiXCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <FiTarget className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      answer.isCorrect
                        ? 'text-green-700'
                        : answer.isAttempted
                          ? 'text-red-700'
                          : 'text-gray-500'
                    }`}>
                      {answer.isCorrect
                        ? 'Correct'
                        : answer.isAttempted
                          ? 'Incorrect'
                          : 'Not Attempted'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">
                  {answer.questionText}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Your Answer:</h4>
                    <div className={`p-3 rounded-lg border ${
                      answer.isCorrect
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : answer.isAttempted
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}>
                      {answer.isAttempted && answer.studentAnswer !== null && answer.options[answer.studentAnswer]
                        ? `${String.fromCharCode(65 + answer.studentAnswer)}. ${answer.options[answer.studentAnswer].text}`
                        : 'Not answered'
                      }
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Correct Answer:</h4>
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
                      {answer.correctAnswer !== null && answer.correctAnswer !== undefined && answer.options && answer.options[answer.correctAnswer]
                        ? `${String.fromCharCode(65 + answer.correctAnswer)}. ${answer.options[answer.correctAnswer].text}`
                        : 'Not specified'
                      }
                    </div>
                  </div>
                </div>

                {/* Show all options */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">All Options:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {answer.options && answer.options.length > 0 ? (
                      answer.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded border text-sm ${
                            optIndex === answer.correctAnswer
                              ? 'bg-green-50 border-green-300 text-green-800'
                              : optIndex === answer.studentAnswer && answer.isAttempted
                                ? 'bg-red-50 border-red-300 text-red-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option.text || 'No option text'}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm p-2">No options available for this question</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentResultDetail;
