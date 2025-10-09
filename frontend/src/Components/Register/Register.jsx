import RegisterFom from "../../UI/RegisterForm"
import Option from "../../UI/Option"
import { useState } from "react";
import Welcome from "../../UI/Welcome";

const Register = () => {
  const [error, setError] = useState();
  return (
    <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8">
        <Welcome />
        <RegisterFom error={error} setError={setError}/>
        <Option error={error} setError={setError}/>
      </div>
    </div>
  )
}
export default Register
