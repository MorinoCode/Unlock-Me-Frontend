import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, Globe, FileText } from "lucide-react";
import SEO from "../../components/seo/SEO";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Privacy Policy | Unlock Me - Your Privacy Matters"
        description="Read Unlock Me's Privacy Policy to understand how we collect, use, and protect your personal information. Learn about your privacy rights and data security."
        keywords="privacy policy, data protection, privacy rights, GDPR, data security, personal information, Unlock Me privacy"
      />
      <div className="privacy-page">
        <div className="privacy-page__container">
          <button 
            className="privacy-page__back-btn" 
            onClick={() => navigate(-1)}
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <header className="privacy-page__header">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="privacy-page__header-icon" aria-hidden="true">
                <Shield size={32} />
              </div>
              <h1 className="privacy-page__title">Privacy Policy</h1>
              <p className="privacy-page__date">Last Updated: January 23, 2026</p>
              <p className="privacy-page__intro">
                Welcome to UnlockMe's Privacy Policy. We appreciate that you trust us with your information and we intend to always keep that trust. This starts with making sure you understand the information we collect, why we collect it, how it is used and your choices regarding your information.
              </p>
            </Motion.div>
          </header>

          <div className="privacy-page__content">
            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="privacy-page__section-title" id="information-we-collect">
                <Eye size={20} className="privacy-page__section-icon" aria-hidden="true" />
                1. Information We Collect
              </h2>
              <p className="privacy-page__text">We collect information you provide to us directly, such as:</p>
              <ul className="privacy-page__list">
                <li className="privacy-page__list-item">
                  <strong className="privacy-page__strong">Account Data:</strong> When you create an account, you provide us with basic login information, gender, and date of birth.
                </li>
                <li className="privacy-page__list-item">
                  <strong className="privacy-page__strong">Profile Data:</strong> When you complete your profile, you can share additional details like your bio, interests, and photos.
                </li>
                <li className="privacy-page__list-item">
                  <strong className="privacy-page__strong">Usage Data:</strong> We collect data about your activity on our services (e.g., date and time you logged in, features you've been using).
                </li>
                <li className="privacy-page__list-item">
                  <strong className="privacy-page__strong">Geolocation:</strong> With your consent, we may collect your precise geolocation to offer you features like "Nearby Matches".
                </li>
              </ul>
            </Motion.section>

            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="privacy-page__section-title" id="how-we-use-information">
                <FileText size={20} className="privacy-page__section-icon" aria-hidden="true" />
                2. How We Use Information
              </h2>
              <p className="privacy-page__text">The main reason we use your information is to deliver and improve our services. Additionally, we use your info to:</p>
              <ul className="privacy-page__list">
                <li className="privacy-page__list-item">Create and manage your account.</li>
                <li className="privacy-page__list-item">Provide you with customer support.</li>
                <li className="privacy-page__list-item">Prevent, detect and fight fraud or other illegal activities.</li>
                <li className="privacy-page__list-item">Analyze user behavior to improve our matching algorithms.</li>
              </ul>
            </Motion.section>

            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="privacy-page__section-title" id="how-we-share-information">
                <Globe size={20} className="privacy-page__section-icon" aria-hidden="true" />
                3. How We Share Information
              </h2>
              <p className="privacy-page__text">
                Since our goal is to help you make meaningful connections, the main sharing of users' information is, of course, with other users. We also share some users' information with service providers and partners who assist us in operating the services (e.g., payment processors, hosting services).
              </p>
            </Motion.section>

            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="privacy-page__section-title" id="your-rights">
                <Shield size={20} className="privacy-page__section-icon" aria-hidden="true" />
                4. Your Rights
              </h2>
              <p className="privacy-page__text">
                You have the right to access, rectify, or delete your personal information. You can delete your account directly inside the application settings. Upon deletion, your data will be removed from our active databases, though some information may be retained for legal obligations or fraud prevention.
              </p>
            </Motion.section>

            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="privacy-page__section-title" id="data-security">
                <Lock size={20} className="privacy-page__section-icon" aria-hidden="true" />
                5. Data Security
              </h2>
              <p className="privacy-page__text">
                We work hard to protect you from unauthorized access to or alteration, disclosure or destruction of your personal information. However, as with all technology companies, although we take steps to secure your information, we do not promise, and you should not expect, that your personal information will always remain secure.
              </p>
            </Motion.section>

            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="privacy-page__section-title" id="childrens-privacy">
                <Shield size={20} className="privacy-page__section-icon" aria-hidden="true" />
                6. Children's Privacy
              </h2>
              <p className="privacy-page__text">
                Our services are restricted to users who are 18 years of age or older. We do not permit users under the age of 18 on our platform and we do not knowingly collect personal information from anyone under the age of 18.
              </p>
            </Motion.section>

            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h2 className="privacy-page__section-title" id="cookies">
                <FileText size={20} className="privacy-page__section-icon" aria-hidden="true" />
                7. Cookies and Tracking Technologies
              </h2>
              <p className="privacy-page__text">
                We use cookies and similar tracking technologies to collect and use personal information about you. Cookies are small text files placed on your device when you visit our website. We use both session cookies (which expire when you close your browser) and persistent cookies (which stay on your device until deleted or expired).
              </p>
              <p className="privacy-page__text">
                You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our service.
              </p>
            </Motion.section>

            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2 className="privacy-page__section-title" id="data-retention">
                <Lock size={20} className="privacy-page__section-icon" aria-hidden="true" />
                8. Data Retention
              </h2>
              <p className="privacy-page__text">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or fraud prevention purposes.
              </p>
            </Motion.section>

            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <h2 className="privacy-page__section-title" id="international-transfers">
                <Globe size={20} className="privacy-page__section-icon" aria-hidden="true" />
                9. International Data Transfers
              </h2>
              <p className="privacy-page__text">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We ensure that appropriate safeguards are in place to protect your personal information in accordance with this Privacy Policy.
              </p>
            </Motion.section>

            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <h2 className="privacy-page__section-title" id="changes-to-policy">
                <FileText size={20} className="privacy-page__section-icon" aria-hidden="true" />
                10. Changes to this Policy
              </h2>
              <p className="privacy-page__text">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. If we make material changes, we will notify you by email or through a notice on our website. The "Last Updated" date at the top of this policy indicates when it was last revised.
              </p>
            </Motion.section>

            <Motion.section
              className="privacy-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <h2 className="privacy-page__section-title" id="contact-us">
                <Shield size={20} className="privacy-page__section-icon" aria-hidden="true" />
                11. Contact Us
              </h2>
              <p className="privacy-page__text">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <p className="privacy-page__contact-info">
                <strong>Email:</strong> <a href="mailto:privacy@unlock-me.app" className="privacy-page__link">privacy@unlock-me.app</a>
                <br />
                <strong>Support:</strong> <a href="mailto:support@unlock-me.app" className="privacy-page__link">support@unlock-me.app</a>
              </p>
            </Motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
