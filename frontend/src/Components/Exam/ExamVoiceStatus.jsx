import React from 'react';

const ExamVoiceStatus = ({ speechSupported, voiceStep, isListening }) => {
    if (!speechSupported) {
        return (
            <div className="bg-white border-b px-4 py-2 text-sm text-gray-600 text-center">
                Voice features not supported in this browser
            </div>
        );
    }

    return (
        <div className="bg-white border-b px-4 py-2 text-sm text-gray-600 text-center">
            {voiceStep === 'welcome' && "Playing welcome message..."}
            {voiceStep === 'instructions' && "Playing exam instructions..."}
            {voiceStep === 'question' && !isListening && "Click to speak your answer (A, B, C, or D)"}
            {voiceStep === 'listening' && "Listening for your answer..."}
            {voiceStep === 'confirm' && "Confirming your answer..."}
            {voiceStep === 'review_answer' && "Reviewing your current answer..."}
        </div>
    );
};

export default ExamVoiceStatus;
