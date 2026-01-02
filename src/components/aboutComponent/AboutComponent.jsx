import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion} from 'framer-motion';
import './AboutComponent.css';

const AboutComponent = ({ values = [], stats = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="about-component">
      
     
      <section className="about-component__hero">
        <div className="about-component__hero-content">
          <Motion.h1 
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

      {/* --- Story Section --- */}
      <section className="about-component__story">
        <div className="about-component__story-container">
          <div className="about-component__story-text">
            <h2 className="about-component__section-title">Our Story</h2>
            <p className="about-component__text">
              In a world of endless swiping and superficial judgments, we realized something was missing: <strong>Depth</strong>. 
              Most apps focus on how you look in a split second. We wanted to focus on who you truly are.
            </p>
            <p className="about-component__text">
              Founded by a team of psychologists and data scientists, UnlockMe was built to bridge the gap between technology and human emotion. 
              We utilize advanced personality algorithms and deep-learning compatibility models to ensure that when you match, it actually means something.
            </p>
          </div>
          <div className="about-component__story-visual">
            <div className="about-component__image-placeholder">
              {/* Here you would put an actual image/illustration */}
              <div className="about-component__image-glow"></div>
              <span>Our Vision</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section className="about-component__stats">
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
              <h3 className="about-component__stat-value">{stat.value}</h3>
              <p className="about-component__stat-label">{stat.label}</p>
            </Motion.div>
          ))}
        </div>
      </section>

      {/* --- Values Section --- */}
      <section className="about-component__values">
        <h2 className="about-component__section-title about-component__center-text">Why We Are Different</h2>
        <div className="about-component__values-grid">
          {values.map((val, index) => (
            <Motion.div 
              key={index} 
              className="about-component__value-card"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="about-component__value-icon">{val.icon}</div>
              <h3 className="about-component__value-title">{val.title}</h3>
              <p className="about-component__value-desc">{val.description}</p>
            </Motion.div>
          ))}
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="about-component__cta">
        <div className="about-component__cta-content">
          <h2 className="about-component__cta-title">Ready to Unlock Your Match?</h2>
          <p className="about-component__cta-text">Join the community that values real connections over random swipes.</p>
          <button className="about-component__cta-btn" onClick={() => navigate('/signup')}>
            Join UnlockMe Today
          </button>
        </div>
      </section>

    </div>
  );
};

export default AboutComponent;