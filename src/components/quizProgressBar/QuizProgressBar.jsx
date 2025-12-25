import React from "react";
import "./QuizProgressBar.css";

const QuizProgressBar = ({ progress }) => {
  return (
    <div className="quiz-progress">
      <div 
        className="quiz-progress__fill" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default QuizProgressBar;