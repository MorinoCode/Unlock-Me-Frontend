import React, { memo } from "react";
import "./InterestsActions.css";

const InterestsActions = ({ loading, disabled, onNext }) => {
  return (
    <div className="interests-actions">
      <button
        onClick={onNext}
        disabled={disabled}
        className="interests-actions__btn interests-actions__btn--full-width"
        aria-busy={loading}
        aria-label={loading ? "Saving your interests" : "Continue to next step"}
      >
        {loading ? (
          <>
            <span className="interests-actions__spinner" aria-hidden="true"></span>
            Saving...
          </>
        ) : (
          "Continue"
        )}
      </button>
    </div>
  );
};

export default memo(InterestsActions);