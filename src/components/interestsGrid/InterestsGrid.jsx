import React from "react";
import "./InterestsGrid.css";

const InterestsGrid = ({ options, selectedInterests, onToggle }) => {
  return (
    <div className="interests-grid">
      {options.map((opt) => (
        <div
          key={opt._id}
          className={`interests-grid__item ${
            selectedInterests.includes(opt.label) ? "interests-grid__item--selected" : ""
          }`}
          onClick={() => onToggle(opt.label)}
        >
          <span className="interests-grid__icon">{opt.icon}</span>
          <span className="interests-grid__label">{opt.label}</span>
        </div>
      ))}
    </div>
  );
};

export default InterestsGrid;