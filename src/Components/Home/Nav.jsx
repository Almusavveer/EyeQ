import { FiSettings, FiUser } from "react-icons/fi";

const Nav = () => {
  return (
    <div className="flex h-fit w-full items-center justify-end gap-2.5">
      <button className="size-10 flex justify-center items-center  cursor-pointer rounded-full bg-yellow-300 p-2 text-center">
        <FiUser className="size-5.5"/>
      </button>
      <button className="size-10 cur flex justify-center items-center cursor-pointer rounded-full bg-yellow-300 p-2 text-center">
        <FiSettings className="size-5.5"/>
      </button>
    </div>
  );
};
export default Nav;
