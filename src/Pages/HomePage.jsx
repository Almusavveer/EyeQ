import { useEffect } from "react";
import Welcome from "../UI/Welcome";
import { useNavigate } from "react-router";

const HomePage = ({ screen, setScreen }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (screen === "Login") {
      navigate("/login");
    } else {
      navigate("/register");
    }
  }, [screen, navigate]);
  return (
    <div className="flex h-full w-full flex-col justify-center">
      <Welcome screen={screen} setScreen={setScreen} />
    </div>
  );
};
export default HomePage;
