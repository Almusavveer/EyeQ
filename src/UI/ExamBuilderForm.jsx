import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { db } from "../firebase";

const ExamBuilderForm = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const fileInputRef = useRef(null);

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = ({ target: { files } }) => {
    const file = files[0];
    console.log(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalDate = new Date(`${date}T${time}:00`);
      const examDateTs = Timestamp.fromDate(finalDate);

      await addDoc(collection(db, "examDetails"), {
        examTitle: title,
        examTime: examDateTs,
        examDuration: duration,
        createdAt: Timestamp.now()
      })

      console.log("Exam Created");
      
    } catch (error) {
        console.log(error.message);
        
    }
    console.log(title, date, time, duration);
    setTime("");
    setDuration("");
    setDate("");
    setTitle("");
  };
  return (
    <form
      action=""
      className="flex h-150 w-full flex-col justify-between"
      onSubmit={handleSubmit}
    >
      <div className="mt-4 flex h-22 w-full flex-col items-start justify-around">
        <h1 className="text-lg font-semibold">Exam Title</h1>
        <input
          type="text"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
          className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
          placeholder="Maths test"
        />
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex h-22 w-60 flex-col items-start justify-around">
          <h1 className="text-lg font-semibold">Exam Date</h1>
          <input
            type="date"
            value={date}
            onChange={({ target }) => setDate(target.value)}
            className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
            placeholder="Maths test"
          />
        </div>
        <div className="flex h-22 w-40 flex-col items-start justify-around">
          <h1 className="text-lg font-semibold">Exam Time</h1>
          <input
            type="time"
            value={time}
            onChange={({ target }) => setTime(target.value)}
            className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
            placeholder="Maths test"
          />
        </div>
      </div>
      <div className="flex h-22 w-full flex-col items-start justify-around">
        <h1 className="text-lg font-semibold">Exam Duration</h1>
        <input
          type="text"
          value={duration}
          onChange={({ target }) => setDuration(target.value)}
          className="w-full rounded-xl border border-r-2 border-b-2 border-l-2 border-gray-300 border-r-yellow-400 border-b-yellow-400 border-l-yellow-400 p-3 outline-none"
          placeholder="Maths test"
        />
      </div>
      <div
        className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-md border-3 border-dashed border-[#cccccc] bg-[#f0f0f0f0]"
        onClick={handleDivClick}
      >
        <FiUploadCloud className="size-16" />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <p>Drop your PDF here, or Browse</p>
      </div>
      <button className="h-12 w-full cursor-pointer rounded-full bg-yellow-400 py-2 text-lg font-bold">
        Upload PDF
      </button>
    </form>
  );
};
export default ExamBuilderForm;
