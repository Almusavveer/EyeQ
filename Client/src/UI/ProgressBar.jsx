export const ProgressBar = ({ currentStep }) => {
  const steps = [1, 2, 3];
  return (
    <div className="flex items-center justify-center py-3">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full font-semibold transition-colors duration-300 ${currentStep >= step ? "bg-yellow-400 text-black" : "bg-gray-300 text-gray-600"}`}
          >
            {step}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-1 w-36 transition-colors duration-300 ${currentStep > step ? "bg-yellow-400" : "bg-gray-300"}`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};
