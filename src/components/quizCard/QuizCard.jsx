import React from "react";
import "./QuizCard.css";

const QuizCard = ({ question, onAnswer, currentIndex, totalQuestions }) => {
  return (
    <div className="quiz-card">
      <div className="quiz-card__header">
        <span className="quiz-card__badge">{question.category}</span>
        <span className="quiz-card__counter">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      <h2 className="quiz-card__title">{question.questionText}</h2>

      <div className="quiz-card__options">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            className="quiz-card__option-btn"
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