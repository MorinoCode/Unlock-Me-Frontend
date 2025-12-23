import React, { useState } from "react";
// ایمپورت فایل CSS مشترک
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
    <div className="step-content">
      <h2>{`${userName}, When were you born?`}</h2>
      <div className="birthday-inputs">
        {["day", "month", "year"].map((f) => (
          <div key={f}>
            <input
              name={f}
              placeholder={f.toUpperCase()}
              value={formData.birthday[f]}
              onChange={handleChange}
              onBlur={() => setTouched({ ...touched, [f]: true })}
              // کلاس دقیقاً مطابق استایل شما
              className="onboarding-input" 
              autoFocus={f === "day"}
              maxLength={f === "year" ? 4 : 2}
            />
            {touched[f] && errors[f] && <span className="error-text">{errors[f]}</span>}
          </div>
        ))}
      </div>
      {errors.age && <span className="error-text-age">{errors.age}</span>}

      <div className="onboarding-actions">
         <button onClick={onNext} disabled={isNextDisabled || loading} className="next-btn">
           {loading ? "Saving..." : "Next"}
         </button>
      </div>
    </div>
  );
};

export default OnboardingStep1;