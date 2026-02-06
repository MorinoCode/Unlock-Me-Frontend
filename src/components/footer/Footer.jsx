import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Twitter, Mail, HelpCircle, FileText, Users, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer" role="contentinfo">
      <div className="main-footer__container">
        {/* Brand Section */}
        <div className="main-footer__brand">
          <h2 className="main-footer__logo">{t('common.appName')}</h2>
          <p className="main-footer__tagline">{t('footer.tagline')}</p>
          <p className="main-footer__description">
            {t('footer.description')}
          </p>
        </div>

        {/* Links Grid */}
        <div className="main-footer__links-grid">
          {/* Quick Links */}
          <div className="main-footer__column">
            <h3 className="main-footer__column-title">{t('footer.quickLinks')}</h3>
            <nav className="main-footer__nav" aria-label={t('footer.quickLinks')}>
              <Link to="/" className="main-footer__link">{t('nav.home')}</Link>
              <Link to="/how-it-works" className="main-footer__link">{t('pages.howItWorks.title')}</Link>
              <Link to="/about-us" className="main-footer__link">{t('pages.about.title')}</Link>
            </nav>
          </div>

          {/* Support */}
          <div className="main-footer__column">
            <h3 className="main-footer__column-title">{t('footer.support')}</h3>
            <nav className="main-footer__nav" aria-label={t('footer.support')}>
              <Link to="/contact-us" className="main-footer__link">
                <Mail size={14} className="main-footer__link-icon" />
                {t('pages.contact.title')}
              </Link>
              <Link to="/report-problem" className="main-footer__link">
                <HelpCircle size={14} className="main-footer__link-icon" />
                {t('footer.reportProblem')}
              </Link>
              <Link to="/help-center" className="main-footer__link">
                <FileText size={14} className="main-footer__link-icon" />
                {t('pages.help.title')}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="main-footer__column">
            <h3 className="main-footer__column-title">{t('footer.legal')}</h3>
            <nav className="main-footer__nav" aria-label={t('footer.legal')}>
              <Link to="/privacypolicy" className="main-footer__link">{t('pages.privacy.title')}</Link>
              <Link to="/termsofservice" className="main-footer__link">{t('pages.terms.title')}</Link>
              <Link to="/cookie-policy" className="main-footer__link">{t('pages.cookie.title')}</Link>
              <Link to="/community-guidelines" className="main-footer__link">{t('pages.community.title')}</Link>
            </nav>
          </div>

          {/* Connect */}
          <div className="main-footer__column">
            <h3 className="main-footer__column-title">{t('footer.connect')}</h3>
            <div className="main-footer__social">
              <a 
                href="https://instagram.com/unlockme" 
                target="_blank" 
                rel="noopener noreferrer"
                className="main-footer__social-link" 
                aria-label="Visit our Instagram page"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://twitter.com/unlockme" 
                target="_blank" 
                rel="noopener noreferrer"
                className="main-footer__social-link" 
                aria-label="Visit our Twitter page"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://github.com/unlockme" 
                target="_blank" 
                rel="noopener noreferrer"
                className="main-footer__social-link" 
                aria-label="Visit our Github profile"
              >
                <Github size={20} />
              </a>
            </div>
            <div className="main-footer__contact">
              <a href="mailto:support@unlock-me.app" className="main-footer__email">
                support@unlock-me.app
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="main-footer__bottom">
          <p className="main-footer__copyright">
            © {currentYear} {t('common.appName')}. {t('footer.copyright')}
          </p>
          <div className="main-footer__legal-bottom">
            <Link to="/privacypolicy" className="main-footer__legal-link" aria-label={t('pages.privacy.title')}>
              {t('pages.privacy.title')}
            </Link>
            <span className="main-footer__separator">•</span>
            <Link to="/termsofservice" className="main-footer__legal-link" aria-label={t('pages.terms.title')}>
              {t('pages.terms.title')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;