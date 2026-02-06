import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowLeft, FileText, Shield, AlertTriangle, Ban, Scale, Gavel, Mail, Users, Lock } from "lucide-react";
import SEO from "../../components/seo/SEO";
import "./TermsOfService.css";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Terms of Service | Unlock Me - Legal Agreement"
        description="Read Unlock Me's Terms of Service to understand the rules and guidelines for using our dating platform. Learn about your rights and responsibilities."
        keywords="terms of service, user agreement, legal terms, terms and conditions, Unlock Me terms, dating app terms"
      />
      <div className="terms-page">
        <div className="terms-page__container">
          <button 
            className="terms-page__back-btn" 
            onClick={() => navigate(-1)}
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <header className="terms-page__header">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="terms-page__header-icon" aria-hidden="true">
                <FileText size={32} />
              </div>
              <h1 className="terms-page__title">Terms of Service</h1>
              <p className="terms-page__date">Last Updated: January 23, 2026</p>
              <p className="terms-page__intro">
                PLEASE READ THESE TERMS CAREFULLY. BY ACCESSING OR USING UNLOCKME, YOU AGREE TO BE BOUND BY THESE TERMS AND ALL TERMS INCORPORATED BY REFERENCE.
              </p>
            </Motion.div>
          </header>

          <div className="terms-page__content">
            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="terms-page__section-title" id="acceptance">
                <FileText size={20} className="terms-page__section-icon" aria-hidden="true" />
                1. Acceptance of Agreement
              </h2>
              <p className="terms-page__text">
                By creating an account, accessing, or using the UnlockMe application ("Service"), you agree to be bound by these Terms of Service ("Agreement"). If you do not accept and agree to be bound by all of the terms of this Agreement, you should not access or use the Service.
              </p>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="terms-page__section-title" id="eligibility">
                <Users size={20} className="terms-page__section-icon" aria-hidden="true" />
                2. Eligibility
              </h2>
              <p className="terms-page__text">
                You must be at least 18 years of age to create an account on UnlockMe and use the Service. By creating an account and using the Service, you represent and warrant that:
              </p>
              <ul className="terms-page__list">
                <li className="terms-page__list-item">You can form a binding contract with UnlockMe.</li>
                <li className="terms-page__list-item">You are not a person who is barred from using the Service under the laws of the United States or any other applicable jurisdiction.</li>
                <li className="terms-page__list-item">You have never been convicted of a felony or required to register as a sex offender.</li>
                <li className="terms-page__list-item">You will comply with all applicable laws and regulations.</li>
              </ul>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="terms-page__section-title" id="your-account">
                <Lock size={20} className="terms-page__section-icon" aria-hidden="true" />
                3. Your Account
              </h2>
              <p className="terms-page__text">
                You are responsible for maintaining the confidentiality of your login credentials you use to sign up for UnlockMe, and you are solely responsible for all activities that occur under those credentials. If you think someone has gained access to your account, please immediately contact us.
              </p>
              <p className="terms-page__text">
                You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="terms-page__section-title" id="user-interactions">
                <AlertTriangle size={20} className="terms-page__section-icon" aria-hidden="true" />
                4. User Interactions & Safety (Important)
              </h2>
              <p className="terms-page__text">
                <strong className="terms-page__strong">UnlockMe is not responsible for the conduct of any user on or off of the Service.</strong> You agree to use caution in all interactions with other users, particularly if you decide to communicate off the Service or meet in person.
              </p>
              <p className="terms-page__text terms-page__text--caps">
                YOU ARE SOLELY RESPONSIBLE FOR YOUR INTERACTIONS WITH OTHER USERS. UNLOCKME MAKES NO REPRESENTATIONS OR WARRANTIES AS TO THE CONDUCT OF USERS.
              </p>
              <p className="terms-page__text">
                You understand that UnlockMe does not conduct background checks on its users. You are solely responsible for your own safety when interacting with other users, both online and offline.
              </p>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="terms-page__section-title" id="prohibited-rules">
                <Ban size={20} className="terms-page__section-icon" aria-hidden="true" />
                5. Prohibited Conduct
              </h2>
              <p className="terms-page__text">You agree not to:</p>
              <ul className="terms-page__list">
                <li className="terms-page__list-item">Use the Service for any purpose that is illegal or prohibited by this Agreement.</li>
                <li className="terms-page__list-item">Spam, solicit money from or defraud any members.</li>
                <li className="terms-page__list-item">Impersonate any person or entity.</li>
                <li className="terms-page__list-item">Bully, "stalk," intimidate, assault, harass, mistreat or defame any person.</li>
                <li className="terms-page__list-item">Post any content that is illegal, harmful, threatening, abusive, or violates any person's rights.</li>
                <li className="terms-page__list-item">Use automated systems or bots to access the Service.</li>
                <li className="terms-page__list-item">Attempt to gain unauthorized access to the Service or its related systems.</li>
              </ul>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="terms-page__section-title" id="intellectual-property">
                <FileText size={20} className="terms-page__section-icon" aria-hidden="true" />
                6. Intellectual Property
              </h2>
              <p className="terms-page__text">
                The Service and its original content, features, and functionality are owned by UnlockMe and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="terms-page__text">
                You retain ownership of any content you post on the Service. By posting content, you grant UnlockMe a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content for the purpose of operating and providing the Service.
              </p>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h2 className="terms-page__section-title" id="limitation-liability">
                <Scale size={20} className="terms-page__section-icon" aria-hidden="true" />
                7. Limitation of Liability
              </h2>
              <p className="terms-page__text terms-page__text--caps">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL UNLOCKME BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES, INCLUDING, WITHOUT LIMITATION, LOSS OF PROFITS, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="terms-page__text">
                UnlockMe's total liability to you for all claims arising from or related to the use of the Service shall not exceed the amount you paid to UnlockMe in the twelve (12) months prior to the action giving rise to liability, or one hundred dollars ($100), whichever is greater.
              </p>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2 className="terms-page__section-title" id="indemnity">
                <Shield size={20} className="terms-page__section-icon" aria-hidden="true" />
                8. Indemnity
              </h2>
              <p className="terms-page__text">
                You agree to indemnify, defend and hold harmless UnlockMe, our affiliates, and their and our respective officers, directors, agents, and employees from and against any and all complaints, demands, claims, damages, losses, costs, liabilities and expenses, including attorney's fees, arising out of or relating to:
              </p>
              <ul className="terms-page__list">
                <li className="terms-page__list-item">Your use of the Service.</li>
                <li className="terms-page__list-item">Your violation of these Terms of Service.</li>
                <li className="terms-page__list-item">Your violation of any rights of another user.</li>
                <li className="terms-page__list-item">Your violation of any applicable laws or regulations.</li>
              </ul>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <h2 className="terms-page__section-title" id="termination">
                <Ban size={20} className="terms-page__section-icon" aria-hidden="true" />
                9. Termination
              </h2>
              <p className="terms-page__text">
                You may terminate your account at any time by deleting it through the Service settings. UnlockMe may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service.
              </p>
              <p className="terms-page__text">
                Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive termination, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <h2 className="terms-page__section-title" id="dispute-resolution">
                <Gavel size={20} className="terms-page__section-icon" aria-hidden="true" />
                10. Dispute Resolution
              </h2>
              <p className="terms-page__text">
                If you have any dispute with UnlockMe, you agree to first contact us to seek a resolution. If we cannot resolve the dispute through direct communication, you agree to resolve any claim, dispute, or controversy through binding arbitration rather than in court.
              </p>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <h2 className="terms-page__section-title" id="governing-law">
                <Gavel size={20} className="terms-page__section-icon" aria-hidden="true" />
                11. Governing Law
              </h2>
              <p className="terms-page__text">
                These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which UnlockMe operates, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts of that jurisdiction.
              </p>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h2 className="terms-page__section-title" id="changes-to-terms">
                <FileText size={20} className="terms-page__section-icon" aria-hidden="true" />
                12. Changes to Terms
              </h2>
              <p className="terms-page__text">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="terms-page__text">
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
              </p>
            </Motion.section>

            <Motion.section
              className="terms-page__section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
            >
              <h2 className="terms-page__section-title" id="contact-us">
                <Mail size={20} className="terms-page__section-icon" aria-hidden="true" />
                13. Contact Us
              </h2>
              <p className="terms-page__text">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="terms-page__contact-info">
                <strong>Email:</strong> <a href="mailto:legal@unlock-me.app" className="terms-page__link">legal@unlock-me.app</a>
                <br />
                <strong>Support:</strong> <a href="mailto:support@unlock-me.app" className="terms-page__link">support@unlock-me.app</a>
              </p>
            </Motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
