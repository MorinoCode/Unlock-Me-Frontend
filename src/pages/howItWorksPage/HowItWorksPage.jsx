import React from 'react';
import HowItWorksComponent from '../../components/howItWorksComponent/HowItWorksComponent';
import SEO from '../../components/seo/SEO';
import { 
  IoAnalytics, 
  IoHeart, 
  IoFingerPrint, 
  IoChatbubbles, 
  IoShieldCheckmark, 
  IoGlobe, 
  IoEye, 
  IoLockClosed,
  IoRocket
} from "react-icons/io5";
import './HowItWorksPage.css';

const HowItWorksPage = () => {
  
  const featuresList = [
    {
      title: "DNA & Personality Matching",
      description: "We don't just look at photos. Our advanced algorithm analyzes your personality type, emotional intelligence, and core values to find someone who truly understands you.",
      icon: <IoFingerPrint />,
    },
    {
      title: "Precision Compatibility Scores",
      description: "Stop guessing. We provide a precise Match Percentage based on thousands of data points, showing you exactly how compatible you are with potential partners before you even say hello.",
      icon: <IoAnalytics />,
    },
    {
      title: "Expert Relationship Insights",
      description: "Get more than just a match. Read detailed expert analysis explaining 'Why' you two are a good fit, highlighting your synergies and potential growth areas.",
      icon: <IoRocket />,
    },
    {
      title: "Deep Dive Discovery",
      description: "Through our specialized questionnaires and category-based quizzes, you'll not only find the right partner but also discover hidden aspects of your own personality.",
      icon: <IoHeart />,
    },
    {
      title: "Smart Icebreakers",
      description: "Never struggle with 'Hi' again. We analyze your mutual interests and profile data to suggest the perfect opening lines that guarantee a response.",
      icon: <IoChatbubbles />,
    },
    {
      title: "Verified Real Profiles",
      description: "Safety is our priority. Our strict verification process ensures you are talking to real people, creating a secure environment for genuine connections.",
      icon: <IoShieldCheckmark />,
    },
    {
      title: "See Who Likes You",
      description: "Don't wait around. Upgrade to Gold to instantly see everyone who has already liked your profile and match with them instantly.",
      icon: <IoEye />,
    },
    {
      title: "Global & Local Connections",
      description: "Whether you're looking for love next door or a soulmate across the ocean, our flexible search filters put the world at your fingertips.",
      icon: <IoGlobe />,
    },
    {
      title: "Private & Secure Messaging",
      description: "Your conversations are private. We use end-to-end encryption to ensure your personal chats and shared moments stay between you and your match.",
      icon: <IoLockClosed />,
    }
  ];

  return (
    <>
      <SEO
        title="How It Works | Unlock Me - Find Your Perfect Match"
        description="Learn how Unlock Me uses DNA-level personality matching to connect you with your perfect partner. Discover our advanced algorithm, compatibility scoring, and unique features."
        keywords="how it works, dating app, personality matching, DNA matching, compatibility, matchmaking, find love, dating platform"
      />
      <div className="how-it-works-page">
        <HowItWorksComponent features={featuresList} />
      </div>
    </>
  );
};

export default HowItWorksPage;