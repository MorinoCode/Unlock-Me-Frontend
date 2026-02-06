import React from 'react';
import AboutComponent from '../../components/aboutComponent/AboutComponent';
import SEO from '../../components/seo/SEO';
import { IoFlask, IoShieldCheckmark, IoHeartCircle, IoPeople } from "react-icons/io5";
import './AboutPage.css';

const AboutPage = () => {
  
  const coreValues = [
    {
      title: "Science, Not Chance",
      description: "We believe compatible relationships aren't random. They are built on shared values, personality traits, and emotional intelligence.",
      icon: <IoFlask />
    },
    {
      title: "Authenticity First",
      description: "No more fake filters. We encourage real profiles and genuine conversations to ensure you meet the real person, not a persona.",
      icon: <IoPeople />
    },
    {
      title: "Safety & Privacy",
      description: "Your data is yours. We employ top-tier encryption and verification processes to keep your journey safe and private.",
      icon: <IoShieldCheckmark />
    },
    {
      title: "Deep Connections",
      description: "We move beyond the swipe. Our tools are designed to help you understand yourself and your potential partner on a deeper level.",
      icon: <IoHeartCircle />
    }
  ];

  const stats = [
    { label: "Active Users", value: "2M+" },
    { label: "Matches Made", value: "500k+" },
    { label: "Countries", value: "120+" },
    { label: "Success Stories", value: "10k+" }
  ];

  return (
    <>
      <SEO
        title="About Us | Unlock Me - Reimagining Human Connection"
        description="Learn about Unlock Me's mission to create meaningful relationships through science-backed personality matching. Discover our story, values, and commitment to authentic connections."
        keywords="about us, Unlock Me, dating app, personality matching, meaningful relationships, science-backed matching, authentic connections"
      />
      <div className="about-page">
        <AboutComponent values={coreValues} stats={stats} />
      </div>
    </>
  );
};

export default AboutPage;