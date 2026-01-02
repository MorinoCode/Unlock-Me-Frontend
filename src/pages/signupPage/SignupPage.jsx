import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/formInput/FormInput";
import FormSelect from "../../components/formSelect/FormSelect";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
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

  const { username, name, email, password, confirmPassword, gender, lookingFor } = formData;

  const genderOptions = useMemo(() => [
    { value: "Female", label: "Female" },
    { value: "Male", label: "Male" },
    { value: "Other", label: "Other" },
  ], []);

  const usernameRegex = useMemo(() => /^[a-z0-9_]+$/, []);
  const emailRegex = useMemo(() => /\S+@\S+\.\S+/, []);
  const passwordRegex = useMemo(() => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (touched.username) {
      if (username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      } else if (username.length > 15) {
        newErrors.username = "Username cannot exceed 15 characters";
      } else if (FORBIDDEN_USERNAMES.includes(username.toLowerCase())) {
        newErrors.username = "This username is not available";
      } else if (!usernameRegex.test(username)) {
        newErrors.username = "Only lowercase letters, numbers, and underscores allowed";
      }
    }

    if (touched.name && name.trim().length < 2) {
      newErrors.name = "Name is too short";
    }

    if (touched.email && !emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (touched.password && !passwordRegex.test(password)) {
      newErrors.password = "Min 6 chars, uppercase, lowercase, number & symbol";
    }

    if (touched.confirmPassword && confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (touched.gender && !gender) {
      newErrors.gender = "Gender is required";
    }

    if (touched.lookingFor && !lookingFor) {
      newErrors.lookingFor = "This field is required";
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
      lookingFor !== "";

    setIsFormValid(isValid);
  }, [username, name, email, password, confirmPassword, gender, lookingFor, touched, usernameRegex, emailRegex, passwordRegex]);

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
      const response = await fetch(`${API_URL}/api/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
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
      <div className="signup-page">
        <div className="signup-page__card">
          <h2 className="signup-page__title">UnlockMe</h2>
          <p className="signup-page__subtitle">
            Create your profile and start unlocking!
          </p>

          <form
            className="signup-page__form"
            onSubmit={handleSubmit}
            noValidate
          >
            <FormInput
              name="username"
              placeholder="Username (e.g. user_123)"
              value={username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.username && errors.username}
              autoFocus
              autoComplete="username"
              autoCapitalize="none" 
              autoCorrect="off"
              maxLength={15}
            />

            <FormInput
              name="name"
              placeholder="Full Name"
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && errors.name}
              autoComplete="name"
              autoCapitalize="words"
            />

            <FormInput
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
            />

            <FormInput
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && errors.password}
              autoComplete="new-password"
            />

            <FormInput
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
              autoComplete="new-password"
            />

            <FormSelect
              name="gender"
              value={gender}
              options={genderOptions}
              defaultText="Select Your Gender"
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.gender && errors.gender}
            />

            <FormSelect
              name="lookingFor"
              value={lookingFor}
              options={genderOptions}
              defaultText="Looking For"
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.lookingFor && errors.lookingFor}
            />

            {serverMessage && (
              <div className="signup-page__message">{serverMessage}</div>
            )}

            {isRateLimited && (
              <div className="signup-page__message">
                Too many attempts. Please wait 1 minute.
              </div>
            )}

            <button
              type="submit"
              className="signup-page__btn"
              disabled={!isFormValid || loading || isRateLimited}
            >
              {loading ? (
                <>
                  <span className="signup-page__spinner"></span>
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="signup-page__footer">
            Already have an account?{" "}
            <a href="/signin" className="signup-page__link">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default SignupPage;