import React from "react";
import { useNavigate } from "react-router-dom";
import BackgroundLayout from "../../components/layout/backgroundLayout/BackgroundLayout";
import "./TermsOfService.css";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <BackgroundLayout>
      <div className="terms-page">
        <div className="terms-page__card">
          <button className="terms-page__back-btn" onClick={() => navigate("/signup")}>
            ← Back
          </button>
          
          <header className="terms-page__header">
            <h1 className="terms-page__title">Terms of Service</h1>
            <span className="terms-page__date">Last Updated: January 2026</span>
          </header>

          <div className="terms-page__content">
            <p className="terms-page__text terms-page__text--caps">
              PLEASE READ THESE TERMS CAREFULLY. BY ACCESSING OR USING UNLOCKME, YOU AGREE TO BE BOUND BY THESE TERMS AND ALL TERMS INCORPORATED BY REFERENCE.
            </p>

            <h2 className="terms-page__section-title">1. Acceptance of Agreement</h2>
            <p className="terms-page__text">
              By creating an account, accessing, or using the UnlockMe application ("Service"), you agree to be bound by these Terms of Service ("Agreement"). If you do not accept and agree to be bound by all of the terms of this Agreement, you should not access or use the Service.
            </p>

            <h2 className="terms-page__section-title">2. Eligibility</h2>
            <p className="terms-page__text">
              You must be at least 18 years of age to create an account on UnlockMe and use the Service. By creating an account and using the Service, you represent and warrant that:
            </p>
            <ul className="terms-page__list">
              <li className="terms-page__list-item">You can form a binding contract with UnlockMe.</li>
              <li className="terms-page__list-item">You are not a person who is barred from using the Service under the laws of the United States or any other applicable jurisdiction.</li>
              <li className="terms-page__list-item">You have never been convicted of a felony or required to register as a sex offender.</li>
            </ul>

            <h2 className="terms-page__section-title">3. Your Account</h2>
            <p className="terms-page__text">
              You are responsible for maintaining the confidentiality of your login credentials you use to sign up for UnlockMe, and you are solely responsible for all activities that occur under those credentials. If you think someone has gained access to your account, please immediately contact us.
            </p>

            <h2 className="terms-page__section-title">4. User Interactions & Safety (Important)</h2>
            <p className="terms-page__text">
              <strong className="terms-page__strong">UnlockMe is not responsible for the conduct of any user on or off of the Service.</strong> You agree to use caution in all interactions with other users, particularly if you decide to communicate off the Service or meet in person.
            </p>
            <p className="terms-page__text terms-page__text--caps">
              YOU ARE SOLELY RESPONSIBLE FOR YOUR INTERACTIONS WITH OTHER USERS. UNLOCKME MAKES NO REPRESENTATIONS OR WARRANTIES AS TO THE CONDUCT OF USERS.
            </p>

            <h2 className="terms-page__section-title">5. Prohibited Rules</h2>
            <ul className="terms-page__list">
              <li className="terms-page__list-item">Use the Service for any purpose that is illegal or prohibited by this Agreement.</li>
              <li className="terms-page__list-item">Spam, solicit money from or defraud any members.</li>
              <li className="terms-page__list-item">Impersonate any person or entity.</li>
              <li className="terms-page__list-item">Bully, "stalk," intimidate, assault, harass, mistreat or defame any person.</li>
            </ul>

            <h2 className="terms-page__section-title">6. Limitation of Liability</h2>
            <p className="terms-page__text terms-page__text--caps">
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL UNLOCKME BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES, INCLUDING, WITHOUT LIMITATION, LOSS OF PROFITS, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>

            <h2 className="terms-page__section-title">7. Indemnity</h2>
            <p className="terms-page__text">
              You agree to indemnify, defend and hold harmless UnlockMe, our affiliates, and their and our respective officers, directors, agents, and employees from and against any and all complaints, demands, claims, damages, losses, costs, liabilities and expenses, including attorney’s fees.
            </p>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default TermsOfService;