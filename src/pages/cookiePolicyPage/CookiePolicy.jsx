import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowLeft, Cookie, Settings, Eye, Shield, FileText, AlertCircle } from "lucide-react";
import SEO from "../../components/seo/SEO";
import "./CookiePolicy.css";

const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Cookie Policy | Unlock Me - How We Use Cookies"
        description="Learn about how Unlock Me uses cookies and similar tracking technologies to enhance your experience. Understand your cookie preferences and how to manage them."
        keywords="cookie policy, cookies, tracking technologies, web storage, privacy, Unlock Me cookies, cookie settings"
      />
      <div className="cookie-page">
        <div className="cookie-page__container">
          <button 
            className="cookie-page__back-btn" 
            onClick={() => navigate(-1)}
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <header className="cookie-page__header">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="cookie-page__header-icon" aria-hidden="true">
                <Cookie size={32} />
              </div>
              <h1 className="cookie-page__title">Cookie Policy</h1>
              <p className="cookie-page__date">Last Updated: January 23, 2026</p>
              <p className="cookie-page__intro">
                This Cookie Policy explains how Unlock Me ("we", "us", or "our") uses cookies and similar tracking technologies when you visit our website or use our mobile application.
              </p>
            </Motion.div>
          </header>

          <div className="cookie-page__content">
            <Motion.section
              className="cookie-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="cookie-page__section-title" id="what-are-cookies">
                <Cookie size={20} className="cookie-page__section-icon" aria-hidden="true" />
                1. What Are Cookies?
              </h2>
              <p className="cookie-page__text">
                Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="cookie-page__text">
                Cookies allow a website to recognize your device and store some information about your preferences or past actions. This helps us provide you with a better experience and allows certain features to function properly.
              </p>
            </Motion.section>

            <Motion.section
              className="cookie-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="cookie-page__section-title" id="types-of-cookies">
                <Settings size={20} className="cookie-page__section-icon" aria-hidden="true" />
                2. Types of Cookies We Use
              </h2>
              <p className="cookie-page__text">We use the following types of cookies:</p>
              
              <h3 className="cookie-page__subsection-title">Essential Cookies</h3>
              <p className="cookie-page__text">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies as they are essential for the service to work.
              </p>

              <h3 className="cookie-page__subsection-title">Performance Cookies</h3>
              <p className="cookie-page__text">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the way our website works.
              </p>

              <h3 className="cookie-page__subsection-title">Functionality Cookies</h3>
              <p className="cookie-page__text">
                These cookies allow the website to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features.
              </p>

              <h3 className="cookie-page__subsection-title">Targeting/Advertising Cookies</h3>
              <p className="cookie-page__text">
                These cookies are used to deliver advertisements that are relevant to you and your interests. They also help measure the effectiveness of advertising campaigns.
              </p>
            </Motion.section>

            <Motion.section
              className="cookie-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="cookie-page__section-title" id="cookies-we-use">
                <Eye size={20} className="cookie-page__section-icon" aria-hidden="true" />
                3. Specific Cookies We Use
              </h2>
              <div className="cookie-page__table-wrapper">
                <table className="cookie-page__table">
                  <thead>
                    <tr>
                      <th>Cookie Name</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>session_id</td>
                      <td>Maintains your session and authentication state</td>
                      <td>Session</td>
                    </tr>
                    <tr>
                      <td>user_preferences</td>
                      <td>Stores your language and display preferences</td>
                      <td>1 year</td>
                    </tr>
                    <tr>
                      <td>analytics_id</td>
                      <td>Helps us analyze website usage and improve user experience</td>
                      <td>2 years</td>
                    </tr>
                    <tr>
                      <td>consent_status</td>
                      <td>Remembers your cookie consent preferences</td>
                      <td>1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Motion.section>

            <Motion.section
              className="cookie-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="cookie-page__section-title" id="third-party-cookies">
                <AlertCircle size={20} className="cookie-page__section-icon" aria-hidden="true" />
                4. Third-Party Cookies
              </h2>
              <p className="cookie-page__text">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.
              </p>
              <p className="cookie-page__text">
                These third-party service providers may use cookies, web beacons, and other tracking technologies to collect information about your use of our Service. We do not control these third parties' tracking technologies or how they may be used.
              </p>
            </Motion.section>

            <Motion.section
              className="cookie-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="cookie-page__section-title" id="managing-cookies">
                <Settings size={20} className="cookie-page__section-icon" aria-hidden="true" />
                5. How to Manage Cookies
              </h2>
              <p className="cookie-page__text">
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your browser settings.
              </p>
              <p className="cookie-page__text">
                Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="cookie-page__link">www.allaboutcookies.org</a>.
              </p>
              <p className="cookie-page__text">
                Please note that if you choose to disable cookies, some features of our Service may not function properly or may not be available to you.
              </p>
            </Motion.section>

            <Motion.section
              className="cookie-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="cookie-page__section-title" id="local-storage">
                <Shield size={20} className="cookie-page__section-icon" aria-hidden="true" />
                6. Local Storage and Similar Technologies
              </h2>
              <p className="cookie-page__text">
                In addition to cookies, we may use other similar technologies such as web beacons, pixel tags, and local storage to collect information about your use of our Service.
              </p>
              <p className="cookie-page__text">
                Local storage allows us to store larger amounts of data on your device. Like cookies, you can control local storage through your browser settings.
              </p>
            </Motion.section>

            <Motion.section
              className="cookie-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h2 className="cookie-page__section-title" id="updates">
                <FileText size={20} className="cookie-page__section-icon" aria-hidden="true" />
                7. Updates to This Policy
              </h2>
              <p className="cookie-page__text">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies.
              </p>
            </Motion.section>

            <Motion.section
              className="cookie-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2 className="cookie-page__section-title" id="contact-us">
                <FileText size={20} className="cookie-page__section-icon" aria-hidden="true" />
                8. Contact Us
              </h2>
              <p className="cookie-page__text">
                If you have any questions about our use of cookies or other technologies, please contact us at:
              </p>
              <p className="cookie-page__contact-info">
                <strong>Email:</strong> <a href="mailto:privacy@unlock-me.app" className="cookie-page__link">privacy@unlock-me.app</a>
                <br />
                <strong>Support:</strong> <a href="mailto:support@unlock-me.app" className="cookie-page__link">support@unlock-me.app</a>
              </p>
            </Motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicy;
