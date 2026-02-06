import React from 'react';
import ContactUsComponent from '../../components/contactUsComponent/ContactUsComponent';
import SEO from '../../components/seo/SEO';
import './ContactUsPage.css';

const ContactUsPage = () => {
  return (
    <>
      <SEO
        title="Contact Us | Unlock Me - Get in Touch"
        description="Get in touch with Unlock Me. We're here to help with any questions, feedback, or support you need. Contact our team today."
        keywords="contact us, support, help, customer service, Unlock Me, dating app support, get in touch"
      />
      <div className="contact-us-page">
        <ContactUsComponent />
      </div>
    </>
  );
};

export default ContactUsPage;
