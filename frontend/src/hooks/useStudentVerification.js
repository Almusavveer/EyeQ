import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

/**
 * Custom hook for managing student verification
 * @param {string} examId - The exam ID
 * @returns {Object} Verification related state and functions
 */
export const useStudentVerification = (examId) => {
    const [user] = useAuthState(auth);
    const [studentName, setStudentName] = useState('Loading...');
    const [studentId, setStudentId] = useState('Loading...');
    const [isVerified, setIsVerified] = useState(false);

    // Check for stored verification on component mount
    useEffect(() => {
        const checkExamSubmission = async (studentId, examId) => {
            try {
                const submissionDoc = await getDoc(doc(db, 'examResults', examId, 'submissions', studentId));
                if (submissionDoc.exists()) {
                    // Handle already submitted case - this will be handled in the component
                    return;
                }
            } catch (err) {
                console.error('Error checking exam submission:', err);
            }
        };

        const storedVerification = sessionStorage.getItem('studentVerification');
        if (storedVerification) {
            try {
                const verificationData = JSON.parse(storedVerification);
                // Check if verification is still valid (within last hour)
                const verifiedAt = new Date(verificationData.verifiedAt);
                const now = new Date();
                const hoursDiff = (now - verifiedAt) / (1000 * 60 * 60);

                if (hoursDiff < 1) { // Valid for 1 hour
                    setStudentName(verificationData.studentName);
                    setStudentId(verificationData.studentId);
                    setIsVerified(true);

                    // If examId is provided, check if student has already submitted
                    if (examId) {
                        checkExamSubmission(verificationData.studentId, examId);
                    }
                } else {
                    // Clear expired verification
                    sessionStorage.removeItem('studentVerification');
                }
            } catch (err) {
                console.error('Error parsing stored verification:', err);
                sessionStorage.removeItem('studentVerification');
            }
        }
    }, [examId]);

    // Handle student verification
    const handleStudentVerified = async (studentData) => {
        setStudentName(studentData.name || 'Student');
        setStudentId(studentData.rollNumber || user.uid);
        setIsVerified(true);

        // Store verification data in sessionStorage to persist across navigation
        sessionStorage.setItem('studentVerification', JSON.stringify({
            studentName: studentData.name || 'Student',
            studentId: studentData.rollNumber || user.uid,
            verifiedAt: new Date().toISOString()
        }));
    };

    return {
        studentName,
        studentId,
        isVerified,
        handleStudentVerified
    };
};
