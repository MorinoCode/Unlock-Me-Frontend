import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/formInput/FormInput";
import FormSelect from "../../components/formSelect/FormSelect";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import "./SignupPage.css";
import { useAuth } from "../../context/useAuth.js";

// کلمات ممنوعه برای نام کاربری
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

  const { username, name, email, password, confirmPassword, gender, lookingFor } = formData;

  const genderOptions = [
    { value: "Female", label: "Female" },
    { value: "Male", label: "Male" },
    { value: "Other", label: "Other" },
  ];

  // ---------- Validation Logic ----------
  useEffect(() => {
    const newErrors = {};

    // 1. Username Validation (Strict)
    if (touched.username) {
      if (username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      } else if (username.length > 15) { 
        // ✅ چک کردن طول بیش از ۱۵ کاراکتر
        newErrors.username = "Username cannot exceed 15 characters";
      } else if (FORBIDDEN_USERNAMES.includes(username)) {
        newErrors.username = "This username is not available";
      } else if (!/^[a-z0-9_]+$/.test(username)) {
        newErrors.username = "Only lowercase letters, numbers, and underscores allowed";
      }
    }

    // 2. Name Validation
    if (touched.name && name.trim().length < 2)
      newErrors.name = "Name is too short";

    // 3. Email Validation
    if (touched.email && !/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";

    // 4. Password Validation
    if (
      touched.password &&
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password)
    )
      newErrors.password = "Min 6 chars, uppercase, lowercase, number & symbol";

    // 5. Confirm Password
    if (touched.confirmPassword && confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match";

    // 6. Selects
    if (touched.gender && !gender) newErrors.gender = "Gender is required";
    if (touched.lookingFor && !lookingFor)
      newErrors.lookingFor = "This field is required";

    setErrors(newErrors);

    // Form Validity Check
    const isValid =
      username.length >= 3 &&
      /^[a-z0-9_]+$/.test(username) &&
      !FORBIDDEN_USERNAMES.includes(username) &&
      name.trim().length >= 2 &&
      /\S+@\S+\.\S+/.test(email) &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password) &&
      confirmPassword === password &&
      password !== "" &&
      gender !== "" &&
      lookingFor !== "";

    setIsFormValid(isValid);
  }, [formData, touched]);

  // ---------- Handlers ----------
  const handleChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;

    // اعمال تغییرات خاص روی Username
    if (name === "username") {
      // تبدیل به حروف کوچک و حذف فاصله
      value = value.toLowerCase().replace(/\s/g, "");
    }
    if (name === "email") {
      value = value.toLowerCase().trim();
    }

    setFormData({ ...formData, [name]: value });
    
    // پاک کردن پیام سرور هنگام تایپ مجدد
    if (serverMessage) setServerMessage("");
    
    // ریست کردن ارور فیلد جاری برای UX بهتر (اختیاری)
    if (errors[name]) {
         // می‌توان اینجا ارور را نال نکرد تا افکت لحظه‌ای بماند، یا نال کرد
         // setErrors(prev => ({...prev, [name]: null}));
    }
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "unlock-me-user",
          JSON.stringify({ id: data.user.id, name: data.user.name  , username : data.user.username})
        );

        await checkAuth();
        navigate("/initial-quizzes");
      } else {
        // مدیریت هوشمند ارورهای یونیک بودن (Username/Email)
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
            {/* --- Username Field --- */}
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
            />

            {/* --- Name Field --- */}
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
            />

            <FormInput
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
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

            <button
              type="submit"
              className="signup-page__btn"
              disabled={!isFormValid || loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
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