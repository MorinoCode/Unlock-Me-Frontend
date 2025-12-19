import {  useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InitialQuizzesPage.css";

const MultiStepOnboarding = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Step 1: Birthday, Step 2: Avatar
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    birthday: { day: "", month: "", year: "" },
    avatar: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ day: false, month: false, year: false });

  const storedUser = localStorage.getItem("unlock-me-user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const capitalizeFirstLetter = (str = "") => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const name = parsedUser?.name ? capitalizeFirstLetter(parsedUser.name) : "User";

  /* -------------------- Birthday Validation -------------------- */
  const validateBirthday = (birthday) => {
    const { day, month, year } = birthday;
    const newErrors = {};
    if (!/^\d+$/.test(day) || Number(day) < 1 || Number(day) > 31) newErrors.day = "Invalid day";
    if (!/^\d+$/.test(month) || Number(month) < 1 || Number(month) > 12) newErrors.month = "Invalid month";
    if (!/^\d{4}$/.test(year)) newErrors.year = "Invalid year";
    
    if (Object.keys(newErrors).length === 0) {
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (age < 12 || age > 100) newErrors.age = "Age must be 12-100";
    }
    return newErrors;
  };

  /* -------------------- Handlers -------------------- */
  const handleBirthdayChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && !/^\d+$/.test(value)) return;
    const updatedBirthday = { ...formData.birthday, [name]: value };
    setFormData({ ...formData, birthday: updatedBirthday });
    setTouched({ ...touched, [name]: true });
    setErrors(validateBirthday(updatedBirthday));
  };

  const handleAvatarChange = (e) => {
    setFormData({ ...formData, avatar: e.target.files[0] });
  };

  /* -------------------- Submit Logic -------------------- */
  const handleNext = async () => {
    setLoading(true);
    try {
      let endpoint = step === 1 ? "birthday" : "avatar";
      let body;

      if (step === 1) {
        const validationErrors = validateBirthday(formData.birthday);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setLoading(false);
          return;
        }
        body = JSON.stringify({ birthday: formData.birthday });
      } else {
        body = new FormData();
        if (formData.avatar) body.append("avatar", formData.avatar);
      }

      const res = await fetch(`${API_URL}/api/user/onboarding/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: body instanceof FormData ? {} : { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error("Request failed");

      // Navigation Logic based on your requested order:
      if (step === 1) {
        // After birthday, move to Avatar (Step 2 in this same file)
        setStep(2);
      } else {
        // After avatar, navigate to the Interests Page (Separate Route)
        navigate("/initial-quizzes/interests");
      }
    } catch (err) {
      console.error("Onboarding error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isNextDisabled = loading || (step === 1 && Object.keys(errors).length > 0);

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        {step === 1 ? (
          /* STEP 1: BIRTHDAY UI */
          <>
            <h2>{`${name}, When were you born?`}</h2>
            <div className="birthday-inputs">
              {["day", "month", "year"].map((field) => (
                <div key={field}>
                  <input
                    name={field}
                    placeholder={field.toUpperCase()}
                    value={formData.birthday[field]}
                    onChange={handleBirthdayChange}
                  />
                  {touched[field] && errors[field] && <span className="error-text">{errors[field]}</span>}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* STEP 2: AVATAR UI */
          <div className="upload-foto">
            <h2>Upload your profile picture</h2>
            <label className="upload-wrapper">
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              <span className="upload-btn">Choose Photo</span>
            </label>
            {formData.avatar && (
              <div className="avatar-preview-wrapper">
                <img src={URL.createObjectURL(formData.avatar)} alt="Preview" className="avatar-preview" />
              </div>
            )}
          </div>
        )}

        <div className="onboarding-actions">
          <button 
            onClick={() => {
              if(step === 1) setStep(2); 
              else navigate("/initial-quizzes/interests"); 
            }} 
            className="skip-btn"
          >
            Skip
          </button>
          <button onClick={handleNext} disabled={isNextDisabled} className="next-btn">
            {loading ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiStepOnboarding;