import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth.js";
import FormInput from "../../components/formInput/FormInput";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout.jsx";
import SEO from "../../components/seo/SEO.jsx";
import "./SigninPage.css";

const SigninPage = () => {
  const { t } = useTranslation();
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
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const { email, password } = formData;

  const emailRegex = useMemo(() => /\S+@\S+\.\S+/, []);
  // ✅ Security Fix: For signin, password should only check minimum length, not complexity
  const passwordMinLength = 6;

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (touched.email && !emailRegex.test(email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    if (touched.password && password.length > 0 && password.length < passwordMinLength) {
      newErrors.password = t('auth.passwordMinLength');
    }

    setErrors(newErrors);

    const logicValid = emailRegex.test(email) && password.length >= passwordMinLength;
    setIsFormValid(logicValid);
  }, [email, password, touched, emailRegex, passwordMinLength, t]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateForm();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [validateForm]);

  // ✅ Security Fix: Rate limiting
  useEffect(() => {
    if (attemptCount >= 5) {
      setIsRateLimited(true);
      const timer = setTimeout(() => {
        setIsRateLimited(false);
        setAttemptCount(0);
      }, 60000); // 1 minute
      return () => clearTimeout(timer);
    }
  }, [attemptCount]);

  const handleChange = useCallback((e) => {
    let value = e.target.value;
    const fieldName = e.target.name;
    
    // ✅ Security Fix: Normalize email input
    if (fieldName === "email") {
      value = value.toLowerCase().trim();
    }
    
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (serverMessage) setServerMessage("");
  }, [serverMessage]);

  const handleBlur = useCallback((e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading || isRateLimited) return;

    setLoading(true);
    setServerMessage("");
    setAttemptCount(prev => prev + 1);

    try {
      // ✅ Security Fix: Normalize email before sending (backend also does this, but good practice)
      const normalizedData = {
        email: email.toLowerCase().trim(),
        password: password,
      };

      const response = await fetch(`${API_URL}/api/user/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(normalizedData),
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ Security Fix: Generic error message to prevent user enumeration
        setServerMessage(t('auth.invalidCredentials'));
        return;
      }

      // Reset attempt count on success
      setAttemptCount(0);
      await checkAuth();
      navigate("/explore");
    } catch (err) {
      console.error(err);
      setServerMessage(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <SEO 
        title={`${t('auth.signin')} | ${t('common.appName')}`}
        description={t('auth.signinDescription')}
        keywords="signin, login, sign in, unlock me, dating app, account"
      />
      <div className="signin-card">
        <h1 className="signin-card__title">{t('common.appName')}</h1>
        <p className="signin-card__subtitle">{t('auth.signinSubtitle')}</p>

        <form onSubmit={handleSubmit} className="signin-card__form" noValidate>
          <FormInput
            name="email"
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors.email}
            autoFocus
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            aria-label={t('auth.email')}
            aria-describedby={touched.email && errors.email ? "email-error" : undefined}
            aria-invalid={touched.email && errors.email ? "true" : "false"}
          />
          {touched.email && errors.email && (
            <span id="email-error" className="visually-hidden" role="alert">{errors.email}</span>
          )}

          <FormInput
            name="password"
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && errors.password}
            autoComplete="current-password"
            aria-label={t('auth.password')}
            aria-describedby={touched.password && errors.password ? "password-error" : undefined}
            aria-invalid={touched.password && errors.password ? "true" : "false"}
          />
          {touched.password && errors.password && (
            <span id="password-error" className="visually-hidden" role="alert">{errors.password}</span>
          )}
          
          <p className="signin-card__forgot-text">
            {t('auth.forgotPassword')}{" "}
            <Link to="/forgot-password" className="signin-card__forgot-link" aria-label={t('auth.forgotPassword')}>
              {t('auth.forgotPassword')}
            </Link>
          </p>

          {serverMessage && (
            <div className="signin-card__message" role="alert" aria-live="polite">
              {serverMessage}
            </div>
          )}

          {isRateLimited && (
            <div className="signin-card__message" role="alert" aria-live="polite">
              {t('auth.rateLimitMessage')}
            </div>
          )}

          <button
            type="submit"
            className="signin-card__btn"
            disabled={!isFormValid || loading || isRateLimited}
            aria-label={loading ? t('auth.signingIn') : t('auth.signin')}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="signin-card__spinner" aria-hidden="true"></span>
                {t('auth.signingIn')}
              </>
            ) : (
              t('auth.signin')
            )}
          </button>
        </form>

        <div className="signin-card__footer">
          <p className="signin-card__footer-text">
            {t('auth.dontHaveAccount')}{" "}
            <Link to="/signup" className="signin-card__footer-link" aria-label={t('auth.signup')}>
              {t('auth.signup')}
            </Link>
          </p>
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default SigninPage;