import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Globe,
  ArrowRight,
  Star,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../context/useAuth.js";
import matchesPic from "../../assets/matchesPic.webp";
import blindDatesPic from "../../assets/blindDatesPic.webp";
import swipeMatchPic from "../../assets/swipe&matchPic.webp";
import "./HomePage.css";

const HomePage = () => {
  const { currentUser } = useAuth();

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

  const floatAnimation = {
    animate: {
      y: [-10, 10, -10],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="home-page">
      <header className="home-page__hero">
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

      <section className="home-page__features">
        <div className="home-page__section-header">
          <h2 className="home-page__section-title">Beyond Just Swiping</h2>
        </div>

        <div className="home-page__bento-grid">

           <Motion.div
            whileHover={{ y: -5 }}
            className="home-page__card home-page__card--small"
          >
            <div className="home-page__viz-container">
              <Motion.img
                src={swipeMatchPic}
                alt="Smart Swipe"
                className="home-page__feature-img"
                variants={floatAnimation}
                animate="animate"
              />
            </div>
            <h3 className="home-page__card-title">Smart Swipe</h3>
            <p className="home-page__card-desc">
              Efficient, fun, and location-targeted browsing.
            </p>
          </Motion.div>
          <Motion.div
            whileHover={{ y: -5 }}
            className="home-page__card home-page__card--large"
          >
            <div className="home-page__viz-container">
              <Motion.img
                src={matchesPic}
                alt="DNA Matching"
                className="home-page__feature-img"
                variants={floatAnimation}
                animate="animate"
              />
            </div>
            <h3 className="home-page__card-title">DNA Matching</h3>
            <p className="home-page__card-desc">
              Our algorithm analyzes deep interests to show your compatibility
              percentage at a glance.
            </p>
          </Motion.div>

          

          <Motion.div
            whileHover={{ y: -5 }}
            className="home-page__card home-page__card--small"
          >
            <div className="home-page__viz-container">
              <Motion.img
                src={blindDatesPic}
                alt="Blind Date"
                className="home-page__feature-img"
                variants={floatAnimation}
                animate="animate"
              />
            </div>
            <h3 className="home-page__card-title">Blind Date</h3>
            <p className="home-page__card-desc">
              Connect based on personality, not just photos.
            </p>
          </Motion.div>

         
        </div>
      </section>
    </div>
  );
};

export default HomePage;