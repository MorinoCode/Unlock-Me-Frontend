import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Globe,
  ArrowRight,
  Star,
  LayoutDashboard,
  Users,
  Heart,
  MessageCircle,
  Shield,
  CheckCircle,
  TrendingUp,
  CalendarHeart,
  Compass,
  Ghost,
  StickyNote,
  FileText,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/useAuth.js";
import SEO from "../../components/seo/SEO.jsx";
import "../../styles/design-tokens.css";
import "./HomePage.css";

const HomePage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const globeAnimation = {
    animate: {
      rotate: 360,
      transition: { duration: 20, repeat: Infinity, ease: "linear" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Stats data (can be fetched from API later)
  const stats = [
    { icon: Users, value: "100K+", label: t('home.activeUsers'), ariaLabel: "Over 100 thousand active users" },
    { icon: Heart, value: "50K+", label: t('home.matchesMade'), ariaLabel: "Over 50 thousand matches made" },
    { icon: MessageCircle, value: "1M+", label: t('home.messagesSent'), ariaLabel: "Over 1 million messages sent" },
    { icon: TrendingUp, value: "95%", label: t('home.satisfactionRate'), ariaLabel: "95 percent satisfaction rate" },
  ];

  // All features of the app
  const features = [
    {
      icon: Sparkles,
      title: "Smart Swipe",
      description: "Efficient, fun, and location-targeted browsing. Swipe through profiles based on your preferences.",
      highlight: false,
    },
    {
      icon: FileText,
      title: "DNA Matching",
      description: "Our algorithm analyzes deep interests to show your compatibility percentage at a glance.",
      highlight: true,
    },
    {
      icon: Ghost,
      title: "Blind Date",
      description: "Connect based on personality, not just photos. Discover connections through meaningful conversations.",
      highlight: false,
    },
    {
      icon: CalendarHeart,
      title: "Go Date",
      description: "Create or join real-life date events. Browse dates by category and location, or host your own.",
      highlight: false,
    },
    {
      icon: StickyNote,
      title: "Social Feed",
      description: "Share moments, thoughts, and experiences. Connect with your community through posts and stories.",
      highlight: false,
    },
    {
      icon: Compass,
      title: "Explore",
      description: "Discover users by interests and categories. Find people who share your passions and hobbies.",
      highlight: false,
    },
    {
      icon: Heart,
      title: "Matches",
      description: "View all your matches in one place. See compatibility scores and start meaningful conversations.",
      highlight: false,
    },
    {
      icon: MessageCircle,
      title: "Real-Time Chat",
      description: "Instant messaging with your matches. Send messages, share media, and build connections.",
      highlight: false,
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Found her soulmate",
      text: "Unlock-Me's DNA matching helped me find someone who truly understands me. Best decision ever!",
      rating: 5,
    },
    {
      name: "Alex K.",
      role: "Loves Blind Dates",
      text: "The blind date feature is amazing! It's refreshing to connect based on personality first.",
      rating: 5,
    },
    {
      name: "Jordan T.",
      role: "Active User",
      text: "The smart swipe feature makes finding matches so much easier. Highly recommend!",
      rating: 5,
    },
    {
      name: "Emma L.",
      role: "Go Date Enthusiast",
      text: "I love creating and joining Go Dates! It's such a fun way to meet people in real life. Met my best friend through a coffee date!",
      rating: 5,
    },
    {
      name: "Michael R.",
      role: "Social Feed User",
      text: "The social feed is perfect for sharing my daily life. I've connected with so many amazing people through posts and stories.",
      rating: 5,
    },
    {
      name: "Sophia C.",
      role: "Explore Feature Fan",
      text: "Exploring users by interests is brilliant! Found people who share my passion for photography and travel. Highly engaging!",
      rating: 5,
    },
    {
      name: "David W.",
      role: "Matches Success Story",
      text: "The compatibility scores are spot on! Every match I've made has been meaningful. This app really understands what I'm looking for.",
      rating: 5,
    },
    {
      name: "Olivia B.",
      role: "Chat Lover",
      text: "Real-time chat makes conversations flow so naturally. The interface is clean and messaging is instant. Love it!",
      rating: 5,
    },
    {
      name: "James H.",
      role: "Long-term User",
      text: "Been using Unlock-Me for 6 months now. The DNA matching algorithm keeps getting better. Found my perfect match!",
      rating: 5,
    },
    {
      name: "Isabella G.",
      role: "Blind Date Success",
      text: "Blind dates changed everything for me! Connecting through personality first was a game-changer. Highly recommend trying it!",
      rating: 5,
    },
    {
      name: "Noah S.",
      role: "Smart Swipe User",
      text: "The location-targeted browsing is perfect! I can find matches nearby and the swipe experience is smooth and fun.",
      rating: 5,
    },
    {
      name: "Ava M.",
      role: "Community Member",
      text: "The community here is amazing! Everyone is genuine and the app makes it easy to build real connections. Best dating app I've tried!",
      rating: 5,
    },
  ];

  // Carousel state - نمایش 3 تا در هر لحظه
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialsPerView = 3;

  // Auto-rotate هر 10 ثانیه
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => {
        // محاسبه تعداد گروه‌های 3 تایی
        const maxGroups = Math.ceil(testimonials.length / testimonialsPerView);
        const nextIndex = (prevIndex + 1) % maxGroups;
        return nextIndex;
      });
    }, 10000); // 10 ثانیه

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // محاسبه testimonials قابل نمایش در هر گروه
  const getVisibleTestimonials = () => {
    const startIndex = currentTestimonialIndex * testimonialsPerView;
    const endIndex = startIndex + testimonialsPerView;
    return testimonials.slice(startIndex, endIndex);
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <>
      <SEO 
        title={`${t('common.appName')} | ${t('home.title')}`}
        description={t('home.subtitle')}
        keywords="dating app, matchmaking, personality matching, DNA matching, blind date, dating platform, find love, connect, relationships, smart swipe"
      />
      <div className="home-page">
        {/* Skip to main content برای Accessibility */}
        <a href="#main-content" className="skip-to-main">
          {t('common.skipToMain')}
        </a>
        <header className="home-page__hero" id="main-content">
        <Motion.div
          className="home-page__globe-bg"
          variants={globeAnimation}
          animate="animate"
        >
          <Globe
            size={400}
            strokeWidth={0.5}
            className="home-page__globe-icon"
          />
        </Motion.div>

        <Motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="home-page__hero-content"
        >
          <div className="home-page__badge" role="status" aria-label="Community badge">
            <Star size={14} className="home-page__badge-icon" aria-hidden="true" />
            <span>{t('home.heroBadge')}</span>
          </div>

          <h1 className="home-page__title">
            <span className="home-page__title-text">Unlock Your </span>
            <span className="home-page__title-gradient">Connection</span>
          </h1>

          <p className="home-page__subtitle">
            {t('home.heroSubtitle')}
          </p>

          <div className="home-page__actions">
            {currentUser ? (
              <Link
                to="/feed"
                className="home-page__btn home-page__btn--primary"
                aria-label={t('home.goToFeed')}
              >
                {t('home.goToFeed')} <LayoutDashboard size={18} aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="home-page__btn home-page__btn--primary"
                  aria-label={t('home.getStarted')}
                >
                  {t('home.getStarted')} <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  to="/signin"
                  className="home-page__btn home-page__btn--secondary"
                  aria-label={t('home.login')}
                >
                  {t('home.login')}
                </Link>
              </>
            )}
          </div>
          
          {/* Scroll Indicator */}
          <Motion.div
            className="home-page__scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            aria-hidden="true"
          >
            <Motion.div
              className="home-page__scroll-arrow"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </Motion.div>
        </Motion.div>
      </header>

      <section className="home-page__features">
        <div className="home-page__section-header">
          <h2 className="home-page__section-title">{t('home.beyondTitle')}</h2>
          <p className="home-page__section-subtitle">
            {t('home.beyondSubtitle')}
          </p>
        </div>

        <Motion.div
          className="home-page__features-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Motion.div
                key={index}
                whileHover={{ y: -5 }}
                className={`home-page__card ${feature.highlight ? 'home-page__card--highlight' : ''}`}
                aria-label={`${feature.title} feature`}
                variants={staggerItem}
              >
                <div className="home-page__icon-container">
                  <Icon size={48} className="home-page__feature-icon" aria-hidden="true" />
                </div>
                <h3 className="home-page__card-title">{feature.title}</h3>
                <p className="home-page__card-desc">{feature.description}</p>
              </Motion.div>
            );
          })}
        </Motion.div>
      </section>

      {/* Stats Section */}
      <section className="home-page__stats" aria-labelledby="stats-heading">
        <div className="home-page__stats-container">
          <h2 id="stats-heading" className="home-page__stats-title">
            {t('home.statsTitle')}
          </h2>
          <Motion.div
            className="home-page__stats-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Motion.div
                  key={index}
                  className="home-page__stat-card"
                  variants={staggerItem}
                  role="article"
                  aria-label={stat.ariaLabel}
                >
                  <div className="home-page__stat-icon-wrapper">
                    <Icon size={32} aria-hidden="true" />
                  </div>
                  <div className="home-page__stat-value">{stat.value}</div>
                  <div className="home-page__stat-label">{stat.label}</div>
                </Motion.div>
              );
            })}
          </Motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="home-page__testimonials" aria-labelledby="testimonials-heading">
        <div className="home-page__testimonials-container">
          <div className="home-page__section-header">
            <h2 id="testimonials-heading" className="home-page__section-title">
              {t('home.testimonialsTitle')}
            </h2>
            <p className="home-page__section-subtitle">
              {t('home.testimonialsSubtitle')}
            </p>
          </div>
          <div className="home-page__testimonials-wrapper">
            <Motion.div
              className="home-page__testimonials-grid"
              key={currentTestimonialIndex}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {visibleTestimonials.map((testimonial, index) => (
                <Motion.div
                  key={`${currentTestimonialIndex}-${index}`}
                  className="home-page__testimonial-card"
                  variants={staggerItem}
                  aria-label={`Testimonial from ${testimonial.name}`}
                >
                  <div className="home-page__testimonial-rating" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="home-page__testimonial-text">"{testimonial.text}"</p>
                  <div className="home-page__testimonial-author">
                    <div className="home-page__testimonial-name">{testimonial.name}</div>
                    <div className="home-page__testimonial-role">{testimonial.role}</div>
                  </div>
                </Motion.div>
              ))}
            </Motion.div>

            {/* Carousel Indicators */}
            <div className="home-page__testimonials-indicators" aria-label="Testimonial carousel indicators">
              {Array.from({ length: Math.ceil(testimonials.length / testimonialsPerView) }).map((_, index) => (
                <button
                  key={index}
                  className={`home-page__testimonial-indicator ${index === currentTestimonialIndex ? 'home-page__testimonial-indicator--active' : ''}`}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  aria-label={`Go to testimonial group ${index + 1}`}
                  aria-current={index === currentTestimonialIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="home-page__trust" aria-labelledby="trust-heading">
        <div className="home-page__trust-container">
              <h2 id="trust-heading" className="home-page__trust-title">
                {t('home.trustSubtitle')}
              </h2>
              <div className="home-page__trust-features">
                <div className="home-page__trust-feature" aria-label={t('home.encryption')}>
                  <Shield size={24} aria-hidden="true" />
                  <span>{t('home.encryption')}</span>
                </div>
                <div className="home-page__trust-feature" aria-label={t('home.verifiedProfiles')}>
                  <CheckCircle size={24} aria-hidden="true" />
                  <span>{t('home.verifiedProfiles')}</span>
                </div>
                <div className="home-page__trust-feature" aria-label={t('home.safeSecure')}>
                  <Shield size={24} aria-hidden="true" />
                  <span>{t('home.safeSecure')}</span>
                </div>
              </div>
        </div>
      </section>

      {/* Final CTA Section */}
      {!currentUser && (
        <section className="home-page__cta" aria-labelledby="cta-heading">
          <div className="home-page__cta-container">
            <Motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 id="cta-heading" className="home-page__cta-title">
                {t('home.ctaTitle')}
              </h2>
              <p className="home-page__cta-subtitle">
                {t('home.ctaSubtitle')}
              </p>
              <Link
                to="/signup"
                className="home-page__btn home-page__btn--primary home-page__btn--cta"
                aria-label={t('home.getStartedFree')}
              >
                {t('home.getStartedFree')} <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </Motion.div>
          </div>
        </section>
      )}
      </div>
    </>
  );
};

export default HomePage;