import React from "react";

const InterestsGrid = ({ options, selectedInterests, onToggle }) => {
  return (
    <div className="interests-grid">
      {options.map((opt) => (
        <div
          key={opt._id}
          className={`interest-item ${
            selectedInterests.includes(opt.label) ? "selected" : ""
          }`}
          onClick={() => onToggle(opt.label)}
        >
          <span className="interest-icon">{opt.icon}</span>
          <span className="interest-label">{opt.label}</span>
        </div>
      ))}
    </div>
  );
};

export default InterestsGrid;