import React, { useCallback, useMemo } from "react";
import "./onboardingSteps.css";

const OnboardingStep3 = ({ formData, setFormData, onNext, onBack, loading }) => {
  const handleBioChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= 150) {
      setFormData({ ...formData, bio: value });
    }
  }, [formData, setFormData]);

  const isNextDisabled = useMemo(() => {
    return formData.bio.trim().length < 10;
  }, [formData.bio]);

  const charCount = useMemo(() => {
    return formData.bio.length;
  }, [formData.bio]);

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">About You</h2>
      <textarea 
        className="onboarding-step__textarea"
        placeholder="Tell us something interesting about yourself (min 10 chars)..."
        value={formData.bio}
        onChange={handleBioChange}
        aria-label="Your bio"
        aria-describedby="char-count"
        aria-invalid={formData.bio.length > 0 && formData.bio.trim().length < 10}
      />
      <p 
        id="char-count"
        className="onboarding-step__char-count"
        aria-live="polite"
      >
        {charCount}/150
      </p>

      <div className="onboarding-step__actions">
        <button 
          className="onboarding-step__btn onboarding-step__btn--secondary" 
          onClick={onBack}
        >
          Back
        </button>
        <button 
          onClick={onNext} 
          disabled={isNextDisabled || loading} 
          className="onboarding-step__btn onboarding-step__btn--primary"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="onboarding-step__spinner" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep3;