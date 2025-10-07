export const ProgressBar = ({ currentStep }) => {
  const steps = [1, 2, 3];
  return (
    <div className="flex items-center justify-between w-full py-3 px-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div
            className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full font-semibold text-sm sm:text-base transition-colors duration-300 ${currentStep >= step ? "bg-yellow-400 text-black" : "bg-gray-300 text-gray-600"}`}
          >
            {step}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-1 flex-1 mx-2 sm:mx-3 transition-colors duration-300 ${currentStep > step ? "bg-yellow-400" : "bg-gray-300"}`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};
