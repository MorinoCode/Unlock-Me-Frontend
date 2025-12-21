import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard.jsx"; 
import "./ExplorePage.css";

const ExplorePage = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState({
    exactMatches: [],
    cityMatches: [],
    interestMatches: [],
    countryMatches: [],
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch current user context
        const userRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const userData = await userRes.json();
        setCurrentUser(userData);

        // 2. Fetch matches based on country
        if (userData.location?.country) {
          const exploreRes = await fetch(
            `${API_URL}/api/user/explore?country=${userData.location.country}`,
            { credentials: "include" }
          );
          const exploreData = await exploreRes.json();
          setSections(exploreData);
        }
      } catch (err) {
        console.error("Error fetching explore data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const renderSection = (title, data, limitKey, subtitle) => {
    const userPlan = currentUser?.subscription?.plan || "free";
    
    // Limits for the horizontal preview
    const previewLimits = {
      free: { city: 15, interest: 12, country: 20 },
      premium: { city: 50, interest: 40, country: 100 },
      gold: { city: 999, interest: 999, country: 999 }
    };
    
    const currentLimit = previewLimits[userPlan][limitKey] || 10;
    // Show only first 20 in horizontal scroll
    const displayData = data.slice(0, 20);

    return (
      <section className="explore-section">
        <div className="section-info">
          <div className="title-area">
            <h2>{title}</h2>
            <p className="subtitle">{subtitle}</p>
          </div>
          <button 
            className="view-all" 
            onClick={() => navigate(`/explore/view-all/${limitKey}`)}
          >
            See More
          </button>
        </div>

        <div className="horizontal-scroll-container">
          {displayData.length > 0 ? (
            displayData.map((match, index) => (
              <UserCard 
                key={match._id} 
                user={match} 
                isLocked={index >= currentLimit} 
                userPlan={userPlan}
              />
            ))
          ) : (
            <div className="empty-state">No matches found here yet.</div>
          )}
        </div>
      </section>
    );
  };

  if (loading) return (
    <div className="explore-loading-screen">
      <div className="spinner"></div>
      <p>Building your social circle...</p>
    </div>
  );

  const userPlan = currentUser?.subscription?.plan || "free";

  return (
    <div className="explore-page-v2">
      <header className="explore-hero">
        <div className="hero-text">
          <h1>Explore</h1>
          <p>Discover people in {currentUser?.location?.country}</p>
        </div>
        <div className="plan-pill">Plan: <span>{userPlan}</span></div>
      </header>

      <div className="sections-wrapper">
        {/* Row 1: Nearby Users */}
        {renderSection(`Near You`, sections.cityMatches, "city", `People in ${currentUser?.location?.city}`)}

        {/* PROMO: Engagement */}
        <div className="promo-banner info-promo">
          <div className="promo-text">
            <h3>Boost Your Matches! 🚀</h3>
            <p>Users who answer more than 20 questions get 5x more visibility.</p>
          </div>
          <button className="promo-btn" onClick={() => navigate("/initial-quizzes/interests")}>Answer More</button>
        </div>

        {/* Row 2: Interests */}
        {renderSection("Common Interests", sections.interestMatches, "interest", "Shared hobbies and passions")}

        {/* Row 3: Soulmates (Conditional) */}
        <section className="explore-section soulmates-container">
          <div className="section-info">
            <div className="title-area">
              <h2>The Soulmates</h2>
              <p className="subtitle">Compatibility scores above 80%</p>
            </div>
          </div>
          
          {userPlan === "free" ? (
            <div className="soulmate-locked-card" onClick={() => navigate("/upgrade")}>
              <div className="lock-glow"></div>
              <span className="lock-emoji">💎</span>
              <h3>Premium Discovery</h3>
              <p>Your top 5 matches are hidden. Upgrade to reveal them.</p>
              <button className="upgrade-action-btn">Unlock Now</button>
            </div>
          ) : (
            <div className="horizontal-scroll-container">
              {sections.exactMatches.slice(0, userPlan === "gold" ? 99 : 5).map(match => (
                <UserCard key={match._id} user={match} isLocked={false} userPlan={userPlan} />
              ))}
            </div>
          )}
        </section>

        {/* PROMO: Upgrade */}
        {userPlan !== "gold" && (
          <div className="promo-banner gold-promo">
            <div className="promo-text">
              <h3>Experience Gold 🏆</h3>
              <p>Unlimited unlocks, priority messaging, and hidden profile mode.</p>
            </div>
            <button className="promo-btn gold-bg" onClick={() => navigate("/upgrade")}>Go Gold</button>
          </div>
        )}

        {/* Row 4: Country-wide */}
        {renderSection("Across the Country", sections.countryMatches, "country", `Everyone in ${currentUser?.location?.country}`)}
      </div>
    </div>
  );
};

export default ExplorePage;