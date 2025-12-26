import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="home-page__hero">
        <h1 className="home-page__title">UnlockMe</h1>
        <p className="home-page__subtitle">
          Connect with people who truly match your interests and lifestyle.
        </p>

        <div className="home-page__actions">
          <Link to="/signup" className="home-page__btn home-page__btn--primary">
            Get Started
          </Link>
          <Link to="/signin" className="home-page__btn home-page__btn--secondary">
            Login
          </Link>
        </div>
      </header>

      <section className="home-page__features">
        <div className="home-page__feature-card">
          <span className="home-page__feature-icon">🎯</span>
          <h3 className="home-page__feature-title">Smart Matching</h3>
          <p className="home-page__feature-desc">We ask the right questions to match you better.</p>
        </div>

        <div className="home-page__feature-card">
          <span className="home-page__feature-icon">💬</span>
          <h3 className="home-page__feature-title">Real Connections</h3>
          <p className="home-page__feature-desc">Chat with people who share your interests.</p>
        </div>

        <div className="home-page__feature-card">
          <span className="home-page__feature-icon">🔒</span>
          <h3 className="home-page__feature-title">Privacy First</h3>
          <p className="home-page__feature-desc">Your data is safe and fully under your control.</p>
        </div>
      </section>

      <footer className="home-page__footer">
        © {new Date().getFullYear()} UnlockMe. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;