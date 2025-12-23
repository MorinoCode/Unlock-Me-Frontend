import React from "react";
import "./onboardingSteps.css";
const OnboardingStep3 = ({ formData, setFormData, onNext, onBack, loading }) => {
  const isNextDisabled = formData.bio.length < 10;

  return (
    <div className="step-content">
      <h2>About You</h2>
      <textarea 
        className="onboarding-input bio-textarea"
        placeholder="Tell us something interesting about yourself (min 10 chars)..."
        value={formData.bio}
        maxLength={150}
        onChange={(e) => setFormData({...formData, bio: e.target.value})}
      />
      <p className="char-count">{formData.bio.length}/150</p>

      <div className="onboarding-actions">
        <button className="skip-btn" onClick={onBack}>Back</button>
        <button onClick={onNext} disabled={isNextDisabled || loading} className="next-btn">
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep3;