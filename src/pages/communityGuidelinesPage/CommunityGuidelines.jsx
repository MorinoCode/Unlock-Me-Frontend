import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowLeft, Users, Heart, Shield, AlertTriangle, Ban, CheckCircle, MessageCircle, FileText } from "lucide-react";
import SEO from "../../components/seo/SEO";
import "./CommunityGuidelines.css";

const CommunityGuidelines = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Community Guidelines | Unlock Me - Our Community Standards"
        description="Read Unlock Me's Community Guidelines to understand our standards for respectful and safe interactions. Learn how we maintain a positive community environment."
        keywords="community guidelines, community standards, code of conduct, respectful behavior, safe dating, Unlock Me guidelines"
      />
      <div className="guidelines-page">
        <div className="guidelines-page__container">
          <button 
            className="guidelines-page__back-btn" 
            onClick={() => navigate(-1)}
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <header className="guidelines-page__header">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="guidelines-page__header-icon" aria-hidden="true">
                <Users size={32} />
              </div>
              <h1 className="guidelines-page__title">Community Guidelines</h1>
              <p className="guidelines-page__date">Last Updated: January 23, 2026</p>
              <p className="guidelines-page__intro">
                At Unlock Me, we're committed to creating a safe, respectful, and welcoming community for everyone. These guidelines help ensure that all members can enjoy a positive experience while using our platform.
              </p>
            </Motion.div>
          </header>

          <div className="guidelines-page__content">
            <Motion.section
              className="guidelines-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="guidelines-page__section-title" id="be-respectful">
                <Heart size={20} className="guidelines-page__section-icon" aria-hidden="true" />
                1. Be Respectful
              </h2>
              <p className="guidelines-page__text">
                Treat all members with kindness, respect, and empathy. We are a diverse community, and everyone deserves to feel safe and valued.
              </p>
              <ul className="guidelines-page__list">
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Use respectful language in all communications
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Respect others' boundaries and preferences
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Be open to different perspectives and backgrounds
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Accept rejection gracefully
                </li>
              </ul>
            </Motion.section>

            <Motion.section
              className="guidelines-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="guidelines-page__section-title" id="authentic-profiles">
                <Shield size={20} className="guidelines-page__section-icon" aria-hidden="true" />
                2. Authentic Profiles
              </h2>
              <p className="guidelines-page__text">
                Your profile should accurately represent who you are. Authenticity builds trust and leads to better connections.
              </p>
              <ul className="guidelines-page__list">
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Use recent, accurate photos of yourself
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Provide honest information about yourself
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Keep your profile information up to date
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Don't impersonate others or use fake identities
                </li>
              </ul>
            </Motion.section>

            <Motion.section
              className="guidelines-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="guidelines-page__section-title" id="prohibited-behavior">
                <Ban size={20} className="guidelines-page__section-icon" aria-hidden="true" />
                3. Prohibited Behavior
              </h2>
              <p className="guidelines-page__text">
                The following behaviors are strictly prohibited and may result in immediate account suspension or termination:
              </p>
              <ul className="guidelines-page__list guidelines-page__list--warning">
                <li className="guidelines-page__list-item">
                  <AlertTriangle size={16} className="guidelines-page__list-icon guidelines-page__list-icon--warning" />
                  Harassment, bullying, or intimidation of any kind
                </li>
                <li className="guidelines-page__list-item">
                  <AlertTriangle size={16} className="guidelines-page__list-icon guidelines-page__list-icon--warning" />
                  Hate speech, discrimination, or offensive content
                </li>
                <li className="guidelines-page__list-item">
                  <AlertTriangle size={16} className="guidelines-page__list-icon guidelines-page__list-icon--warning" />
                  Spam, scams, or solicitation for money
                </li>
                <li className="guidelines-page__list-item">
                  <AlertTriangle size={16} className="guidelines-page__list-icon guidelines-page__list-icon--warning" />
                  Inappropriate, explicit, or offensive content
                </li>
                <li className="guidelines-page__list-item">
                  <AlertTriangle size={16} className="guidelines-page__list-icon guidelines-page__list-icon--warning" />
                  Sharing personal information of others without consent
                </li>
                <li className="guidelines-page__list-item">
                  <AlertTriangle size={16} className="guidelines-page__list-icon guidelines-page__list-icon--warning" />
                  Using the platform for illegal activities
                </li>
              </ul>
            </Motion.section>

            <Motion.section
              className="guidelines-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="guidelines-page__section-title" id="safe-communication">
                <MessageCircle size={20} className="guidelines-page__section-icon" aria-hidden="true" />
                4. Safe Communication
              </h2>
              <p className="guidelines-page__text">
                When communicating with other members, keep these safety tips in mind:
              </p>
              <ul className="guidelines-page__list">
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Get to know someone before sharing personal information
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Report suspicious or inappropriate behavior immediately
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Trust your instincts - if something feels off, it probably is
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Use our in-app messaging system before sharing contact information
                </li>
              </ul>
            </Motion.section>

            <Motion.section
              className="guidelines-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="guidelines-page__section-title" id="meeting-in-person">
                <Users size={20} className="guidelines-page__section-icon" aria-hidden="true" />
                5. Meeting In Person
              </h2>
              <p className="guidelines-page__text">
                If you decide to meet someone in person, please follow these safety guidelines:
              </p>
              <ul className="guidelines-page__list">
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Meet in a public place for the first few meetings
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Tell a friend or family member where you're going and who you're meeting
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Arrange your own transportation
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Trust your instincts and leave if you feel uncomfortable
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Don't share your home address until you feel completely comfortable
                </li>
              </ul>
            </Motion.section>

            <Motion.section
              className="guidelines-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="guidelines-page__section-title" id="reporting-violations">
                <AlertTriangle size={20} className="guidelines-page__section-icon" aria-hidden="true" />
                6. Reporting Violations
              </h2>
              <p className="guidelines-page__text">
                If you encounter behavior that violates these guidelines, please report it immediately. We take all reports seriously and investigate them promptly.
              </p>
              <p className="guidelines-page__text">
                You can report violations through:
              </p>
              <ul className="guidelines-page__list">
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  The "Report" button on any profile or message
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Our <a href="/report-problem" className="guidelines-page__link">Report a Problem</a> page
                </li>
                <li className="guidelines-page__list-item">
                  <CheckCircle size={16} className="guidelines-page__list-icon" />
                  Contacting our support team directly
                </li>
              </ul>
            </Motion.section>

            <Motion.section
              className="guidelines-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h2 className="guidelines-page__section-title" id="consequences">
                <Shield size={20} className="guidelines-page__section-icon" aria-hidden="true" />
                7. Consequences of Violations
              </h2>
              <p className="guidelines-page__text">
                Violations of these guidelines may result in:
              </p>
              <ul className="guidelines-page__list">
                <li className="guidelines-page__list-item">
                  <AlertTriangle size={16} className="guidelines-page__list-icon guidelines-page__list-icon--warning" />
                  Warning notifications
                </li>
                <li className="guidelines-page__list-item">
                  <AlertTriangle size={16} className="guidelines-page__list-icon guidelines-page__list-icon--warning" />
                  Temporary suspension of your account
                </li>
                <li className="guidelines-page__list-item">
                  <AlertTriangle size={16} className="guidelines-page__list-icon guidelines-page__list-icon--warning" />
                  Permanent ban from the platform
                </li>
                <li className="guidelines-page__list-item">
                  <AlertTriangle size={16} className="guidelines-page__list-icon guidelines-page__list-icon--warning" />
                  Legal action in cases of serious violations
                </li>
              </ul>
            </Motion.section>

            <Motion.section
              className="guidelines-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2 className="guidelines-page__section-title" id="age-requirement">
                <Shield size={20} className="guidelines-page__section-icon" aria-hidden="true" />
                8. Age Requirement
              </h2>
              <p className="guidelines-page__text">
                You must be at least 18 years old to use Unlock Me. We verify age during the registration process and reserve the right to request additional verification if needed.
              </p>
            </Motion.section>

            <Motion.section
              className="guidelines-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <h2 className="guidelines-page__section-title" id="updates">
                <FileText size={20} className="guidelines-page__section-icon" aria-hidden="true" />
                9. Updates to Guidelines
              </h2>
              <p className="guidelines-page__text">
                We may update these Community Guidelines from time to time to reflect changes in our community standards or legal requirements. We will notify you of any material changes.
              </p>
            </Motion.section>

            <Motion.section
              className="guidelines-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <h2 className="guidelines-page__section-title" id="contact-us">
                <MessageCircle size={20} className="guidelines-page__section-icon" aria-hidden="true" />
                10. Contact Us
              </h2>
              <p className="guidelines-page__text">
                If you have questions about these guidelines or need to report a violation, please contact us:
              </p>
              <p className="guidelines-page__contact-info">
                <strong>Email:</strong> <a href="mailto:support@unlock-me.app" className="guidelines-page__link">support@unlock-me.app</a>
                <br />
                <strong>Report Issue:</strong> <a href="/report-problem" className="guidelines-page__link">Report a Problem</a>
              </p>
            </Motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityGuidelines;
