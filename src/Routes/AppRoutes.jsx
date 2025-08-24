import { Route, Routes } from "react-router";
import Login from "../Components/Login/Login";
import Register from "../Components/Register/Register";
import Home from "../Pages/Home";
import HomePage from "../Pages/HomePage";
import { useState } from "react";
import ExamBuilder from "../Pages/ExamBuilder";
import ReviewEdit from "../Pages/ReviewEdit";
import Role from "../Pages/Role";
import ExamPage from "../Pages/ExamPage";

const AppRoutes = () => {
  const [screen, setScreen] = useState("Login");
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/role" element={<Role />} />
      <Route path="/exam" element={<ExamPage />} />
      <Route
        path="/login"
        element={<Login screen={screen} setScreen={setScreen} />}
      />
      <Route
        path="/register"
        element={<Register screen={screen} setScreen={setScreen} />}
      />
      <Route path="/home" element={<Home />} />
      <Route path="/exambuilder" element={<ExamBuilder />} />
      <Route path="/review" element={<ReviewEdit />} />
    </Routes>
  );
};
export default AppRoutes;
