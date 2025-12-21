import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js"; 
import "./SigninPage.css";

const SigninPage = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth(); 

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

    if (touched.email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (touched.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password)) {
      newErrors.password = "Min 6 chars, uppercase, lowercase, number & symbol";
    }

    setErrors(newErrors);

    const logicValid = 
      /\S+@\S+\.\S+/.test(email) && 
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password);
    
    setIsFormValid(logicValid);
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
      const response = await fetch(`${API_URL}/api/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data.user); 

        localStorage.setItem(
          "unlock-me-user",
          JSON.stringify({
            id: data.user.id || data.user._id,
            name: data.user.name,
          })
        );
        
        navigate("/explore"); 
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
            onBlur={handleBlur}
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
            onBlur={handleBlur}
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