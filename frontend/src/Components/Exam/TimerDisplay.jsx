import React from 'react';

const TimerDisplay = ({ timeRemaining, formatTime }) => {
  return (
    <div className="text-right">
      <p className="text-sm text-gray-600">Time Remaining</p>
      <p className="text-lg font-bold text-red-600">{formatTime(timeRemaining)}</p>
    </div>
  );
};

export default TimerDisplay;
