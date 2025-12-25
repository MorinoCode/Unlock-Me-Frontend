import React from "react";
import "./InterestsActions.css";

const InterestsActions = ({ loading, disabled, onNext }) => {
  return (
    <div className="interests-actions">
      <button
        onClick={onNext}
        disabled={disabled}
        className="interests-actions__btn interests-actions__btn--full-width"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
};

export default InterestsActions;