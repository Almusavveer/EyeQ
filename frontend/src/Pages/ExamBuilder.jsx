import { ProgressBar } from "../UI/ProgressBar";
import ExamBuilderForm from "../UI/ExamBuilderForm";
import { useState } from "react";
import { useNavigate } from "react-router";
import { FiChevronLeft } from "react-icons/fi";
import ReviewStep from "../Components/ReviewStep";
import PublishStep from "../Components/PublishStep";

const ExamBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState(null);
  const navigate = useNavigate();

  const handleNextStep = (data) => {
    if (currentStep === 1) {
      // Moving from form to review
      setExamData(data);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Moving from review to publish
      setExamData(data);
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ExamBuilderForm onNext={handleNextStep} />;
      case 2:
        return (
          <ReviewStep
            examData={examData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 3:
        return (
          <PublishStep
            examData={examData}
            onPrev={handlePrevStep}
          />
        );
      default:
        return <ExamBuilderForm onNext={handleNextStep} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* Mobile: Back Button + Centered Title in Same Line */}
      <div className="flex items-center justify-between w-full max-w-sm sm:max-w-md lg:max-w-2xl mt-4 mb-1 sm:hidden relative">
        <button
          type="button"
          onClick={() => {
            if (currentStep === 1) {
              navigate("/home");
            } else {
              handlePrevStep();
            }
          }}
          className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 touch-manipulation"
        >
          <FiChevronLeft className="h-8 w-8 text-gray-600" />
        </button>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-gray-800">Create New Exam</h1>
        <div className="w-12"></div> {/* Spacer for balance */}
      </div>

      <div className="flex flex-col items-center justify-center flex-1 gap-3 w-full">
        {/* Desktop: Title Only */}
        <h1 className="hidden sm:block text-xl sm:text-2xl lg:text-3xl font-bold text-center">Create New Exam</h1>
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl">
          <ProgressBar currentStep={currentStep} />
        </div>
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default ExamBuilder;
