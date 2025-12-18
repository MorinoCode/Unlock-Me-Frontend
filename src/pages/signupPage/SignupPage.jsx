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

  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword, gender, lookingFor } =
    formData;

  // ---------- Validation ----------
  const validate = () => {
    const newErrors = {};

    if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password)
    ) {
      newErrors.password =
        "Min 6 chars, uppercase, lowercase, number & symbol";
    }

    if (confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  useEffect(() => {
    validate();
  }, [formData]);

  // ---------- Handlers ----------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setServerMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/signin");
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

  // ---------- UI ----------
  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2 className="signup-title">UnlockMe</h2>
        <p className="signup-subtitle">
          Create your profile and start unlocking!
        </p>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <input
            name="name"
            placeholder="Name"
            value={name}
            onChange={handleChange}
            className="signup-input"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            className="signup-input"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
            className="signup-input"
          />
          {errors.password && (
            <span className="error-text">{errors.password}</span>
          )}

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleChange}
            className="signup-input"
          />
          {errors.confirmPassword && (
            <span className="error-text">{errors.confirmPassword}</span>
          )}

          <select
            name="gender"
            value={gender}
            onChange={handleChange}
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
            className="signup-input"
          >
            <option value="">Looking For</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
          {errors.lookingFor && (
            <span className="error-text">{errors.lookingFor}</span>
          )}

          {serverMessage && (
            <div className="server-message">{serverMessage}</div>
          )}

          <button
            type="submit"
            className="signup-button"
            disabled={!isFormValid || loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="signup-footer">
          Already have an account? <a href="/login">Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
