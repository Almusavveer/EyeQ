import Review from "../Components/Review/Review";
import { ProgressBar } from "../UI/ProgressBar";
import { useParams } from "react-router";

const ReviewEdit = () => {
    const { examId } = useParams();
    
    return ( 
        <div className="flex h-full flex-col items-center justify-center gap-3">
            <h1 className="text-2xl font-semibold text-center">Review and Edit</h1>
            <ProgressBar currentStep={2} />
            <Review examId={examId} />
        </div>
     );
}
  
export default ReviewEdit;
