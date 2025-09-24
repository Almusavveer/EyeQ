import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router";

const LoginFom = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home", { replace: true });
    } catch (error) {
      setError(
        "We couldn’t find an account with that email. Want to sign up instead?",
      );
    }
  };
  return (
    <div>
      <form
        action=""
        className="flex h-68 flex-col justify-around"
        onSubmit={handleSubmit}
      >
        <label htmlFor="email" className="flex flex-col gap-2">
          Email
          <input
            type="email"
            id="email"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            className="w-full rounded-full border border-gray-200 bg-[#fbfbfb] px-4 py-2 outline-none"
            placeholder="jon@gmail.com"
          />
        </label>
        <label htmlFor="password" className="flex flex-col gap-2">
          Password
          <div className="flex w-full items-center justify-between rounded-full border border-gray-200 bg-[#fbfbfb] px-4 py-2 outline-none">
            <input
              type={show ? "text" : "password"}
              id="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              className="w-[80%] outline-none"
              placeholder="jon@1234"
            />
            {show ? (
              <FiEye
                className="curser-pointer size-5 cursor-pointer"
                onClick={() => setShow(!show)}
              />
            ) : (
              <FiEyeOff
                className="curser-pointer size-5 cursor-pointer"
                onClick={() => setShow(!show)}
              />
            )}
          </div>
        </label>
        <div className="flex items-center justify-between">
          <label htmlFor="remember">
            <input type="checkbox" name="" id="remember" /> Remember Me
          </label>
          <span className="cursor-pointer text-gray-500">Forgot Password?</span>
        </div>
        <button className="w-full cursor-pointer rounded-full bg-yellow-400 py-2">
          Submit
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
export default LoginFom;
