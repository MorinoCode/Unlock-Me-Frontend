import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion} from 'framer-motion';
import { IoEye, IoRocketOutline, IoBulb, IoGlobe, IoHeart, IoPeople } from 'react-icons/io5';
import './AboutComponent.css';

const AboutComponent = ({ values = [], stats = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="about-component">
      {/* Hero Section */}
      <section className="about-component__hero" aria-labelledby="hero-title">
        <div className="about-component__hero-content">
          <Motion.h1 
            id="hero-title"
            className="about-component__hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Reimagining <span className="about-component__highlight">Human Connection</span>
          </Motion.h1>
          <Motion.p 
            className="about-component__hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            UnlockMe is not just another dating app. It’s a science-backed platform designed to unlock the code to meaningful relationships.
          </Motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-component__story" aria-labelledby="story-title">
        <div className="about-component__story-container">
          <div className="about-component__story-text">
            <h2 id="story-title" className="about-component__section-title">Our Story</h2>
            <p className="about-component__text">
              In a world of endless swiping and superficial judgments, we realized something was missing: <strong>Depth</strong>. 
              Most apps focus on how you look in a split second. We wanted to focus on who you truly are.
            </p>
            <p className="about-component__text">
              Founded by a team of psychologists and data scientists, UnlockMe was built to bridge the gap between technology and human emotion. 
              We utilize advanced personality algorithms and deep-learning compatibility models to ensure that when you match, it actually means something.
            </p>
          </div>
          <div className="about-component__story-visual" aria-hidden="true">
            <Motion.div 
              className="about-component__image-placeholder"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="about-component__image-glow"></div>
              <div className="about-component__visual-content">
                <div className="about-component__visual-icon-container">
                  <IoBulb className="about-component__visual-icon about-component__visual-icon--bulb" />
                  <IoGlobe className="about-component__visual-icon about-component__visual-icon--globe" />
                  <IoHeart className="about-component__visual-icon about-component__visual-icon--heart" />
                  <IoPeople className="about-component__visual-icon about-component__visual-icon--people" />
                </div>
                <h3 className="about-component__visual-title">Our Vision</h3>
                <p className="about-component__visual-subtitle">Connecting hearts worldwide</p>
              </div>
              <div className="about-component__visual-particles">
                <div className="about-component__visual-particle"></div>
                <div className="about-component__visual-particle"></div>
                <div className="about-component__visual-particle"></div>
                <div className="about-component__visual-particle"></div>
                <div className="about-component__visual-particle"></div>
              </div>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="about-component__mission" aria-labelledby="mission-title">
        <div className="about-component__mission-container">
          <Motion.div
            className="about-component__mission-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="mission-title" className="about-component__mission-title">Our Mission</h2>
            <p className="about-component__mission-text">
              To revolutionize the way people connect by using science-backed personality matching, 
              ensuring every match is meaningful and every relationship has the foundation to thrive.
            </p>
          </Motion.div>

          <Motion.div
            className="about-component__mission-card about-component__vision-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="about-component__vision-icon-wrapper">
              <IoEye className="about-component__vision-icon" />
              <div className="about-component__vision-glow"></div>
            </div>
            <h2 className="about-component__mission-title about-component__vision-title">Our Vision</h2>
            <p className="about-component__mission-text about-component__vision-text">
              To become the world's most trusted platform for meaningful connections, 
              where technology and human emotion work together to create lasting relationships 
              based on genuine compatibility and shared values.
            </p>
            <div className="about-component__vision-decoration">
              <div className="about-component__vision-particle"></div>
              <div className="about-component__vision-particle"></div>
              <div className="about-component__vision-particle"></div>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-component__stats" aria-labelledby="stats-title">
        <h2 id="stats-title" className="about-component__visually-hidden">Our Impact</h2>
        <div className="about-component__stats-grid">
          {stats.map((stat, index) => (
            <Motion.div 
              key={index}
              className="about-component__stat-item"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="about-component__stat-value" aria-label={`${stat.value} ${stat.label}`}>
                {stat.value}
              </h3>
              <p className="about-component__stat-label">{stat.label}</p>
            </Motion.div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="about-component__values" aria-labelledby="values-title">
        <h2 id="values-title" className="about-component__section-title about-component__center-text">Why We Are Different</h2>
        <div className="about-component__values-grid">
          {values.map((val, index) => (
            <Motion.article 
              key={index} 
              className="about-component__value-card"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="about-component__value-icon" aria-hidden="true">{val.icon}</div>
              <h3 className="about-component__value-title">{val.title}</h3>
              <p className="about-component__value-desc">{val.description}</p>
            </Motion.article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-component__cta" aria-labelledby="cta-title">
        <div className="about-component__cta-content">
          <h2 id="cta-title" className="about-component__cta-title">Ready to Unlock Your Match?</h2>
          <p className="about-component__cta-text">Join the community that values real connections over random swipes.</p>
          <button 
            className="about-component__cta-btn" 
            onClick={() => navigate('/signup')}
            aria-label="Join UnlockMe and create your account"
          >
            Join UnlockMe Today
          </button>
        </div>
      </section>

    </div>
  );
};

export default AboutComponent;