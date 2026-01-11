import React from 'react';
import { Github, Instagram, Twitter } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="main-footer__container">
        <div className="main-footer__brand">
          <h2 className="main-footer__logo">UnlockMe</h2>
          <p className="main-footer__tagline">Connecting people across borders.</p>
        </div>
        
        <div className="main-footer__links">
          <div className="main-footer__social">
            {/* ✅ Accessibility Fix: Added aria-labels */}
            <a href="#" className="main-footer__social-link" aria-label="Visit our Instagram page">
                <Instagram size={20} />
            </a>
            <a href="#" className="main-footer__social-link" aria-label="Visit our Twitter page">
                <Twitter size={20} />
            </a>
            <a href="#" className="main-footer__social-link" aria-label="Visit our Github profile">
                <Github size={20} />
            </a>
          </div>
        </div>

        <div className="main-footer__bottom">
          <p className="main-footer__copyright">
            © {new Date().getFullYear()} UnlockMe. All rights reserved.
          </p>
          <div className="main-footer__legal">
            <a href="/privacypolicy" aria-label="Read Privacy Policy">Privacy Policy</a>
            <a href="/termsofservice" aria-label="Read Terms of Service">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;