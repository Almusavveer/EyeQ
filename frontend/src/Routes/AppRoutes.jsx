import { Route, Routes } from "react-router-dom";
import Login from "../Components/Login/Login";
import Register from "../Components/Register/Register";
import Home from "../Pages/Home";
import HomePage from "../Pages/HomePage";
import ExamBuilder from "../Pages/ExamBuilder";
import ReviewEdit from "../Pages/ReviewEdit";
import Role from "../Pages/Role";
import ExamPage from "../Pages/ExamPage";
import StudentManager from "../Pages/StudentManager";
import TeacherResults from "../Pages/TeacherResults";
import ExamSubmitted from "../Pages/ExamSubmitted";
import StudentResultDetail from "../Pages/StudentResultDetail";
import ProtectedRoute from "../Components/ProtectedRoute";
import PasteExamLink from "../Pages/PasteExamLink";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/role" element={<Role />} />
      <Route path="/exam/:examId" element={<ExamPage />} />
      <Route path="/paste-exam-link" element={<PasteExamLink />} />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/register"
        element={<Register />}
      />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/exambuilder" element={<ProtectedRoute><ExamBuilder /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><StudentManager /></ProtectedRoute>} />
      <Route path="/review/:examId" element={<ProtectedRoute><ReviewEdit /></ProtectedRoute>} />
      <Route path="/review" element={<ProtectedRoute><ReviewEdit /></ProtectedRoute>} />
      <Route path="/results/:examId" element={<ProtectedRoute><TeacherResults /></ProtectedRoute>} />
      <Route path="/exam-submitted" element={<ExamSubmitted />} />
      <Route path="/result-detail" element={<StudentResultDetail />} />
    </Routes>
  );
};
export default AppRoutes;
