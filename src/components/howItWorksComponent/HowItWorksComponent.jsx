import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { UserPlus, FileText, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import './HowItWorksComponent.css';

const HowItWorksComponent = ({ features = [] }) => {
  const navigate = useNavigate();

  // Step-by-step process (استاندارد جهانی)
  const steps = [
    {
      number: 1,
      title: "Create Your Profile",
      description: "Sign up in seconds and complete your profile with photos, interests, and personality traits.",
      icon: <UserPlus size={32} />,
    },
    {
      number: 2,
      title: "Complete DNA Quiz",
      description: "Answer our comprehensive personality quiz to help our algorithm understand who you truly are.",
      icon: <FileText size={32} />,
    },
    {
      number: 3,
      title: "Discover Matches",
      description: "Browse through compatible profiles based on DNA-level matching and compatibility scores.",
      icon: <Heart size={32} />,
    },
    {
      number: 4,
      title: "Start Conversations",
      description: "Connect with your matches using our smart icebreakers and start meaningful conversations.",
      icon: <MessageCircle size={32} />,
    },
    {
      number: 5,
      title: "Find Your Match",
      description: "Build genuine connections and find your perfect partner through meaningful interactions.",
      icon: <CheckCircle size={32} />,
    },
  ];

  return (
    <div className="how-it-works-component">
      {/* Hero Section */}
      <section className="how-it-works-component__hero" aria-labelledby="hero-title">
        <div className="how-it-works-component__hero-content">
          <h1 id="hero-title" className="how-it-works-component__hero-title">
            How <span className="how-it-works-component__highlight">UnlockMe</span> Works
          </h1>
          <p className="how-it-works-component__hero-subtitle">
            Discover the science behind meaningful connections.
          </p>
        </div>
      </section>

      {/* Step-by-Step Process (استاندارد جهانی) */}
      <section className="how-it-works-component__steps" aria-labelledby="steps-title">
        <div className="how-it-works-component__steps-container">
          <h2 id="steps-title" className="how-it-works-component__steps-title">
            Get Started in 5 Simple Steps
          </h2>
          <div className="how-it-works-component__steps-grid">
            {steps.map((step, index) => (
              <Motion.div
                key={step.number}
                className="how-it-works-component__step-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="how-it-works-component__step-number">{step.number}</div>
                <div className="how-it-works-component__step-icon">{step.icon}</div>
                <h3 className="how-it-works-component__step-title">{step.title}</h3>
                <p className="how-it-works-component__step-description">{step.description}</p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="how-it-works-component__features-list" aria-labelledby="features-title">
        <h2 id="features-title" className="how-it-works-component__section-title">Our Advanced Features</h2>
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
                <div className="how-it-works-component__item-icon-wrapper" aria-hidden="true">
                  <span className="how-it-works-component__item-icon-svg">{feature.icon}</span>
                </div>
                <h3 className="how-it-works-component__item-title">{feature.title}</h3>
                <p className="how-it-works-component__item-desc">{feature.description}</p>
              </div>
              
              <div className="how-it-works-component__item-visual" aria-hidden="true">
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
      <section className="how-it-works-component__cta" aria-labelledby="cta-title">
        <div className="how-it-works-component__cta-content">
          <h2 id="cta-title" className="how-it-works-component__cta-title">Ready to find your match?</h2>
          <p className="how-it-works-component__cta-text">Join thousands of others who have found their perfect partner.</p>
          <button 
            className="how-it-works-component__cta-btn" 
            onClick={() => navigate('/signup')}
            aria-label="Get started and create your account"
          >
            <span className="how-it-works-component__cta-btn-text">Get Started For Free</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksComponent;