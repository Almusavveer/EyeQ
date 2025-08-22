import LoginFom from "../../UI/LoginFom";
import Option from "../../UI/Option";

const Login = () => {
  return (
    <div>
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
