import { useState } from "react";
import Welcome from "../UI/Welcome";
import Login from "../Components/Login/Login";
import Register from "../Components/Register/Register";
import { useNavigate } from "react-router";

const HomePage = () => {
  const [screen, setScreen] = useState("Login");
  const navigate = useNavigate()
  return (
    <div className="flex h-full w-full flex-col justify-center">
      <Welcome screen={screen} setScreen={setScreen} />
      {screen === "Login" ? <Login /> : <Register />}
    </div>
  );
};
export default HomePage;
