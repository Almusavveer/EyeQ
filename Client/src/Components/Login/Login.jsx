import { useState } from "react";
import LoginFom from "../../UI/LoginFom";
import Option from "../../UI/Option";
import Welcome from "../../UI/Welcome";
import { useNavigate } from "react-router";

const Login = () => {
  const [error, setError] = useState();
  const naviagate = useNavigate();
  return (
    <div>
      <Welcome />
      <LoginFom />
      <Option error={error} setError={setError} />
      <p className="w-full text-center text-gray-400">
        Dont have an account?{" "}
        <button
          className="cursor-pointer font-bold text-black"
          onClick={() => {
            naviagate("/register");
          }}
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;
