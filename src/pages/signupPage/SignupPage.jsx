import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormInput from "../../components/formInput/FormInput";
import FormSelect from "../../components/formSelect/FormSelect";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import SEO from "../../components/seo/SEO.jsx";
import "./SignupPage.css";
import { useAuth } from "../../context/useAuth.js";

const FORBIDDEN_USERNAMES = [
  "admin",
  "support",
  "root",
  "superuser",
  "help",
  "info",
  "manager",
  "unlockme",
  "moderator"
];

const SignupPage = () => {
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    lookingFor: "",
    
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { username, name, email, password, confirmPassword, gender, lookingFor } = formData;

  

  const genderOptions = useMemo(() => [
    { value: "Female", label: t('auth.female') },
    { value: "Male", label: t('auth.male') },
    { value: "Other", label: t('auth.other') },
  ], [t]);

  const usernameRegex = useMemo(() => /^[a-z0-9_]+$/, []);
  const emailRegex = useMemo(() => /\S+@\S+\.\S+/, []);
  const passwordRegex = useMemo(() => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (touched.username) {
      if (username.length < 3) {
        newErrors.username = t('auth.usernameMinLength');
      } else if (username.length > 15) {
        newErrors.username = t('auth.usernameMaxLength');
      } else if (FORBIDDEN_USERNAMES.includes(username.toLowerCase())) {
        newErrors.username = t('auth.usernameNotAvailable');
      } else if (!usernameRegex.test(username)) {
        newErrors.username = t('auth.usernameInvalid');
      }
    }

    if (touched.name && name.trim().length < 2) {
      newErrors.name = t('auth.nameTooShort');
    }

    if (touched.email && !emailRegex.test(email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    if (touched.password && !passwordRegex.test(password)) {
      newErrors.password = t('auth.passwordRequirements');
    }

    if (touched.confirmPassword && confirmPassword !== password) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
    }

    if (touched.gender && !gender) {
      newErrors.gender = t('auth.genderRequired');
    }

    if (touched.lookingFor && !lookingFor) {
      newErrors.lookingFor = t('auth.lookingForRequired');
    }

    setErrors(newErrors);

    const isValid =
      username.length >= 3 &&
      username.length <= 15 &&
      usernameRegex.test(username) &&
      !FORBIDDEN_USERNAMES.includes(username.toLowerCase()) &&
      name.trim().length >= 2 &&
      emailRegex.test(email) &&
      passwordRegex.test(password) &&
      confirmPassword === password &&
      password.length > 0 &&
      gender !== "" &&
      lookingFor !== ""&&
      agreedToTerms === true;

    setIsFormValid(isValid);
  }, [username, name, email, password, confirmPassword, gender, lookingFor, touched, usernameRegex, emailRegex, passwordRegex, agreedToTerms, t]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateForm();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [validateForm]);

  useEffect(() => {
    if (attemptCount >= 5) {
      setIsRateLimited(true);
      const timer = setTimeout(() => {
        setIsRateLimited(false);
        setAttemptCount(0);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [attemptCount]);

  const handleChange = useCallback((e) => {
    let value = e.target.value;
    const fieldName = e.target.name;

    if (fieldName === "username") {
      value = value.toLowerCase().replace(/\s/g, "");
    }
    if (fieldName === "email") {
      value = value.toLowerCase().trim();
    }

    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (serverMessage) setServerMessage("");
  }, [serverMessage]);

  const handleBlur = useCallback((e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading || isRateLimited) return;

    setLoading(true);
    setAttemptCount(prev => prev + 1);

    try {
      // ✅ Security Fix: Remove confirmPassword before sending to backend
      const { confirmPassword: _confirmPassword, ...signupData } = formData;
      
      const response = await fetch(`${API_URL}/api/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        await checkAuth();
        navigate("/initial-quizzes");
      } else {
        if (data.message && data.message.toLowerCase().includes("username")) {
          setErrors(prev => ({ ...prev, username: "Username is already taken" }));
        } else if (data.message && data.message.toLowerCase().includes("email")) {
          setErrors(prev => ({ ...prev, email: "Email is already registered" }));
        } else {
          setServerMessage(data.message || "Signup failed");
        }
      }
    } catch (err) {
      setServerMessage("Server error. Try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <SEO 
        title={`${t('auth.signup')} | ${t('common.appName')}`}
        description={t('auth.signupDescription')}
        keywords="signup, register, create account, unlock me, dating app, join"
      />
      <div className="signup-page">
        <div className="signup-page__card">
          <h1 className="signup-page__title">{t('common.appName')}</h1>
          <p className="signup-page__subtitle">
            {t('auth.signupSubtitle')}
          </p>

          <form
            className="signup-page__form"
            onSubmit={handleSubmit}
            noValidate
          >
            <FormInput
              name="username"
              placeholder={t('auth.usernamePlaceholder')}
              value={username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.username && errors.username}
              autoFocus
              autoComplete="username"
              autoCapitalize="none" 
              autoCorrect="off"
              maxLength={15}
              aria-label={t('auth.username')}
              aria-describedby={touched.username && errors.username ? "username-error" : undefined}
              aria-invalid={touched.username && errors.username ? "true" : "false"}
            />
            {touched.username && errors.username && (
              <span id="username-error" className="visually-hidden" role="alert">{errors.username}</span>
            )}

            <FormInput
              name="name"
              placeholder={t('auth.fullNamePlaceholder')}
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && errors.name}
              autoComplete="name"
              autoCapitalize="words"
              aria-label={t('auth.fullName')}
              aria-describedby={touched.name && errors.name ? "name-error" : undefined}
              aria-invalid={touched.name && errors.name ? "true" : "false"}
            />
            {touched.name && errors.name && (
              <span id="name-error" className="visually-hidden" role="alert">{errors.name}</span>
            )}

            <FormInput
              name="email"
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
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
              autoComplete="new-password"
              aria-label={t('auth.password')}
              aria-describedby={touched.password && errors.password ? "password-error" : undefined}
              aria-invalid={touched.password && errors.password ? "true" : "false"}
            />
            {touched.password && errors.password && (
              <span id="password-error" className="visually-hidden" role="alert">{errors.password}</span>
            )}

            <FormInput
              name="confirmPassword"
              type="password"
              placeholder={t('auth.confirmPassword')}
              value={confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
              autoComplete="new-password"
              aria-label={t('auth.confirmPassword')}
              aria-describedby={touched.confirmPassword && errors.confirmPassword ? "confirm-password-error" : undefined}
              aria-invalid={touched.confirmPassword && errors.confirmPassword ? "true" : "false"}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <span id="confirm-password-error" className="visually-hidden" role="alert">{errors.confirmPassword}</span>
            )}

            <FormSelect
              name="gender"
              value={gender}
              options={genderOptions}
              defaultText={t('auth.selectGender')}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.gender && errors.gender}
              aria-label={t('auth.gender')}
              aria-describedby={touched.gender && errors.gender ? "gender-error" : undefined}
              aria-invalid={touched.gender && errors.gender ? "true" : "false"}
            />
            {touched.gender && errors.gender && (
              <span id="gender-error" className="visually-hidden" role="alert">{errors.gender}</span>
            )}

            <FormSelect
              name="lookingFor"
              value={lookingFor}
              options={genderOptions}
              defaultText={t('auth.lookingFor')}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.lookingFor && errors.lookingFor}
              aria-label={t('auth.lookingFor')}
              aria-describedby={touched.lookingFor && errors.lookingFor ? "looking-for-error" : undefined}
              aria-invalid={touched.lookingFor && errors.lookingFor ? "true" : "false"}
            />
            {touched.lookingFor && errors.lookingFor && (
              <span id="looking-for-error" className="visually-hidden" role="alert">{errors.lookingFor}</span>
            )}

            {serverMessage && (
              <div className="signup-page__message">{serverMessage}</div>
            )}

            {isRateLimited && (
              <div className="signup-page__message" role="alert" aria-live="polite">
                {t('auth.rateLimitMessage')}
              </div>
            )}

            <button
              type="submit"
              className="signup-page__btn"
              disabled={!isFormValid || loading || isRateLimited}
              aria-label={loading ? t('auth.creatingAccount') : t('auth.signup')}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="signup-page__spinner" aria-hidden="true"></span>
                  {t('auth.creatingAccount')}
                </>
              ) : (
                t('auth.signup')
              )}
            </button>
            <div className="signup-page__terms">
              <label className="signup-page__terms-label">
                <input
                  type="checkbox"
                  className="signup-page__checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  aria-required="true"
                  aria-invalid={touched.gender && !agreedToTerms ? "true" : "false"}
                  aria-describedby="terms-description"
                />
                <span className="signup-page__terms-text" id="terms-description">
                  {t('auth.agreeToTerms')}{" "}
                  <Link to="/termsofservice" target="_blank" rel="noreferrer" className="signup-page__terms-link">
                    {t('pages.terms.title')}
                  </Link>
                  {" "}{t('common.and')}{" "}
                  <Link to="/privacypolicy" target="_blank" rel="noreferrer" className="signup-page__terms-link">
                    {t('pages.privacy.title')}
                  </Link>
                </span>
              </label>
            </div>
          </form>

          <div className="signup-page__footer">
            {t('auth.alreadyHaveAccount')}{" "}
            <Link to="/signin" className="signup-page__link" aria-label={t('auth.signin')}>
              {t('auth.signin')}
            </Link>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default SignupPage;