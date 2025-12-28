import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import './HowItWorksComponent.css';

const HowItWorksComponent = ({ features = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="how-it-works-component">
      {/* Hero Section */}
      <section className="how-it-works-component__hero">
        <div className="how-it-works-component__hero-content">
          <h1 className="how-it-works-component__hero-title">
            How <span className="how-it-works-component__highlight">UnlockMe</span> Works
          </h1>
          <p className="how-it-works-component__hero-subtitle">
            Discover the science behind meaningful connections.
          </p>
        </div>
      </section>

      {/* Features List */}
      <section className="how-it-works-component__features-list">
        {features.map((feature, index) => {
          const isReversed = index % 2 !== 0;
          return (
            <Motion.div 
              key={index}
              className={`how-it-works-component__item ${isReversed ? 'how-it-works-component__item--reversed' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="how-it-works-component__item-content">
                <div className="how-it-works-component__item-icon-wrapper">
                  <span className="how-it-works-component__item-icon-svg">{feature.icon}</span>
                </div>
                <h2 className="how-it-works-component__item-title">{feature.title}</h2>
                <p className="how-it-works-component__item-desc">{feature.description}</p>
              </div>
              
              <div className="how-it-works-component__item-visual">
                <div className="how-it-works-component__visual-card">
                  <div className="how-it-works-component__visual-content">
                    <span className="how-it-works-component__visual-icon">{feature.icon}</span>
                  </div>
                  <div className="how-it-works-component__visual-glow"></div>
                </div>
              </div>
            </Motion.div>
          );
        })}
      </section>

      {/* CTA Section */}
      <section className="how-it-works-component__cta">
        <div className="how-it-works-component__cta-content">
          <h2 className="how-it-works-component__cta-title">Ready to find your match?</h2>
          <p className="how-it-works-component__cta-text">Join thousands of others who have found their perfect partner.</p>
          <button className="how-it-works-component__cta-btn" onClick={() => navigate('/signup')}>
            <span className="how-it-works-component__cta-btn-text">Get Started For Free</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksComponent;