import { ProgressBar } from "../UI/ProgressBar";
import ExamBuilderForm from "../UI/ExamBuilderForm";
const ExamBuilder = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <h1 className="text-2xl font-bold"> Create New Exam</h1>
      <ProgressBar currentStep={1} />
      <ExamBuilderForm />
    </div>
  );
};
export default ExamBuilder;
