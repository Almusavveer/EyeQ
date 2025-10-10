import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

/**
 * Custom hook for managing exam data fetching and saving
 * @param {string} examId - The exam ID
 * @param {boolean} isVerified - Whether student is verified
 * @param {string} studentId - Student ID
 * @param {Array} questions - Current questions state
 * @param {Function} setQuestions - Function to set questions
 * @param {Function} setExamTitle - Function to set exam title
 * @param {Function} setExamDuration - Function to set exam duration
 * @param {Function} setError - Function to set error
 * @param {Function} setLoading - Function to set loading state
 * @returns {Object} Exam data related state and functions
 */
export const useExamData = (
    examId,
    isVerified,
    studentId,
    questions,
    setQuestions,
    setExamTitle,
    setExamDuration,
    setError,
    setLoading
) => {
    const [user] = useAuthState(auth);
    const [availableExams, setAvailableExams] = useState([]);
    const [showExamSelection, setShowExamSelection] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    // Fetch exam data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // If no examId provided, show exam selection after verification
                if (!examId) {
                    setShowExamSelection(true);
                    setLoading(false);
                    return;
                }

                // Reset exam selection state when examId is provided
                setShowExamSelection(false);

                // Fetch exam data from Firestore
                const examDoc = await getDoc(doc(db, 'examDetails', examId));
                if (examDoc.exists()) {
                    const examData = examDoc.data();
                    setExamTitle(examData.examTitle || 'Untitled Exam');
                    setExamDuration(parseInt(examData.examDuration) || 60); // default to 60 minutes

                    // Process questions
                    if (examData.questions && Array.isArray(examData.questions)) {
                        const processedQuestions = examData.questions.map((q, index) => ({
                            id: index + 1,
                            questionText: q.question || q.text || '',
                            options: (q.options || []).map((opt, optIndex) => ({
                                id: optIndex,
                                text: opt.text || opt
                            })),
                            answer: null,
                            isFlagged: false
                        }));
                        setQuestions(processedQuestions);
                    }
                } else {
                    setError('Exam not found');
                }

                // Fetch saved answers for this student and exam (only if verified)
                if (user && examId && studentId !== 'Loading...' && isVerified) {
                    const answersDoc = await getDoc(doc(db, 'examDetails', examId, 'studentAnswers', studentId));
                    if (answersDoc.exists()) {
                        const answersData = answersDoc.data();
                        if (answersData.answers && Array.isArray(answersData.answers)) {
                            // Update questions with saved answers
                            setQuestions(prev => prev.map((q, index) => ({
                                ...q,
                                answer: answersData.answers[index] || null,
                                isFlagged: answersData.flagged?.[index] || false
                            })));
                        }
                    }
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load exam data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [examId, user, isVerified, studentId, setQuestions, setExamTitle, setExamDuration, setError, setLoading]);

    // Fetch available exams
    const fetchAvailableExams = async () => {
        setLoadingExams(true);
        try {
            const examsSnapshot = await getDocs(collection(db, 'examDetails'));
            const exams = [];
            examsSnapshot.forEach((doc) => {
                exams.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setAvailableExams(exams);
        } catch (err) {
            console.error('Error fetching exams:', err);
            setError('Failed to load available exams');
        } finally {
            setLoadingExams(false);
        }
    };

    // Save answers to Firebase whenever questions change
    useEffect(() => {
        const saveAnswers = async () => {
            if (user && examId && questions.length > 0 && studentId !== 'Loading...' && isVerified) {
                try {
                    const answers = questions.map(q => q.answer ?? null); // Convert undefined to null
                    const flagged = questions.map(q => q.isFlagged ?? false); // Convert undefined to false

                    await setDoc(doc(db, 'examDetails', examId, 'studentAnswers', studentId), {
                        answers,
                        flagged,
                        lastUpdated: new Date(),
                        studentId,
                        examId
                    });
                } catch (err) {
                    console.error('Error saving answers:', err);
                }
            }
        };

        // Debounce the save operation
        const timeoutId = setTimeout(saveAnswers, 1000); // Save after 1 second of inactivity

        return () => clearTimeout(timeoutId);
    }, [questions, user, examId, studentId, isVerified]);

    return {
        availableExams,
        showExamSelection,
        loadingExams,
        fetchAvailableExams
    };
};
