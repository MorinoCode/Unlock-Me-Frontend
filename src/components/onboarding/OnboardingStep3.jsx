import React from "react";
import "./onboardingSteps.css";

const OnboardingStep3 = ({ formData, setFormData, onNext, onBack, loading }) => {
  const isNextDisabled = formData.bio.length < 10;

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">About You</h2>
      <textarea 
        className="onboarding-step__textarea"
        placeholder="Tell us something interesting about yourself (min 10 chars)..."
        value={formData.bio}
        maxLength={150}
        onChange={(e) => setFormData({...formData, bio: e.target.value})}
      />
      <p className="onboarding-step__char-count">{formData.bio.length}/150</p>

      <div className="onboarding-step__actions">
        <button className="onboarding-step__btn onboarding-step__btn--secondary" onClick={onBack}>Back</button>
        <button 
          onClick={onNext} 
          disabled={isNextDisabled || loading} 
          className="onboarding-step__btn onboarding-step__btn--primary"
        >
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep3;