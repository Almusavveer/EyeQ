const Card = () => {
  return (
    <div className="w-full border p-3 border-gray-200 rounded-lg flex flex-col">
      <h1 className="text-lg font-bold">Exam Title</h1>
      <p className="text-gray-400">March 5, 2024</p>
      <p className="text-gray-400">link of the exam</p>
      <div className="flex items-center justify-between mt-3">
        <button className="w-[48%] border p-1 border-gray-300 font-bold text-lg rounded-md cursor-pointer">View Results</button>
        <button className="w-[48%] border p-1 border-gray-300 font-bold text-lg rounded-md cursor-pointer">Copy Link</button>
      </div>
    </div>
  );
};
export default Card;
