import React from 'react';
import { Github, Instagram, Twitter, Globe } from 'lucide-react';
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
            <a href="#" className="main-footer__social-link"><Instagram size={20} /></a>
            <a href="#" className="main-footer__social-link"><Twitter size={20} /></a>
            <a href="#" className="main-footer__social-link"><Github size={20} /></a>
          </div>
        </div>

        <div className="main-footer__bottom">
          <p className="main-footer__copyright">
            © {new Date().getFullYear()} UnlockMe. All rights reserved.
          </p>
          <div className="main-footer__legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;