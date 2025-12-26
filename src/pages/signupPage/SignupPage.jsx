import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/formInput/FormInput";
import FormSelect from "../../components/formSelect/FormSelect";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import "./SignupPage.css";
import { useAuth } from "../../context/useAuth";

const SignupPage = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [formData, setFormData] = useState({
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

  const { name, email, password, confirmPassword, gender, lookingFor } = formData;

  const genderOptions = [
    { value: "Female", label: "Female" },
    { value: "Male", label: "Male" },
    { value: "Other", label: "Other" },
  ];

  // ---------- Validation Logic ----------
  useEffect(() => {
    const newErrors = {};

    if (touched.name && name.trim().length < 2) 
      newErrors.name = "Name is too short";
    
    if (touched.email && !/\S+@\S+\.\S+/.test(email)) 
      newErrors.email = "Invalid email format";
    
    if (touched.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password))
      newErrors.password = "Min 6 chars, uppercase, lowercase, number & symbol";
    
    if (touched.confirmPassword && confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match";
    
    if (touched.gender && !gender) 
      newErrors.gender = "Gender is required";
    
    if (touched.lookingFor && !lookingFor) 
      newErrors.lookingFor = "This field is required";

    setErrors(newErrors);

    const isValid = 
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
          JSON.stringify({ id: data.user.id, name: data.user.name })
        );
        
        await checkAuth();
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
    <BackgroundLayout>
      <div className="signup-page">
        <div className="signup-page__card">
          <h2 className="signup-page__title">UnlockMe</h2>
          <p className="signup-page__subtitle">Create your profile and start unlocking!</p>

          <form className="signup-page__form" onSubmit={handleSubmit} noValidate>
            
            <FormInput
              name="name"
              placeholder="Name"
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && errors.name}
              autoFocus
            />

            <FormInput
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
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

            {serverMessage && <div className="signup-page__message">{serverMessage}</div>}

            <button
              type="submit"
              className="signup-page__btn"
              disabled={!isFormValid || loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="signup-page__footer">
            Already have an account? <a href="/signin" className="signup-page__link">Sign In</a>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default SignupPage;