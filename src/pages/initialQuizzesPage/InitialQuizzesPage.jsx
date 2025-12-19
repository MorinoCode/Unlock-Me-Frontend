import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InitialQuizzesPage.css";

const MultiStepOnboarding = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    birthday: { day: "", month: "", year: "" },
    interests: [],
    avatar: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    day: false,
    month: false,
    year: false,
  });

  const [interestOptions, setInterestOptions] = useState([]);

  const storedUser = localStorage.getItem("unlock-me-user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

const capitalizeFirstLetter = (str = "") =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const name = parsedUser?.name ? capitalizeFirstLetter(parsedUser.name) : "User";

  /* -------------------- Birthday Validation -------------------- */
  const validateBirthday = (birthday) => {
    const { day, month, year } = birthday;
    const newErrors = {};

    if (!/^\d+$/.test(day) || Number(day) < 1 || Number(day) > 31) {
      newErrors.day = "Day must be between 1 and 31";
    }

    if (!/^\d+$/.test(month) || Number(month) < 1 || Number(month) > 12) {
      newErrors.month = "Month must be between 1 and 12";
    }

    if (!/^\d{4}$/.test(year)) {
      newErrors.year = "Year must be 4 digits";
    }

    if (Object.keys(newErrors).length === 0) {
      const birthDate = new Date(year, month - 1, day);

      if (
        birthDate.getFullYear() !== Number(year) ||
        birthDate.getMonth() !== Number(month) - 1 ||
        birthDate.getDate() !== Number(day)
      ) {
        newErrors.age = "Invalid date";
      } else {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 12 || age > 100) {
          newErrors.age = "Age must be between 12 and 100";
        }
      }
    }

    return newErrors;
  };

  /* -------------------- Handlers -------------------- */
  const handleBirthdayChange = (e) => {
    const { name, value } = e.target;

    if (value !== "" && !/^\d+$/.test(value)) return;

    const updatedBirthday = {
      ...formData.birthday,
      [name]: value,
    };

    setFormData({ ...formData, birthday: updatedBirthday });
    setTouched({ ...touched, [name]: true });

    const validationErrors = validateBirthday(updatedBirthday);
    setErrors(validationErrors);
  };

  const toggleInterest = (label) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(label)
        ? prev.interests.filter((i) => i !== label)
        : [...prev.interests, label],
    }));
  };

  const handleAvatarChange = (e) => {
    setFormData({ ...formData, avatar: e.target.files[0] });
  };

  /* -------------------- Fetch Interests -------------------- */
  useEffect(() => {
    if (step === 2 && interestOptions.length === 0) {
      fetch(`${API_URL}/api/user/onboarding/interests-options`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setInterestOptions(data))
        .catch(console.error);
    }
  }, [step]);

  /* -------------------- Submit Step -------------------- */
  const handleNext = async () => {
    setLoading(true);

    try {
      let endpoint = "";
      let body;

      if (step === 1) {
        const validationErrors = validateBirthday(formData.birthday);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
          setLoading(false);
          return;
        }

        endpoint = "birthday";
        body = JSON.stringify({ birthday: formData.birthday });
      }

      if (step === 2) {
        endpoint = "interests";
        body = JSON.stringify({ interests: formData.interests });
      }

      if (step === 3) {
        endpoint = "avatar";
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

      if (step < 3) setStep(step + 1);
      else navigate("/initial-quizzes/questionsbycategory");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Disable Logic -------------------- */
  const isNextDisabled =
    loading ||
    (step === 1 && Object.keys(errors).length > 0) ||
    (step === 2 && formData.interests.length === 0);

  /* -------------------- UI -------------------- */
  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        {step === 1 && (
          <>
        <h2>{`${name}, When were you born?`} </h2>
            <div className="birthday-inputs">
              {["day", "month", "year"].map((field) => (
                <div key={field}>
                  <input
                    name={field}
                    placeholder={field === "day" ? "DD" : field === "month" ? "MM" : "YYYY"}
                    value={formData.birthday[field]}
                    onChange={handleBirthdayChange}
                  />
                  {touched[field] && errors[field] && (
                    <span className="error-text">{errors[field]}</span>
                  )}
                </div>
              ))}
              
            </div>
            {errors.age && <span className="error-text-age">{errors.age}</span>}
          </>
        )}

        {step === 2 && (
          <>
            <h2>What are your interests?</h2>
            <div className="interests-grid">
              {interestOptions.map((opt) => (
                <div
                  key={opt._id}
                  className={`interest-item ${
                    formData.interests.includes(opt.label) ? "selected" : ""
                  }`}
                  onClick={() => toggleInterest(opt.label)}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
  <div className="upload-foto">
    <h2>Upload your profile picture</h2>

    <label className="upload-wrapper">
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        hidden
      />
      <span className="upload-btn">Choose Photo</span>
    </label>

    {formData.avatar && (
      <div className="avatar-preview-wrapper">
        <img
          src={URL.createObjectURL(formData.avatar)}
          alt="Avatar Preview"
          className="avatar-preview"
        />
      </div>
    )}
  </div>
)}


        <div className="onboarding-actions">
          {step >= 1 && (
            <button onClick={() => setStep(step + 1)} className="skip-btn">
              Skip
            </button>
          )}
          <button onClick={handleNext} disabled={isNextDisabled} className="next-btn">
            {loading ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiStepOnboarding;
