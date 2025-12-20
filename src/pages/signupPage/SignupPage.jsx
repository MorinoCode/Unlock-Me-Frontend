import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

const SignupPage = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    lookingFor: "",
  });

  // Track which fields have been interacted with
  const [touched, setTouched] = useState({});

  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword, gender, lookingFor } = formData;

  // ---------- Validation ----------
const validate = () => {
  const newErrors = {};

  // Visual error logic (only shows after user interacts)
  if (touched.name && name.trim().length < 2) newErrors.name = "Name is too short";
  if (touched.email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";
  if (touched.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password))
    newErrors.password = "Min 6 chars, uppercase, lowercase, number & symbol";
  if (touched.confirmPassword && confirmPassword !== password)
    newErrors.confirmPassword = "Passwords do not match";
  
  // Errors for Select fields
  if (touched.gender && !gender) newErrors.gender = "Gender is required";
  if (touched.lookingFor && !lookingFor) newErrors.lookingFor = "This field is required";

  setErrors(newErrors);

  // CRITICAL: Button activation logic
  const isValid = 
    name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(email) &&
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password) &&
    confirmPassword === password &&
    password !== "" &&
    gender !== "" &&       // Checks if a gender is selected
    lookingFor !== "";     // Checks if a lookingFor option is selected

  setIsFormValid(isValid);
};

  useEffect(() => {
    validate();
  }, [formData, touched]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setServerMessage("");
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "unlock-me-user",
          JSON.stringify({ id: data.user.id, name: data.user.name })
        );
        navigate("/initial-quizzes");
      } else {
        setServerMessage(data.message || "Signup failed");
      }
    } catch (err) {
      setServerMessage("Server error. Try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2 className="signup-title">UnlockMe</h2>
        <p className="signup-subtitle">Create your profile and start unlocking!</p>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <input
            name="name"
            placeholder="Name"
            value={name}
            onChange={handleChange}
            onBlur={handleBlur}
            className="signup-input"
            autoFocus
          />
          {errors.name && <span className="error-text">{errors.name}</span>}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            className="signup-input"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
            onBlur={handleBlur}
            className="signup-input"
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className="signup-input"
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

          <select
            name="gender"
            value={gender}
            onChange={handleChange}
            onBlur={handleBlur}
            className="signup-input"
          >
            <option value="">Select Your Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <span className="error-text">{errors.gender}</span>}

          <select
            name="lookingFor"
            value={lookingFor}
            onChange={handleChange}
            onBlur={handleBlur}
            className="signup-input"
          >
            <option value="">Looking For</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
          {errors.lookingFor && <span className="error-text">{errors.lookingFor}</span>}

          {serverMessage && <div className="server-message">{serverMessage}</div>}

          <button
            type="submit"
            className="signup-button"
            disabled={!isFormValid || loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="signup-footer">
          Already have an account? <a href="/signin">Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;