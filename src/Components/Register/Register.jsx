import RegisterFom from "../../UI/RegisterForm"
import Option from "../../UI/Option"
import { useState } from "react";
import Welcome from "../../UI/Welcome";

const Register = ({ screen, setScreen }) => {
  const [error, setError] = useState();
  return (
    <div>
      <Welcome screen={screen} setScreen={setScreen} />
      <RegisterFom error={error} setError={setError}/>
      <Option error={error} setError={setError}/>
    </div>
  )
}
export default Register