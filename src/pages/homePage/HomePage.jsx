import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-wrapper">
      <header className="home-hero">
        <h1 className="home-title">UnlockMe</h1>
        <p className="home-subtitle">
          Connect with people who truly match your interests and lifestyle.
        </p>

        <div className="home-actions">
          <Link to="/signup" className="primary-btn">
            Get Started
          </Link>
          <Link to="/signin" className="secondary-btn">
            Login
          </Link>
        </div>
      </header>

      <section className="home-features">
        <div className="feature-card">
          <span className="feature-icon">🎯</span>
          <h3>Smart Matching</h3>
          <p>We ask the right questions to match you better.</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">💬</span>
          <h3>Real Connections</h3>
          <p>Chat with people who share your interests.</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">🔒</span>
          <h3>Privacy First</h3>
          <p>Your data is safe and fully under your control.</p>
        </div>
      </section>

      <footer className="home-footer">
        © {new Date().getFullYear()} UnlockMe. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
