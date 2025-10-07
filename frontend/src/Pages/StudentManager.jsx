import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router";
import { auth, db } from "../firebase";
import { FiUsers, FiUpload, FiCheck, FiAlertCircle, FiDownload, FiTrash2, FiUserCheck, FiArrowLeft } from "react-icons/fi";

const StudentManager = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [existingStudents, setExistingStudents] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load existing students from user's subcollection
  const loadExistingStudents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const studentsRef = collection(db, "users", user.uid, "students");
      const snapshot = await getDocs(studentsRef);
      const studentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExistingStudents(studentsList);
      console.log(`✅ Loaded ${studentsList.length} existing students`);
    } catch (error) {
      console.error("❌ Error loading students:", error);
      setError("Failed to load existing students");
    } finally {
      setLoading(false);
    }
  };

  // Delete a student from database
  const deleteStudent = async (studentId) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "students", studentId));
      setExistingStudents(prev => prev.filter(s => s.id !== studentId));
      console.log("✅ Student deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting student:", error);
      setError("Failed to delete student");
    }
  };

  // Load students when user is available
  useEffect(() => {
    if (user) {
      loadExistingStudents();
    }
  }, [user]);

  // Extract students from PDF using backend API
  const uploadPdfToBackend = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // Use the student extraction API endpoint
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? '/api/extract-students' 
      : 'http://127.0.0.1:5000/api/extract-students';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle different response formats
      if (result.students) {
        return result.students;
      } else if (Array.isArray(result)) {
        return result;
      } else if (result.data && Array.isArray(result.data)) {
        return result.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Backend API error:', error);
      
      // If it's a network error and we're in development, provide helpful message
      if (error.message.includes('fetch') && process.env.NODE_ENV !== 'production') {
        throw new Error('Unable to connect to backend server. Please ensure the Flask backend is running on http://127.0.0.1:5000');
      }
      
      throw error;
    }
  };

  // Handle student PDF upload and extraction
  const handleStudentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setUploadedFileName(file.name);

    try {
      console.log('📄 Uploading student PDF:', file.name);
      
      // Use the real PDF extraction API
      const extractedStudents = await uploadPdfToBackend(file);
      
      // Validate that we received student data
      if (!extractedStudents || extractedStudents.length === 0) {
        throw new Error('No student data found in the PDF. Please ensure your PDF contains student information in one of these formats:\n\n' +
          '📊 TABULAR FORMAT (Most Common):\n' +
          '• Excel spreadsheet exported/printed as PDF\n' +
          '• Table with headers like "Roll No", "Name", "Email", "Department"\n' +
          '• CSV file converted to PDF\n\n' +
          '📝 TEXT FORMAT:\n' +
          '• Roll No: 2021CS001, Name: John Doe, Email: john@example.com\n' +
          '• Student data separated by | or tabs\n\n' +
          '💡 TIP: Most college Excel sheets work perfectly when saved as PDF!');
      }
      
      // Validate student data structure
      const validStudents = extractedStudents.map((student, index) => {
        // Ensure each student has required fields
        if (!student.rollNumber && !student.roll_number && !student.rollNo) {
          throw new Error(`Student at position ${index + 1} is missing roll number`);
        }
        if (!student.name && !student.student_name) {
          throw new Error(`Student at position ${index + 1} is missing name`);
        }
        
        // Normalize the student data structure
        return {
          rollNumber: student.rollNumber || student.roll_number || student.rollNo || '',
          name: student.name || student.student_name || '',
          email: student.email || student.email_address || '',
          department: student.department || student.dept || '',
          year: student.year || student.academic_year || '',
          class: student.class || student.course || '',
          division: student.division || student.div || student.section || ''
        };
      });

      setStudents(validStudents);
      console.log('✅ Successfully extracted students:', validStudents.length);

    } catch (error) {
      console.error('❌ Student extraction error:', error);
      setError(error.message || 'Failed to extract student data. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Save students to database
  const handleSaveStudents = async () => {
    if (!user || students.length === 0) {
      setError("No students to save or user not authenticated");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Save each student to user-specific subcollection: users/{userId}/students
      const savePromises = students.map(student => 
        addDoc(collection(db, "users", user.uid, "students"), {
          ...student,
          createdAt: new Date(),
          active: true,
          uploadedAt: new Date(),
          uploadedFileName: uploadedFileName
        })
      );

      await Promise.all(savePromises);
      
      setSuccess(`✅ Successfully saved ${students.length} students to your database!`);
      console.log('✅ Students saved to user database');
      
      // Reload the existing students list
      await loadExistingStudents();
      
      // Clear the form
      setTimeout(() => {
        setStudents([]);
        setUploadedFileName("");
        setSuccess("");
      }, 3000);

    } catch (error) {
      console.error('❌ Error saving students:', error);
      setError('Failed to save students to database. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Mobile: Back Button at Top */}
        <div className="flex justify-start w-full mb-2 sm:hidden">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 touch-manipulation"
          >
            <FiArrowLeft className="h-8 w-8 text-gray-600" />
          </button>
        </div>

        {/* Mobile: Centered Header */}
        <div className="flex flex-col items-center text-center mb-4 sm:hidden">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-2 shadow-lg">
            <FiUsers className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-800">Student Manager</h1>
        </div>

        {/* Desktop: Enhanced Header */}
        <div className="hidden sm:block text-center mb-6">
          {/* Desktop Back Button */}
          <div className="flex justify-start mb-6">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-3 shadow-lg">
            <FiUsers className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Student Manager
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Streamline your student management by uploading PDF files containing student details. 
            Our system will extract and organize the data automatically.
          </p>
          
          {/* Format Help */}
          <div className="mt-4 max-w-2xl mx-auto">
            <details className="bg-blue-50 rounded-lg p-4 text-left">
              <summary className="text-blue-700 font-medium cursor-pointer text-sm">
                📋 Supported PDF formats (click to expand)
              </summary>
              <div className="mt-3 text-xs text-blue-600 space-y-2">
                <div>
                  <p className="font-semibold text-blue-700">✅ Tabular Format (Most Common):</p>
                  <p>• <strong>College Excel format:</strong> Roll No | First Name | Last Name | Academic Year | Class | Div</p>
                  <p>• <strong>With/without department:</strong> Automatically handles missing department columns</p>
                  <p>• <strong>CSV exported as PDF:</strong> Any comma, tab, or pipe-separated columns</p>
                  <p>• <strong>Any table structure</strong> with student data in rows and columns</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-700">✅ Text Format:</p>
                  <p>• <strong>Comma-separated:</strong> Roll No: 301, Name: Ritu Nair, Year: 2025-26</p>
                  <p>• <strong>Pipe-separated:</strong> 301 | Ritu Nair | 2025-26 | BA | A</p>
                  <p>• <strong>Space-separated:</strong> Roll number followed by student name</p>
                </div>
                <div>
                  <p className="font-semibold text-green-700">💡 Tip:</p>
                  <p>Your exact format works perfectly! Just export your Excel file as PDF.</p>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Mobile: Simple description */}
        <div className="sm:hidden mb-4 text-center">
          <p className="text-gray-600 text-sm">
            Upload PDF files with student data for automatic extraction and database storage.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <FiUserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{existingStudents.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <FiUpload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Upload Status</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{uploadedFileName ? "Ready" : "Pending"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <FiDownload className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Database Status</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{success ? "Saved" : "Not Saved"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUpload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Upload Student Details</h2>
          </div>
          
          <div className="relative">
            <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 ${
              uploading 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
            }`}>
              
              <div className="mb-4 sm:mb-6">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4 ${
                  uploading ? 'bg-blue-500' : 'bg-gray-100'
                } transition-colors duration-300`}>
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FiUpload className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {uploading ? 'Processing PDF...' : 'Upload Student Details PDF'}
                </h3>
                
                <p className="text-gray-600 text-sm sm:text-base mb-6">
                  {uploading 
                    ? 'Extracting student data from your PDF file'
                    : 'Drop your PDF here or click to browse (Max 10MB)\nExcel sheets converted to PDF work perfectly!'
                  }
                </p>
              </div>
              
              <input
                type="file"
                accept=".pdf"
                onChange={handleStudentUpload}
                disabled={uploading}
                className="hidden"
                id="student-pdf-upload"
              />
              
              <label
                htmlFor="student-pdf-upload"
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                  uploading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed scale-100' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white cursor-pointer shadow-lg hover:shadow-xl'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent"></div>
                    Processing PDF...
                  </>
                ) : (
                  <>
                    <FiUpload className="h-5 w-5" />
                    Choose PDF File
                  </>
                )}
              </label>
              
              {uploadedFileName && !uploading && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200">
                  <FiCheck className="h-4 w-4" />
                  <span className="font-medium">{uploadedFileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Error/Success Messages */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
              <div className="p-1 bg-red-100 rounded-full">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Upload Error</h4>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fadeIn">
              <div className="p-1 bg-green-100 rounded-full">
                <FiCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-1">Success!</h4>
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Students Preview */}
        {students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiUsers className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Extracted Students
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {students.length} student{students.length !== 1 ? 's' : ''} found in the PDF
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStudents([])}
                  className="inline-flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors duration-200"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Clear
                </button>
                
                <button
                  onClick={handleSaveStudents}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiDownload className="h-4 w-4" />
                      Save to Database
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Roll Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Student Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Email Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Academic Year
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Class
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Division
                      </th>
                      {students.some(s => s.department) && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                          Department
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {student.rollNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{student.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{student.year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.class ? (
                            <span className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {student.class}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.division ? (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {student.division}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>
                        {students.some(s => s.department) && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.department ? (
                              <span className="inline-flex px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                {student.department}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your students database...</p>
          </div>
        )}

        {/* Existing Students from Database */}
        {!loading && existingStudents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiUserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Your Students Database</h2>
              </div>
              <div className="text-sm text-gray-500">
                {existingStudents.length} student{existingStudents.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Academic Year
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      {existingStudents.some(s => s.division) && (
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Division
                        </th>
                      )}
                      {existingStudents.some(s => s.department) && (
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                      )}
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {existingStudents.map((student, index) => (
                      <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {student.rollNo}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.academicYear || 'N/A'}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            {student.class}
                          </span>
                        </td>
                        {existingStudents.some(s => s.division) && (
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {student.division ? (
                              <span className="inline-flex px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                {student.division}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                        )}
                        {existingStudents.some(s => s.department) && (
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {student.department ? (
                              <span className="inline-flex px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                {student.department}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                        )}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => deleteStudent(student.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                            title="Delete student"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {students.length === 0 && existingStudents.length === 0 && !loading && !uploading && !uploadedFileName && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FiUsers className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Upload a PDF file containing student details to get started with managing your student database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManager;