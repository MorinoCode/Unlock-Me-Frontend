import React from "react";

const InterestsActions = ({ loading, disabled, onNext }) => {
  return (
    <div className="onboarding-interests-actions">
      <button
        onClick={onNext}
        disabled={disabled}
        className="next-btn full-width"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
};

export default InterestsActions;