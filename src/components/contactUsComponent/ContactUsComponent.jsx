import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Mail, MessageSquare, Clock, MapPin, Send, CheckCircle } from 'lucide-react';
import './ContactUsComponent.css';

const ContactUsComponent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: <Mail size={24} />,
      title: "Email Us",
      description: "Send us an email anytime",
      contact: "support@unlock-me.app",
      link: "mailto:support@unlock-me.app"
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Response Time",
      description: "We typically respond within",
      contact: "24-48 hours",
      link: null
    },
    {
      icon: <Clock size={24} />,
      title: "Business Hours",
      description: "Monday - Friday",
      contact: "9:00 AM - 6:00 PM EST",
      link: null
    }
  ];

  return (
    <div className="contact-us-component">
      {/* Hero Section */}
      <section className="contact-us-component__hero" aria-labelledby="hero-title">
        <div className="contact-us-component__hero-content">
          <Motion.h1 
            id="hero-title"
            className="contact-us-component__hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Get in <span className="contact-us-component__highlight">Touch</span>
          </Motion.h1>
          <Motion.p 
            className="contact-us-component__hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We're here to help! Whether you have questions, feedback, or need support, our team is ready to assist you.
          </Motion.p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="contact-us-component__methods" aria-labelledby="methods-title">
        <h2 id="methods-title" className="contact-us-component__visually-hidden">Contact Methods</h2>
        <div className="contact-us-component__methods-grid">
          {contactMethods.map((method, index) => (
            <Motion.div
              key={index}
              className="contact-us-component__method-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="contact-us-component__method-icon" aria-hidden="true">
                {method.icon}
              </div>
              <h3 className="contact-us-component__method-title">{method.title}</h3>
              <p className="contact-us-component__method-description">{method.description}</p>
              {method.link ? (
                <a 
                  href={method.link} 
                  className="contact-us-component__method-contact"
                  aria-label={`${method.title}: ${method.contact}`}
                >
                  {method.contact}
                </a>
              ) : (
                <p className="contact-us-component__method-contact">{method.contact}</p>
              )}
            </Motion.div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact-us-component__form-section" aria-labelledby="form-title">
        <div className="contact-us-component__form-container">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 id="form-title" className="contact-us-component__form-title">Send us a Message</h2>
            <p className="contact-us-component__form-subtitle">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>

            {isSubmitted && (
              <Motion.div
                className="contact-us-component__success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle size={24} />
                <span>Thank you! Your message has been sent successfully.</span>
              </Motion.div>
            )}

            <form className="contact-us-component__form" onSubmit={handleSubmit}>
              <div className="contact-us-component__form-group">
                <label htmlFor="name" className="contact-us-component__label">
                  Name <span className="contact-us-component__required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="contact-us-component__input"
                  required
                  aria-required="true"
                  aria-label="Your name"
                />
              </div>

              <div className="contact-us-component__form-group">
                <label htmlFor="email" className="contact-us-component__label">
                  Email <span className="contact-us-component__required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="contact-us-component__input"
                  required
                  aria-required="true"
                  aria-label="Your email address"
                />
              </div>

              <div className="contact-us-component__form-group">
                <label htmlFor="subject" className="contact-us-component__label">
                  Subject <span className="contact-us-component__required">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="contact-us-component__input"
                  required
                  aria-required="true"
                  aria-label="Message subject"
                />
              </div>

              <div className="contact-us-component__form-group">
                <label htmlFor="message" className="contact-us-component__label">
                  Message <span className="contact-us-component__required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="contact-us-component__textarea"
                  rows="6"
                  required
                  aria-required="true"
                  aria-label="Your message"
                ></textarea>
              </div>

              <button
                type="submit"
                className="contact-us-component__submit-btn"
                disabled={isSubmitting}
                aria-label="Send message"
              >
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </Motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsComponent;
