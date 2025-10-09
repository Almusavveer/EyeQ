import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../Components/Login/Login";
import Register from "../Components/Register/Register";
import Home from "../Pages/Home";
import HomePage from "../Pages/HomePage";
import ExamBuilder from "../Pages/ExamBuilder";
import ReviewEdit from "../Pages/ReviewEdit";
import ExamPage from "../Pages/ExamPage";
import StudentManager from "../Pages/StudentManager";
import TeacherResults from "../Pages/TeacherResults";
import ProtectedRoute from "../Components/ProtectedRoute";
import { useAuth } from "../Context/AuthContext";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/exam/:examId" element={<ExamPage />} />
      <Route path="/exam" element={<ExamPage />} />
      
      {/* Authentication routes - redirect to home if already logged in */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/home" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/home" replace /> : <Register />} 
      />
      
      {/* Protected routes - require authentication */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/exambuilder" 
        element={
          <ProtectedRoute>
            <ExamBuilder />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/students" 
        element={
          <ProtectedRoute>
            <StudentManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/review/:examId" 
        element={
          <ProtectedRoute>
            <ReviewEdit />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/review" 
        element={
          <ProtectedRoute>
            <ReviewEdit />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/results/:examId" 
        element={
          <ProtectedRoute>
            <TeacherResults />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};
export default AppRoutes;
