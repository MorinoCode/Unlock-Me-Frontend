import React from "react";
//quiz
const QuizCard = ({ question, onAnswer, currentIndex, totalQuestions }) => {
  return (
    <div className="quiz-question-card">
      <div className="quiz-header">
        <span className="quiz-category-badge">{question.category}</span>
        <span className="quiz-counter">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      <h2 className="quiz-question-text">{question.questionText}</h2>

      <div className="quiz-options-list">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            className="quiz-option-btn"
            onClick={() => onAnswer(option)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizCard;