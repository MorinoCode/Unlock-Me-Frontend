import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Globe,
  Shield,
  Zap,
  ArrowRight,
  Star,
  LayoutDashboard,
  Heart,
  Fingerprint,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/useAuth.js";
import "./HomePage.css";

const HomePage = () => {
  const { currentUser } = useAuth();

  // انیمیشن‌های پایه
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const globeAnimation = {
    animate: {
      rotate: 360,
      transition: { duration: 20, repeat: Infinity, ease: "linear" },
    },
  };

  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 3, repeat: Infinity },
    },
  };

  return (
    <div className="home-page">
      {/* --- HERO SECTION --- */}
      <header className="home-page__hero">
        {/* المان متحرک پس‌زمینه (کره زمین انتزاعی) */}
        <Motion.div
          className="home-page__globe-bg"
          variants={globeAnimation}
          animate="animate"
        >
          <Globe
            size={400}
            strokeWidth={0.5}
            className="home-page__globe-icon"
          />
        </Motion.div>

        <Motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="home-page__hero-content"
        >
          <div className="home-page__badge">
            <Star size={14} className="home-page__badge-icon" />
            <span>Discover your local community</span>
          </div>

          <h1 className="home-page__title">
            Unlock Your{" "}
            <span className="home-page__title--gradient">Connection</span>
          </h1>

          <p className="home-page__subtitle">
            Experience the next generation of social networking. Match based on
            DNA-level interests and find your perfect connection.
          </p>

          <div className="home-page__actions">
            {currentUser ? (
              <Link
                to="/feed"
                className="home-page__btn home-page__btn--primary"
              >
                Go to Feed <LayoutDashboard size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="home-page__btn home-page__btn--primary"
                >
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link
                  to="/signin"
                  className="home-page__btn home-page__btn--secondary"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </Motion.div>
      </header>

      {/* --- INTERACTIVE FEATURES SECTION --- */}
      <section className="home-page__features">
        <div className="home-page__section-header">
          <h2 className="home-page__section-title">Beyond Just Swiping</h2>
        </div>

        <div className="home-page__bento-grid">
          {/* بخش DNA & Matching Percentage */}
          <Motion.div
            whileHover={{ y: -10 }}
            className="home-page__card home-page__card--large"
          >
            <div className="home-page__match-viz">
              <Motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="home-page__dna-circle"
              >
                <Fingerprint size={80} />
              </Motion.div>
              <div className="home-page__match-percentage">
                <Motion.span
                  animate={{ opacity: [0, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  98% Match
                </Motion.span>
              </div>
            </div>
            <h3 className="home-page__card-title">DNA Matching</h3>
            <p className="home-page__card-desc">
              Our algorithm analyzes deep interests to show your compatibility
              percentage at a glance.
            </p>
          </Motion.div>

          {/* بخش Blind Date */}
          <Motion.div
            whileHover={{ y: -10 }}
            className="home-page__card home-page__card--small"
          >
            <Motion.div
              variants={pulseAnimation}
              animate="animate"
              className="home-page__blind-icon"
            >
              <Search size={40} />
            </Motion.div>
            <h3 className="home-page__card-title">Blind Date</h3>
            <p className="home-page__card-desc">
              Connect based on personality, not just photos.
            </p>
          </Motion.div>

          {/* بخش Swipe Animation */}
          <Motion.div
            whileHover={{ y: -10 }}
            className="home-page__card home-page__card--small"
          >
            <div className="home-page__swipe-viz">
              <Motion.div
                animate={{ x: [-20, 20, -20] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="home-page__swipe-card"
              >
                <Heart fill="#ef4444" color="#ef4444" />
              </Motion.div>
            </div>
            <h3 className="home-page__card-title">Smart Swipe</h3>
            <p className="home-page__card-desc">
              Efficient, fun, and location-targeted browsing.
            </p>
          </Motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
