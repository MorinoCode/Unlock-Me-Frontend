import React, { useState } from "react";
import "./onboardingSteps.css"; 

const OnboardingStep1 = ({ formData, setFormData, userName, onNext, loading }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ day: false, month: false, year: false });

  const validateBirthday = (birthday) => {
    const { day, month, year } = birthday;
    const newErrors = {};
    if (!/^\d+$/.test(day) || Number(day) < 1 || Number(day) > 31) newErrors.day = "Invalid Day";
    if (!/^\d+$/.test(month) || Number(month) < 1 || Number(month) > 12) newErrors.month = "Invalid Month";
    if (!/^\d{4}$/.test(year)) newErrors.year = "Invalid Year";

    if (Object.keys(newErrors).length === 0) {
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 12 || age > 100) newErrors.age = "Age must be 12-100";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && !/^\d+$/.test(value)) return;
    const updatedBirthday = { ...formData.birthday, [name]: value };
    setFormData({ ...formData, birthday: updatedBirthday });
    setTouched({ ...touched, [name]: true });
    setErrors(validateBirthday(updatedBirthday));
  };

  const isNextDisabled = Object.keys(validateBirthday(formData.birthday)).length > 0;

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">{`${userName}, When were you born?`}</h2>
      <div className="onboarding-step__input-group onboarding-step__input-group--birthday">
        {["day", "month", "year"].map((f) => (
          <div key={f} className="onboarding-step__field-wrapper">
            <input
              name={f}
              placeholder={f.toUpperCase()}
              value={formData.birthday[f]}
              onChange={handleChange}
              onBlur={() => setTouched({ ...touched, [f]: true })}
              className="onboarding-step__input onboarding-step__input--center" 
              autoFocus={f === "day"}
              maxLength={f === "year" ? 4 : 2}
            />
            {touched[f] && errors[f] && <span className="onboarding-step__error">{errors[f]}</span>}
          </div>
        ))}
      </div>
      {errors.age && <span className="onboarding-step__error onboarding-step__error--age">{errors.age}</span>}

      <div className="onboarding-step__actions">
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

export default OnboardingStep1;