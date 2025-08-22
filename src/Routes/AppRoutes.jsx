import { Route, Routes } from "react-router";
import Login from "../Components/Login/Login";
import Register from "../Components/Register/Register";
import Home from "../Pages/Home";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};
export default AppRoutes;
