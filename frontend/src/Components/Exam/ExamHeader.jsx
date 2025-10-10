import React, { useState, useEffect } from 'react';

const Timer = ({ examDuration, timerStarted }) => {
    // State to hold the time - convert minutes to seconds, default to 60 minutes if invalid
    const validDuration = (examDuration && !isNaN(examDuration) && examDuration > 0) ? examDuration : 60;
    const [timeLeft, setTimeLeft] = useState(validDuration * 60);

    // Update timer when examDuration changes
    useEffect(() => {
        const newValidDuration = (examDuration && !isNaN(examDuration) && examDuration > 0) ? examDuration : 60;
        setTimeLeft(newValidDuration * 60);
    }, [examDuration]);

    useEffect(() => {
        // Don't start timer until timerStarted is true
        if (!timerStarted || timeLeft <= 0) return;

        // Set up the interval
        const timerId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        // Clean up the interval on component unmount
        return () => clearInterval(timerId);
    }, [timeLeft, timerStarted]); // Rerun effect if timeLeft or timerStarted changes

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="bg-red-600 text-white font-semibold py-2 px-3 rounded-md shadow-sm flex items-center space-x-1 text-sm max-w-48">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="12" y1="6" y2="6"/><circle cx="12" cy="14" r="8"/></svg>
            <span>Time Left: {formatTime(timeLeft)}</span>
        </div>
    );
};

const ExamHeader = ({ studentName, studentId, examTitle, examDuration, timerStarted }) => (
  <header className="bg-white shadow-md p-4 flex justify-between items-center w-full">
    {/* Left Section: Student Details */}
    <div className="text-left w-1/4">
      <h2 className="font-bold text-lg text-gray-800">{studentName}</h2>
      <p className="text-sm text-gray-500">Student ID: {studentId}</p>
    </div>

    {/* Center Section: Exam Title */}
    <div className="text-center w-1/2">
      <h1 className="text-2xl font-bold text-gray-900">{examTitle}</h1>
    </div>

    {/* Right Section: Timer */}
    <div className="text-right w-1/4">
      <div className="ml-auto w-fit">
        <Timer examDuration={examDuration} timerStarted={timerStarted} />
      </div>
    </div>
  </header>
);

export default ExamHeader;
