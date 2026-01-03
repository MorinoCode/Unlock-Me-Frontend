import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/formInput/FormInput";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout.jsx";
import "./ForgotPasswordPage.css";

const ForgotPassword = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
  });

  const [touched, setTouched] = useState({
    email: false,
  });

  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { email } = formData;

  const emailRegex = useMemo(() => /\S+@\S+\.\S+/, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (touched.email && !emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);

    const logicValid = emailRegex.test(email);
    setIsFormValid(logicValid);
  }, [email, touched, emailRegex]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateForm();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [validateForm]);

  const handleChange = useCallback((e) => {
    const value =
      e.target.name === "email" ? e.target.value.trim() : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
    setServerMessage("");
  }, []);

  const handleBlur = useCallback((e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setServerMessage("");

    try {
      const response = await fetch(`${API_URL}/api/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerMessage(data.message || "Request failed");
        return;
      }
      setServerMessage(data.message);

      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      console.error(err);
      setServerMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <div className="forgot-password-card">
        <h2 className="forgot-password-card__title">UnlockMe</h2>
        <p className="forgot-password-card__subtitle">
          Please write your email address!
        </p>

        <form
          onSubmit={handleSubmit}
          className="forgot-password-card__form"
          noValidate
        >
          <FormInput
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors.email}
            autoFocus
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
          />

          {serverMessage && (
            <div className="forgot-password-card__message">{serverMessage}</div>
          )}

          <button
            type="submit"
            className="forgot-password-card__btn"
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <span className="forgot-password-card__spinner"></span>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </BackgroundLayout>
  );
};

export default ForgotPassword;
