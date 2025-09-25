import { Route, Routes } from "react-router";
import Login from "../Components/Login/Login";
import Register from "../Components/Register/Register";
import Home from "../Pages/Home";
import HomePage from "../Pages/HomePage";
import ExamBuilder from "../Pages/ExamBuilder";
import ReviewEdit from "../Pages/ReviewEdit";
import Role from "../Pages/Role";
import ExamPage from "../Pages/ExamPage";
import StudentManager from "../Pages/StudentManager";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/role" element={<Role />} />
      <Route path="/exam/:examId" element={<ExamPage />} />
      <Route path="/exam" element={<ExamPage />} />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/register"
        element={<Register />}
      />
      <Route path="/home" element={<Home />} />
      <Route path="/exambuilder" element={<ExamBuilder />} />
      <Route path="/students" element={<StudentManager />} />
      <Route path="/review/:examId" element={<ReviewEdit />} />
      <Route path="/review" element={<ReviewEdit />} />
    </Routes>
  );
};
export default AppRoutes;
