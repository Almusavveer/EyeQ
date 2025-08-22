import { Route, Routes } from "react-router";
import Login from "../Components/Login/Login";
import Register from "../Components/Register/Register";
import Home from "../Pages/Home";
import HomePage from "../Pages/HomePage";
import { useState } from "react";

const AppRoutes = () => {
  const [screen, setScreen] = useState("Login");
  return (
    <Routes>
      <Route path="/" element={<HomePage screen={screen} setScreen={setScreen}/>} />
      <Route path="/login" element={<Login screen={screen} setScreen={setScreen}/>} />
      <Route path="/register" element={<Register screen={screen} setScreen={setScreen}/>} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
};
export default AppRoutes;
