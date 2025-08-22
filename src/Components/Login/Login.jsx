import LoginFom from "../../UI/LoginFom";
import Option from "../../UI/Option";
import Welcome from "../../UI/Welcome";

const Login = ({ screen, setScreen }) => {
  return (
    <div>
      <Welcome screen={screen} setScreen={setScreen} />
      <LoginFom />
      <Option />
      <p className="w-full text-center text-gray-400">
        Dont have an account?{" "}
        <span className="cursor-pointer font-bold text-black">Sign up</span>
      </p>
    </div>
  );
};

export default Login;
