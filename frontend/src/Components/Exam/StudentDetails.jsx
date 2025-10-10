import React from 'react';

const StudentDetails = ({ studentData }) => {
  return (
    <div className="text-left">
      <p className="text-sm text-gray-600">Student: {studentData?.name || 'N/A'}</p>
      <p className="text-sm text-gray-600">ID: {studentData?.id || 'N/A'}</p>
    </div>
  );
};

export default StudentDetails;
