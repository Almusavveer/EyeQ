import React from "react";

const Question = ({ text, options, selectedIndex }) => {
  const option = ["A", "B", "C", "D"];
  
  // Function to determine if answers are lengthy
  const hasLengthyAnswers = (options) => {
    if (!options || options.length === 0) return false;
    
    // Calculate average length
    const avgLength = options.reduce((sum, opt) => sum + opt.length, 0) / options.length;
    
    // Consider lengthy if average > 50 characters or any single answer > 80 characters
    return avgLength > 50 || options.some(opt => opt.length > 80);
  };
  
  // Function to format code within question text
  const formatQuestionText = (questionText) => {
    // Check if the text contains code patterns
    const codePatterns = [
      /public class/i,
      /public static void main/i,
      /System\.out/i,
      /String\s+\w+\s*=/i,
      /\{.*\}/,
      /import\s+/i,
      /#include/i,
      /def\s+\w+/i,  // Python function
      /function\s+\w+/i, // JavaScript function
      /console\.log/i,
      /printf/i,
      /cout\s*<</i
    ];
    
    const hasCode = codePatterns.some(pattern => pattern.test(questionText));
    
    if (hasCode) {
      // Extract the question part and code part
      const parts = questionText.split(/(public class|#include|def |function |console\.log|printf|cout)/i);
      
      if (parts.length > 1) {
        const questionPart = parts[0].trim();
        const codePart = parts.slice(1).join('').trim();
        
        // Format the code part with proper indentation
        let formattedCode = codePart;
        
        // Handle Java code specifically
        if (/public class.*main.*String.*args/is.test(codePart)) {
          formattedCode = codePart
            // Fix class declaration
            .replace(/(public class \w+)\s*\{\s*/gi, '$1 {\n    ')
            // Fix main method
            .replace(/(public static void main\s*\(\s*String\[\]\s*args\s*\))\s*\{\s*/gi, '$1 {\n        ')
            // Fix variable declarations and statements
            .replace(/;\s*(?=[A-Za-z])/g, ';\n        ')
            // Fix closing braces
            .replace(/\}\s*\}/g, '    }\n}')
            // Clean up extra whitespace
            .replace(/\n\s*\n/g, '\n')
            .trim();
        }
        
        return (
          <div className="text-center">
            <div className="mb-3">
              <span>Q. {questionPart}</span>
            </div>
            <div className="inline-block text-left bg-gray-100 rounded-lg p-4 border max-w-full overflow-x-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {formattedCode}
              </pre>
            </div>
          </div>
        );
      }
      
      // Fallback formatting for other code
      let formattedText = questionText
        .replace(/\{\s*/g, '{\n    ')
        .replace(/\s*\}/g, '\n}')
        .replace(/;\s*(?=\w)/g, ';\n        ')
        .replace(/public class (\w+)\s*\{/gi, 'public class $1 {\n    ')
        .replace(/\n\s*\n/g, '\n');
      
      return (
        <div className="text-center">
          <div className="inline-block text-left bg-gray-100 rounded-lg p-4 mb-2 border">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto">
              {formattedText}
            </pre>
          </div>
        </div>
      );
    }
    
    // Regular text display
    return (
      <span>Q. {questionText}</span>
    );
  };

  const isLengthy = hasLengthyAnswers(options);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6" role="main" aria-label="Question and answer options">
      <h1 
        className="text-center text-base sm:text-lg lg:text-xl font-semibold text-gray-800 px-2"
        aria-live="polite"
        role="heading"
        aria-level="1"
      >
        {formatQuestionText(text)}
      </h1>
      
      {/* Responsive grid layout for options */}
      <div 
        className={`
          grid gap-3 sm:gap-4
          grid-cols-1
          ${
            // Tablet (sm): 2x2 for short answers, single column for lengthy
            isLengthy 
              ? 'sm:grid-cols-1' 
              : 'sm:grid-cols-2'
          }
          ${
            // Desktop (lg and above): Always 2x2 grid regardless of length
            'lg:grid-cols-2'
          }
        `}
        role="list" 
        aria-label="Answer options"
      >
        {options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          return (
            <div 
              key={i} 
              className={`flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border shadow-sm hover:shadow-md px-3 sm:px-5 py-3 sm:py-4 transition-all duration-300 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-300'
              }`}
              role="listitem"
              aria-selected={isSelected}
              aria-label={`Option ${option[i]}: ${opt}${isSelected ? ' - Currently selected' : ''}`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 text-white text-sm sm:text-base rounded-full font-semibold flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'bg-blue-600' : 'bg-yellow-500'
              }`}>
                {option[i]}  
              </div>
              <span className={`text-sm sm:text-base leading-relaxed ${
                isSelected ? 'text-blue-800 font-medium' : 'text-gray-700'
              }`}>
                {opt}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Question;
