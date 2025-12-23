import React from "react";

const QuizProgressBar = ({ progress }) => {
  return (
    <div className="quiz-progress-bar-container">
      <div 
        className="quiz-progress-fill" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default QuizProgressBar;