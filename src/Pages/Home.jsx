import Nav from "../Components/Home/Nav";
import Card from "../UI/Card";
import { FiPlus } from "react-icons/fi";

const Home = () => {
  return (
    <div className="flex h-[100%] flex-col justify-between">
      <Nav />
      <button
        className="w-full cursor-pointer rounded-lg bg-yellow-400 py-2"
        // onClick={""}
      >
        Create New Exam
      </button>
      <div className="flex h-[80%] flex-col gap-4 overflow-y-scroll">
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </div>
      <button className="flex h-fit w-full cursor-pointer items-center justify-end pr-2 z-10">
        <FiPlus className="size-10 rounded-full bg-yellow-300 p-2 text-center" />
      </button>
    </div>
  );
};
export default Home;
