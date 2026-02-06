import React from 'react';
import HelpCenterComponent from '../../components/helpCenterComponent/HelpCenterComponent';
import SEO from '../../components/seo/SEO';
import './HelpCenterPage.css';

const HelpCenterPage = () => {
  return (
    <>
      <SEO
        title="Help Center | Unlock Me - Get Support & Answers"
        description="Find answers to common questions, learn how to use Unlock Me features, and get help with your account. Comprehensive guides and FAQs."
        keywords="help center, FAQ, support, how to use, guide, tutorial, Unlock Me help, dating app help"
      />
      <div className="help-center-page">
        <HelpCenterComponent />
      </div>
    </>
  );
};

export default HelpCenterPage;
