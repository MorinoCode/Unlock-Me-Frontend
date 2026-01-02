import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./onboardingSteps.css"; 

const OnboardingStep1 = ({ formData, setFormData, userName, onNext, loading }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ day: false, month: false, year: false });

  const validateBirthday = useCallback((birthday) => {
    const { day, month, year } = birthday;
    const newErrors = {};

    const dayNum = Number(day);
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (day && (!/^\d+$/.test(day) || dayNum < 1 || dayNum > 31)) {
      newErrors.day = "Invalid Day";
    }

    if (month && (!/^\d+$/.test(month) || monthNum < 1 || monthNum > 12)) {
      newErrors.month = "Invalid Month";
    }

    if (year && !/^\d{4}$/.test(year)) {
      newErrors.year = "Invalid Year";
    }

    if (day && month && year && Object.keys(newErrors).length === 0) {
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
      if (dayNum > daysInMonth) {
        newErrors.day = `Invalid day for month ${monthNum}`;
      }

      const birthDate = new Date(yearNum, monthNum - 1, dayNum);
      if (isNaN(birthDate.getTime())) {
        newErrors.year = "Invalid Date";
      } else {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 12 || age > 100) {
          newErrors.age = "Age must be between 12-100";
        }
      }
    }

    return newErrors;
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setErrors(validateBirthday(formData.birthday));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.birthday, validateBirthday]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (value !== "" && !/^\d+$/.test(value)) return;

    const maxLen = name === "year" ? 4 : 2;
    if (value.length > maxLen) return;

    const updatedBirthday = { ...formData.birthday, [name]: value };
    setFormData({ ...formData, birthday: updatedBirthday });
  }, [formData, setFormData]);

  const handleBlur = useCallback((e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }, []);

  const isNextDisabled = useMemo(() => {
    const { day, month, year } = formData.birthday;
    if (!day || !month || !year) return true;
    return Object.keys(validateBirthday(formData.birthday)).length > 0;
  }, [formData.birthday, validateBirthday]);

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">{`${userName}, When were you born?`}</h2>
      <div className="onboarding-step__input-group onboarding-step__input-group--birthday">
        {["day", "month", "year"].map((field) => (
          <div key={field} className="onboarding-step__field-wrapper">
            <input
              name={field}
              type="text"
              inputMode="numeric"
              placeholder={field.toUpperCase()}
              value={formData.birthday[field]}
              onChange={handleChange}
              onBlur={handleBlur}
              className="onboarding-step__input onboarding-step__input--center" 
              autoFocus={field === "day"}
              autoComplete="off"
              aria-label={`Enter your birth ${field}`}
              aria-invalid={touched[field] && errors[field] ? "true" : "false"}
              aria-describedby={touched[field] && errors[field] ? `${field}-error` : undefined}
            />
            {touched[field] && errors[field] && (
              <span 
                id={`${field}-error`}
                className="onboarding-step__error"
                role="alert"
              >
                {errors[field]}
              </span>
            )}
          </div>
        ))}
      </div>
      {errors.age && (
        <span 
          className="onboarding-step__error onboarding-step__error--age"
          role="alert"
        >
          {errors.age}
        </span>
      )}

      <div className="onboarding-step__actions">
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

export default OnboardingStep1;