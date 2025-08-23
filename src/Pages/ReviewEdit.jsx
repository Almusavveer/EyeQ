import ExamBuilderForm from "../UI/ExamBuilderForm";
import { ProgressBar } from "../UI/ProgressBar";

const ReviewEdit = () => {
    return ( 
        <div className="flex h-full flex-col items-center justify-center gap-3">
            <h1 className="text-2xl font-semibold text-center">Review and Edit</h1>
            <ProgressBar currentStep={2} />
            <ExamBuilderForm />
        </div>
     );
}
  
export default ReviewEdit;