import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import FormInput from "../../components/formInput/FormInput";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout.jsx";
import "./SigninPage.css";

const SigninPage = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

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

  useEffect(() => {
    const newErrors = {};

    if (touched.email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (
      touched.password &&
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password)
    ) {
      newErrors.password = "Min 6 chars, uppercase, lowercase, number & symbol";
    }

    setErrors(newErrors);

    const logicValid =
      /\S+@\S+\.\S+/.test(email) &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password);

    setIsFormValid(logicValid);
  }, [formData, touched, email, password]);

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
    setServerMessage("");

    try {
      const response = await fetch(`${API_URL}/api/user/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerMessage(data.message || "Invalid credentials");
        return;
      }

      // ✅ فقط همین خط اضافه / اصلاح شده
      await checkAuth();
      navigate("/explore");
    } catch (err) {
      console.error(err);
      setServerMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <div className="signin-card">
        <h2 className="signin-card__title">UnlockMe</h2>
        <p className="signin-card__subtitle">Sign in and unlock connections!</p>

        <form onSubmit={handleSubmit} className="signin-card__form" noValidate>
          <FormInput
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors.email}
            autoFocus
          />

          <FormInput
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && errors.password}
          />

          {serverMessage && (
            <div className="signin-card__message">{serverMessage}</div>
          )}

          <button
            type="submit"
            className="signin-card__btn"
            disabled={!isFormValid || loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="signin-card__footer">
          <p className="signin-card__footer-text">
            Don't have an account?{" "}
            <a href="/signup" className="signin-card__footer-link">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default SigninPage;
