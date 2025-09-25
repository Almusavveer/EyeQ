import { FiSettings, FiUser } from "react-icons/fi";

const Nav = () => {
  return (
    <div className="flex h-fit w-full items-center justify-end gap-2 sm:gap-2.5 p-1 sm:p-0">
      <button className="size-8 sm:size-10 flex justify-center items-center cursor-pointer rounded-full bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500 p-1 sm:p-2 text-center transition-colors duration-200 touch-manipulation">
        <FiUser className="size-4 sm:size-5"/>
      </button>
      {/* <button className="size-8 sm:size-10 flex justify-center items-center cursor-pointer rounded-full bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500 p-1 sm:p-2 text-center transition-colors duration-200 touch-manipulation">
        <FiSettings className="size-4 sm:size-5"/>
      </button> */}
    </div>
  );
};
export default Nav;
