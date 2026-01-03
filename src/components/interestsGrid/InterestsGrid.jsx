import React, { useCallback, memo } from "react";
import "./InterestsGrid.css";

const InterestItem = memo(({ option, isSelected, onToggle }) => {
  const handleClick = useCallback(() => {
    onToggle(option.label);
  }, [onToggle, option.label]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(option.label);
    }
  }, [onToggle, option.label]);

  return (
    <div
      className={`interests-grid__item-category ${isSelected ? "interests-grid__item-category--selected" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${option.label} interest`}
    >
      <span className="interests-grid__icon" aria-hidden="true">
        {option.icon}
      </span>
      <span className="interests-grid__label">{option.label}</span>
    </div>
  );
});

InterestItem.displayName = "InterestItem";

const InterestsGrid = ({ options, selectedInterests, onToggle }) => {
  return (
    <div 
      className="interests-grid"
      role="group"
      aria-label="Select your interests"
    >
      {options.map((opt) => (
        <InterestItem
          key={opt._id || opt.label}
          option={opt}
          isSelected={selectedInterests.includes(opt.label)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};

export default memo(InterestsGrid);