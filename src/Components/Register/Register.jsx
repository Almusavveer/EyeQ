import RegisterFom from "../../UI/RegisterForm"
import Option from "../../UI/Option"
import { useState } from "react";

const Register = () => {
  const [error, setError] = useState();
  return (
    <div>
      <RegisterFom error={error} setError={setError}/>
      <Option error={error} setError={setError}/>
    </div>
  )
}
export default Register