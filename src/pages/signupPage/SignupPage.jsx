import React, { useState } from "react";
import "./SignupPage.css";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register submitted:", { name, email, password, gender, lookingFor });
    // اینجا API register صدا زده میشه
  };

  return (
    <div className="login-page">
      <div className="card register-card">
        <h2 className="login-title">UnlockMe</h2>
        <p className="login-subtitle">Create your profile and start unlocking!</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="login-input"
          >
            <option value="">Select Your Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            required
            className="login-input"
          >
            <option value="">Looking For</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit" className="login-button">Sign Up</button>
        </form>
        <div className="login-footer">
          <p>
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
