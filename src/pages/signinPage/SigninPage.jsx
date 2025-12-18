import React, { useState } from "react";
import "./SigninPage.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted:", { email, password });
    // اینجا API login صدا زده میشه
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">UnlockMe</h2>
        <p className="login-subtitle">Sign in and unlock connections!</p>
        <form onSubmit={handleSubmit} className="login-form">
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
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        <div className="login-footer">
          <p>
            Don't have an account? <a href="/register">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
