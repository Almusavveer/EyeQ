import { useNavigate } from "react-router";
import Nav from "../Components/Home/Nav";
import Card from "../UI/Card";
import { FiPlus } from "react-icons/fi";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-fit gap-5 flex-col">
      <Nav />
      <button
        className="w-full font-bold cursor-pointer rounded-lg bg-yellow-400 py-2"
        onClick={() => navigate("/exambuilder")}
      >
        Create New Exam
      </button>
      <div className="flex h-[80%] flex-col gap-4 overflow-y-scroll">
        <Card />
        <Card />
        <Card />
        {/* <Card />
        <Card />
        <Card /> */}
      </div>
    </div>
  );
};
export default Home;
