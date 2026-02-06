import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Heart, 
  User, 
  Shield, 
  Settings,
  ChevronDown,
  ChevronUp,
  Mail,
  AlertCircle,
  FileText,
  Search
} from 'lucide-react';
import './HelpCenterComponent.css';

const HelpCenterComponent = () => {
  const { t } = useTranslation();
  const [openCategory, setOpenCategory] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <User size={24} />,
      description: 'Learn the basics of using Unlock Me',
      questions: [
        {
          id: 'gs-1',
          question: 'How do I create an account?',
          answer: 'Click on "Sign Up" in the top right corner, enter your email and create a password. You\'ll then be guided through setting up your profile, including adding photos, interests, and completing your DNA personality quiz.'
        },
        {
          id: 'gs-2',
          question: 'What is the DNA Matching feature?',
          answer: 'DNA Matching is our advanced personality compatibility system. By answering our comprehensive questionnaire, we analyze your personality traits, values, and preferences to find you matches with high compatibility scores. This goes beyond just photos - we match you based on who you truly are.'
        },
        {
          id: 'gs-3',
          question: 'How do I complete my profile?',
          answer: 'After signing up, you\'ll be guided through several steps: adding profile photos, selecting your interests, and completing the DNA personality quiz. The more complete your profile, the better we can match you with compatible partners.'
        },
        {
          id: 'gs-4',
          question: 'Can I skip the DNA quiz?',
          answer: 'While you can skip some steps initially, completing the DNA quiz is highly recommended as it significantly improves the quality of your matches. Our algorithm uses this data to find people who are truly compatible with you.'
        }
      ]
    },
    {
      id: 'matching',
      title: 'Matching & Swiping',
      icon: <Heart size={24} />,
      description: 'Understanding how matching works',
      questions: [
        {
          id: 'm-1',
          question: 'How does the matching algorithm work?',
          answer: 'Our algorithm analyzes your DNA personality traits, interests, values, and preferences. It then compares this data with other users to calculate a compatibility score. Matches with higher scores are shown to you first, increasing your chances of meaningful connections.'
        },
        {
          id: 'm-2',
          question: 'What is a Super Like?',
          answer: 'A Super Like is a special way to show someone you\'re really interested. When you Super Like someone, they\'ll be notified and see that you\'ve shown extra interest. Free users get 2 Super Likes per day, while premium plans offer more.'
        },
        {
          id: 'm-3',
          question: 'How many profiles can I swipe per day?',
          answer: 'Free users can swipe 30 profiles per day. Gold members get 70 swipes, Platinum members get 110 swipes, and Diamond members have unlimited swipes.'
        },
        {
          id: 'm-4',
          question: 'Can I see who liked me?',
          answer: 'Yes! Gold, Platinum, and Diamond members can see everyone who has already liked their profile. This feature is locked for free users but is available with any premium subscription.'
        }
      ]
    },
    {
      id: 'features',
      title: 'Features & Premium',
      icon: <Settings size={24} />,
      description: 'Learn about premium features',
      questions: [
        {
          id: 'f-1',
          question: 'What is Blind Date?',
          answer: 'Blind Date is an exciting feature where you chat with someone anonymously before seeing their photos. You answer questions together, and if you both decide to reveal, you\'ll see each other\'s profiles. Free users get 2 Blind Dates per day with a 4-hour cooldown, while premium plans offer more opportunities.'
        },
        {
          id: 'f-2',
          question: 'What is Go Date?',
          answer: 'Go Date allows you to create or join date invitations. You can post a date idea and others can apply to join you, or you can browse and apply to join dates created by others. It\'s a great way to meet people in real life based on shared interests.'
        },
        {
          id: 'f-3',
          question: 'What are the subscription plans?',
          answer: 'We offer four plans: Free (basic features), Gold (enhanced visibility and more swipes), Platinum (premium features and priority matching), and Diamond (unlimited everything - swipes, Super Likes, Blind Dates, and more).'
        },
        {
          id: 'f-4',
          question: 'How do I upgrade my subscription?',
          answer: 'Go to your profile settings and click "Upgrade" or visit the Upgrade page. You can choose from Gold, Platinum, or Diamond plans. Payment is processed securely through Stripe.'
        }
      ]
    },
    {
      id: 'messaging',
      title: 'Messaging & Chat',
      icon: <MessageCircle size={24} />,
      description: 'How to communicate with matches',
      questions: [
        {
          id: 'msg-1',
          question: 'How do I message someone?',
          answer: 'Once you\'ve matched with someone, you can start a conversation by going to your Matches page and selecting the person you want to message. You can also use our AI Wingman feature to get smart icebreaker suggestions based on their profile.'
        },
        {
          id: 'msg-2',
          question: 'Is there a limit on messages?',
          answer: 'Free users cannot send direct messages. Gold members can send 5 messages per day, Platinum members can send 10 messages per day, and Diamond members have unlimited messaging.'
        },
        {
          id: 'msg-3',
          question: 'What is AI Wingman?',
          answer: 'AI Wingman analyzes your match\'s profile and interests to suggest personalized icebreaker messages. This helps you start conversations that are more likely to get a response.'
        },
        {
          id: 'msg-4',
          question: 'Can I send photos in messages?',
          answer: 'Yes! Once you\'ve matched with someone, you can send photos, emojis, and text messages in your conversations.'
        }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Privacy',
      icon: <Shield size={24} />,
      description: 'Stay safe and protect your privacy',
      questions: [
        {
          id: 's-1',
          question: 'How do I report a user?',
          answer: 'If someone is behaving inappropriately, you can report them by going to their profile and clicking "Report" or by visiting the Report a Problem page. Our team reviews all reports and takes appropriate action.'
        },
        {
          id: 's-2',
          question: 'Is my data secure?',
          answer: 'Yes, we take your privacy seriously. We use end-to-end encryption for messages, secure payment processing, and never share your personal information with third parties. You can read our Privacy Policy for more details.'
        },
        {
          id: 's-3',
          question: 'How do I block someone?',
          answer: 'You can block a user from their profile page or from within a conversation. Once blocked, they won\'t be able to see your profile or message you.'
        },
        {
          id: 's-4',
          question: 'Are profiles verified?',
          answer: 'We have a verification process to ensure profiles are authentic. Verified profiles are marked with a badge, indicating that the user has completed our verification process.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: <Settings size={24} />,
      description: 'Manage your account',
      questions: [
        {
          id: 'a-1',
          question: 'How do I change my password?',
          answer: 'Go to your profile settings, click on "Account" or "Security", and select "Change Password". You\'ll need to enter your current password and create a new one.'
        },
        {
          id: 'a-2',
          question: 'Can I delete my account?',
          answer: 'Yes, you can delete your account from the settings page. Please note that this action is permanent and all your data, matches, and messages will be deleted.'
        },
        {
          id: 'a-3',
          question: 'How do I update my profile photos?',
          answer: 'Go to your profile page, click "Edit Profile", and then select "Photos". You can add, remove, or reorder your photos from there.'
        },
        {
          id: 'a-4',
          question: 'How do I cancel my subscription?',
          answer: 'You can manage your subscription from your profile settings under "Subscription" or "Billing". You can cancel at any time, and you\'ll continue to have access until the end of your billing period.'
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
    setOpenQuestion(null);
  };

  const toggleQuestion = (questionId) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };

  const quickLinks = [
    { title: 'Contact Us', icon: <Mail size={18} />, link: '/contact-us' },
    { title: 'Report a Problem', icon: <AlertCircle size={18} />, link: '/report-problem' },
    { title: 'Privacy Policy', icon: <FileText size={18} />, link: '/privacypolicy' },
    { title: 'Terms of Service', icon: <FileText size={18} />, link: '/termsofservice' }
  ];

  return (
    <div className="help-center-component">
      {/* Hero Section */}
      <section className="help-center-component__hero" aria-labelledby="hero-title">
        <div className="help-center-component__hero-content">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="help-center-component__hero-icon" aria-hidden="true">
              <HelpCircle size={48} />
            </div>
            <h1 id="hero-title" className="help-center-component__hero-title">
              How can we <span className="help-center-component__highlight">help you?</span>
            </h1>
            <p className="help-center-component__hero-subtitle">
              Find answers to common questions, learn how to use features, and get the support you need.
            </p>
          </Motion.div>

          {/* Search Bar */}
          <Motion.div
            className="help-center-component__search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Search className="help-center-component__search-icon" size={20} />
            <input
              type="text"
              placeholder={t("placeholders.searchHelp")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="help-center-component__search-input"
              aria-label="Search help center"
            />
          </Motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="help-center-component__quick-links" aria-labelledby="quick-links-title">
        <h2 id="quick-links-title" className="help-center-component__visually-hidden">Quick Links</h2>
        <div className="help-center-component__quick-links-grid">
          {quickLinks.map((link, index) => (
            <Motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link 
                to={link.link} 
                className="help-center-component__quick-link"
                aria-label={`Go to ${link.title}`}
              >
                <div className="help-center-component__quick-link-icon">{link.icon}</div>
                <span className="help-center-component__quick-link-text">{link.title}</span>
              </Link>
            </Motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="help-center-component__faq" aria-labelledby="faq-title">
        <div className="help-center-component__faq-container">
          <h2 id="faq-title" className="help-center-component__section-title">Frequently Asked Questions</h2>
          
          {filteredCategories.length === 0 && searchQuery ? (
            <div className="help-center-component__no-results">
              <p>No results found for "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="help-center-component__clear-search"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="help-center-component__categories">
              {filteredCategories.map((category, categoryIndex) => (
                <Motion.div
                  key={category.id}
                  className="help-center-component__category"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                >
                  <button
                    className="help-center-component__category-header"
                    onClick={() => toggleCategory(category.id)}
                    aria-expanded={openCategory === category.id}
                    aria-controls={`category-${category.id}`}
                  >
                    <div className="help-center-component__category-icon">{category.icon}</div>
                    <div className="help-center-component__category-info">
                      <h3 className="help-center-component__category-title">{category.title}</h3>
                      <p className="help-center-component__category-description">{category.description}</p>
                    </div>
                    {openCategory === category.id ? (
                      <ChevronUp className="help-center-component__category-chevron" size={24} />
                    ) : (
                      <ChevronDown className="help-center-component__category-chevron" size={24} />
                    )}
                  </button>

                  {openCategory === category.id && (
                    <div 
                      id={`category-${category.id}`}
                      className="help-center-component__questions"
                    >
                      {category.questions.map((q) => (
                        <div key={q.id} className="help-center-component__question-item">
                          <button
                            className="help-center-component__question-button"
                            onClick={() => toggleQuestion(q.id)}
                            aria-expanded={openQuestion === q.id}
                            aria-controls={`answer-${q.id}`}
                          >
                            <span className="help-center-component__question-text">{q.question}</span>
                            {openQuestion === q.id ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>
                          {openQuestion === q.id && (
                            <div 
                              id={`answer-${q.id}`}
                              className="help-center-component__answer"
                            >
                              <p>{q.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="help-center-component__cta" aria-labelledby="cta-title">
        <div className="help-center-component__cta-content">
          <h2 id="cta-title" className="help-center-component__cta-title">Still need help?</h2>
          <p className="help-center-component__cta-text">
            Can't find what you're looking for? Our support team is here to help you.
          </p>
          <div className="help-center-component__cta-buttons">
            <Link 
              to="/contact-us" 
              className="help-center-component__cta-button help-center-component__cta-button--primary"
              aria-label="Contact our support team"
            >
              <Mail size={18} />
              <span>Contact Us</span>
            </Link>
            <Link 
              to="/report-problem" 
              className="help-center-component__cta-button help-center-component__cta-button--secondary"
              aria-label="Report a problem"
            >
              <AlertCircle size={18} />
              <span>Report a Problem</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterComponent;
