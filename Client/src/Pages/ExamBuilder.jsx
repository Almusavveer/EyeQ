import { ProgressBar } from "../UI/ProgressBar";
import ExamBuilderForm from "../UI/ExamBuilderForm";
import { useState } from "react";
import ReviewStep from "../Components/ReviewStep";
import PublishStep from "../Components/PublishStep";

const ExamBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState(null);

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
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <h1 className="text-2xl font-bold">Create New Exam</h1>
      <ProgressBar currentStep={currentStep} />
      {renderCurrentStep()}
    </div>
  );
};

export default ExamBuilder;
