import React from "react";
import { useNavigate } from "react-router-dom";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <BackgroundLayout>
      <div className="privacy-page">
        <div className="privacy-page__card">
          <button className="privacy-page__back-btn" onClick={() => navigate("/signup")}>
            ← Back
          </button>

          <header className="privacy-page__header">
            <h1 className="privacy-page__title">Privacy Policy</h1>
            <span className="privacy-page__date">Last Updated: January 2026</span>
          </header>

          <div className="privacy-page__content">
            <p className="privacy-page__text">
              Welcome to UnlockMe’s Privacy Policy. We appreciate that you trust us with your information and we intend to always keep that trust. This starts with making sure you understand the information we collect, why we collect it, how it is used and your choices regarding your information.
            </p>

            <h2 className="privacy-page__section-title">1. Information We Collect</h2>
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

            <h2 className="privacy-page__section-title">2. How We Use Information</h2>
            <p className="privacy-page__text">The main reason we use your information is to deliver and improve our services. Additionally, we use your info to:</p>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">Create and manage your account.</li>
              <li className="privacy-page__list-item">Provide you with customer support.</li>
              <li className="privacy-page__list-item">Prevent, detect and fight fraud or other illegal activities.</li>
              <li className="privacy-page__list-item">Analyze user behavior to improve our matching algorithms.</li>
            </ul>

            <h2 className="privacy-page__section-title">3. How We Share Information</h2>
            <p className="privacy-page__text">
              Since our goal is to help you make meaningful connections, the main sharing of users' information is, of course, with other users. We also share some users' information with service providers and partners who assist us in operating the services (e.g., payment processors, hosting services).
            </p>

            <h2 className="privacy-page__section-title">4. Your Rights</h2>
            <p className="privacy-page__text">
              You have the right to access, rectify, or delete your personal information. You can delete your account directly inside the application settings. Upon deletion, your data will be removed from our active databases, though some information may be retained for legal obligations or fraud prevention.
            </p>

            <h2 className="privacy-page__section-title">5. Data Security</h2>
            <p className="privacy-page__text">
              We work hard to protect you from unauthorized access to or alteration, disclosure or destruction of your personal information. However, as with all technology companies, although we take steps to secure your information, we do not promise, and you should not expect, that your personal information will always remain secure.
            </p>

            <h2 className="privacy-page__section-title">6. Children's Privacy</h2>
            <p className="privacy-page__text">
              Our services are restricted to users who are 18 years of age or older. We do not permit users under the age of 18 on our platform and we do not knowingly collect personal information from anyone under the age of 18.
            </p>

            <h2 className="privacy-page__section-title">7. Changes to this Policy</h2>
            <p className="privacy-page__text">
              We may update this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy.
            </p>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default PrivacyPolicy;