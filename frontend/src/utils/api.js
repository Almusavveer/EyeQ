/**
 * API utility functions for backend communication
 * All Firebase operations are now handled through backend APIs
 */

// Determine API base URL - prioritize local development, then environment variable, then production
const getApiBaseUrl = () => {
  // Check both possible environment variable names
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  
  // In development, check if local backend is preferred
  if (import.meta.env.DEV) {
    // Use local backend by default in development
    return envUrl || 'http://127.0.0.1:5000';
  }
  // In production, use environment variable or fallback to Render
  return envUrl || 'https://eyeq-backend-0wa9.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('🔗 API Base URL:', API_BASE_URL);

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Exam-related API calls
export const examAPI = {
  /**
   * Get exam details from backend
   */
  getExamDetails: async (examId) => {
    try {
      console.log(`📡 Fetching exam details for: ${examId}`);
      const response = await fetch(`${API_BASE_URL}/api/exam-details/${examId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await handleResponse(response);
      
      if (data.success) {
        console.log('✅ Exam details retrieved successfully');
        return data.exam;
      } else {
        throw new Error(data.message || 'Failed to get exam details');
      }
    } catch (error) {
      console.error('❌ Error fetching exam details:', error);
      throw error;
    }
  },

  /**
   * Submit exam results to backend
   */
  submitExamResults: async (resultData) => {
    try {
      console.log('📤 Submitting exam results...');
      const response = await fetch(`${API_BASE_URL}/api/submit-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultData),
      });
      
      const data = await handleResponse(response);
      
      if (data.success) {
        console.log('✅ Exam results submitted successfully');
        return data;
      } else {
        throw new Error(data.message || 'Failed to submit exam results');
      }
    } catch (error) {
      console.error('❌ Error submitting exam results:', error);
      throw error;
    }
  },

  /**
   * Get all exam results for teachers
   */
  getExamResults: async (examId = null) => {
    try {
      const url = examId 
        ? `${API_BASE_URL}/api/get-exam-results?examId=${examId}`
        : `${API_BASE_URL}/api/get-exam-results`;
      
      console.log('📡 Fetching exam results...');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await handleResponse(response);
      
      if (data.success) {
        console.log(`✅ Retrieved ${data.count} exam results`);
        return data.results;
      } else {
        throw new Error(data.message || 'Failed to get exam results');
      }
    } catch (error) {
      console.error('❌ Error fetching exam results:', error);
      throw error;
    }
  },

  /**
   * Get specific student exam result
   */
  getStudentResult: async (studentId, examId) => {
    try {
      console.log(`📡 Fetching result for student: ${studentId}, exam: ${examId}`);
      const response = await fetch(
        `${API_BASE_URL}/api/get-student-result?studentId=${studentId}&examId=${examId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await handleResponse(response);
      
      if (data.success) {
        console.log('✅ Student result retrieved successfully');
        return data.result;
      } else {
        console.log('ℹ️ No result found for this student and exam');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching student result:', error);
      throw error;
    }
  }
};

// Student-related API calls
export const studentAPI = {
  /**
   * Get student details from backend
   */
  getStudentDetails: async (creatorId, studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student-details/${creatorId}/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await handleResponse(response);
      
      if (data.success) {
        return data.student;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      throw error;
    }
  },

  /**
   * Get all students under a teacher
   */
  getStudents: async (teacherId) => {
    try {
      console.log(`📡 Fetching students for teacher: ${teacherId}`);
      const response = await fetch(`${API_BASE_URL}/api/students/${teacherId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await handleResponse(response);
      
      if (data.success) {
        console.log(`✅ Retrieved ${data.count} students`);
        return data.students;
      } else {
        throw new Error(data.message || 'Failed to get students');
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      throw error;
    }
  },

  /**
   * Add student under a teacher
   */
  addStudent: async (teacherId, studentData) => {
    try {
      console.log(`📤 Adding student for teacher: ${teacherId}`);
      const response = await fetch(`${API_BASE_URL}/api/students/${teacherId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      
      const data = await handleResponse(response);
      
      if (data.success) {
        console.log('✅ Student added successfully');
        return true;
      } else {
        throw new Error(data.message || 'Failed to add student');
      }
    } catch (error) {
      console.error('❌ Error adding student:', error);
      throw error;
    }
  },

  /**
   * Delete student from teacher's collection
   */
  deleteStudent: async (teacherId, studentId) => {
    try {
      console.log(`🗑️ Deleting student: ${studentId} for teacher: ${teacherId}`);
      const response = await fetch(`${API_BASE_URL}/api/students/${teacherId}/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await handleResponse(response);
      
      if (data.success) {
        console.log('✅ Student deleted successfully');
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete student');
      }
    } catch (error) {
      console.error('❌ Error deleting student:', error);
      throw error;
    }
  }
};

// User-related API calls
export const userAPI = {
  /**
   * Create user in backend
   */
  createUser: async (userData) => {
    try {
      console.log('📤 Creating user...');
      const response = await fetch(`${API_BASE_URL}/api/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await handleResponse(response);
      
      if (data.success) {
        console.log('✅ User created successfully');
        return true;
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  },

  /**
   * Get user from backend
   */
  getUser: async (userId) => {
    try {
      console.log(`📡 Fetching user: ${userId}`);
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await handleResponse(response);
      
      if (data.success) {
        console.log('✅ User retrieved successfully');
        return data.user;
      } else {
        console.log('ℹ️ User not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      throw error;
    }
  }
};

// PDF processing API calls (existing)
export const pdfAPI = {
  /**
   * Upload PDF and extract questions
   */
  uploadPDF: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📤 Uploading PDF for question extraction...');
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await handleResponse(response);
      console.log(`✅ Extracted ${data.count} questions from PDF`);
      return data;
    } catch (error) {
      console.error('❌ Error uploading PDF:', error);
      throw error;
    }
  },

  /**
   * Extract students from PDF
   */
  extractStudents: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📤 Uploading PDF for student extraction...');
      const response = await fetch(`${API_BASE_URL}/api/extract-students`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await handleResponse(response);
      console.log(`✅ Extracted ${data.count} students from PDF`);
      return data;
    } catch (error) {
      console.error('❌ Error extracting students:', error);
      throw error;
    }
  }
};

export default {
  examAPI,
  studentAPI,
  userAPI,
  pdfAPI
};