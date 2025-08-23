import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { auth, db } from "../firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router";

const RegisterFom = ({error, setError}) => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        role: 'teacher',
        createdAt: serverTimestamp(),
      });

      navigate("/home", {replace: true}); // redirect to login
      // console.log("successfull");
      
    } catch (err) {
      setError("Looks like this email is already in use. Want to log in instead?");
    }
  };
  return (
    <div>
      <form
        action=""
        className="flex h-96 flex-col justify-around"
        onSubmit={handleSubmit}
      >
        <label htmlFor="fullname" className="flex flex-col gap-2">
          Full Name
          <input
            type="text"
            id="fullname"
            value={name}
            onChange={({ target }) => setName(target.value)}
            className="w-full rounded-full border border-gray-200 bg-[#fbfbfb] px-4 py-2 outline-none"
            placeholder="John Dee"
          />
        </label>
        <label htmlFor="email" className="flex flex-col gap-2">
          Email
          <input
            type="email"
            id="email"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            className="w-full rounded-full border border-gray-200 bg-[#fbfbfb] px-4 py-2 outline-none"
            placeholder="john@gmail.com"
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
              placeholder="john@1234"
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
export default RegisterFom;
