import React, { useCallback, memo } from "react";
import "./QuizCard.css";

const QuizOption = memo(({ option, onAnswer, index }) => {
  const handleClick = useCallback(() => {
    onAnswer(option);
  }, [onAnswer, option]);

  return (
    <button
      className="quiz-card__option-btn"
      onClick={handleClick}
      aria-label={`Option ${index + 1}: ${option.text}`}
    >
      {option.text}
    </button>
  );
});

QuizOption.displayName = "QuizOption";

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
          <QuizOption
            key={option.id || `option-${idx}`}
            option={option}
            onAnswer={onAnswer}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(QuizCard);