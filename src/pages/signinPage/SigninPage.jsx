import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SigninPage.css";

const SigninPage = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Track which fields the user has touched
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const validate = () => {
    const newErrors = {};

    // Only set errors if the field has been touched
    if (touched.email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (touched.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password)) {
      newErrors.password = "Min 6 chars, uppercase, lowercase, number & symbol";
    }

    setErrors(newErrors);

    // Form validity for the button should check the actual logic, regardless of "touched"
    const logicValid = 
      /\S+@\S+\.\S+/.test(email) && 
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password);
    
    setIsFormValid(logicValid);
  };

  useEffect(() => {
    validate();
  }, [formData, touched]); // Re-run when formData OR touched state changes

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setServerMessage("");
  };

  // Set field to touched when user clicks out of the input
  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "unlock-me-user",
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
          })
        );
        navigate("/initial-quizzes");
      } else {
        setServerMessage(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setServerMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h2 className="signin-title">UnlockMe</h2>
        <p className="signin-subtitle">Sign in and unlock connections!</p>

        <form onSubmit={handleSubmit} className="signin-form" noValidate>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur} // <--- Trigger touched state
            className="signin-input"
            autoFocus
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
            onBlur={handleBlur} // <--- Trigger touched state
            className="signin-input"
          />
          {errors.password && (
            <span className="error-text">{errors.password}</span>
          )}

          {serverMessage && (
            <div className="server-message">{serverMessage}</div>
          )}

          <button
            type="submit"
            className="signin-button"
            disabled={!isFormValid || loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="signin-footer">
          <p>
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;