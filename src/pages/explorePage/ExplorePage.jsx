import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        // 1. Get current user profile and location
        const userRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const userData = await userRes.json();
        setCurrentUser(userData);

        // 2. Fetch matches based on country
        const country = userData.location?.country;
        if (country) {
          const exploreRes = await fetch(`${API_URL}/api/user/explore?country=${country}`, { credentials: "include" });
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

  const calculateAge = (birthday) => {
    if (!birthday || !birthday.year) return "";
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthday.year);
  };

  const renderSection = (title, data, limitKey, subtitle, showSeeMore = true) => {
    const userPlan = currentUser?.subscription?.plan || "free";
    
    // Limits for the horizontal preview only
    const previewLimits = {
      free: { city: 15, interest: 12, country: 20 },
      premium: { city: 50, interest: 40, country: 100 },
      gold: { city: 999, interest: 999, country: 999 }
    };
    
    const currentLimit = previewLimits[userPlan][limitKey] || 10;
    // Show only 20 max in the horizontal list as per your request
    const displayData = data.slice(0, 20);

    return (
      <section className="explore-section">
        <div className="section-info">
          <div className="title-area">
            <h2>{title}</h2>
            <p className="subtitle">{subtitle}</p>
          </div>
          {showSeeMore && (
            <button className="view-all" onClick={() => navigate(`/explore/view-all/${limitKey}`)}>
              See More
            </button>
          )}
        </div>

        <div className="horizontal-scroll-container">
          {displayData.map((match, index) => {
            const isLocked = index >= currentLimit;
            return (
              <div key={match._id} className={`match-card-v2 ${isLocked ? "is-locked" : ""}`}>
                {isLocked ? (
                  <div className="lock-overlay-v2">
                    <span className="lock-icon">🔒</span>
                    <p>Unlock more with {userPlan === "free" ? "Premium" : "Gold"}</p>
                  </div>
                ) : (
                  <div className="card-inner">
                    <div className="image-wrapper">
                      <img src={match.avatar || "/default-avatar.png"} alt={match.name} />
                      <div className="match-badge">{match.matchScore}%</div>
                    </div>
                    <div className="info-wrapper">
                      <h3>{match.name}, {calculateAge(match.birthday)}</h3>
                      <p className="city-name">📍 {match.location?.city}</p>
                      <div className="mini-tags">
                        {match.interests?.slice(0, 2).map((tag, i) => (
                          <span key={i}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  if (loading) return <div className="explore-loading-screen"><div className="spinner"></div><p>Finding your connections...</p></div>;

  const userPlan = currentUser?.subscription?.plan || "free";

  return (
    <div className="explore-page-v2">
      <header className="explore-hero">
        <div className="hero-text">
          <h1>Explore</h1>
          <p>Find your perfect match in {currentUser?.location?.country}</p>
        </div>
        <div className="plan-pill">Plan: <span>{userPlan}</span></div>
      </header>

      <div className="sections-wrapper">
        {/* 1. Near You Section */}
        {renderSection(`Near You`, sections.cityMatches, "city", `People in ${currentUser?.location?.city}`)}

        {/* 2. AD/PROMO: Better Compatibility */}
        <div className="promo-banner info-promo">
          <div className="promo-text">
            <h3>Boost Your Matches! 🚀</h3>
            <p>Users who answer more than 20 questions get 5x better results.</p>
          </div>
          <button className="promo-btn" onClick={() => navigate("/initial-quizzes/interests")}>Answer More</button>
        </div>

        {/* 3. Interest Section */}
        {renderSection("Common Interests", sections.interestMatches, "interest", "Shared hobbies and passions")}

        {/* 4. THE SOULMATES (Conditional Display) */}
        <section className="explore-section soulmates-container">
          <div className="section-info">
            <div className="title-area">
              <h2>The Soulmates</h2>
              <p className="subtitle">Highest compatibility scores (80%+)</p>
            </div>
          </div>
          
          {userPlan === "free" ? (
            <div className="soulmate-locked-card" onClick={() => navigate("/upgrade")}>
              <div className="lock-glow"></div>
              <span className="lock-emoji">💎</span>
              <h3>Your Soulmate is waiting</h3>
              <p>Upgrade to Premium to see your top 5 exact matches</p>
              <button className="upgrade-action-btn">Unlock Soulmates</button>
            </div>
          ) : (
            <div className="horizontal-scroll-container">
              {/* Gold sees all, Premium sees top 5 */}
              {sections.exactMatches.slice(0, userPlan === "gold" ? 99 : 5).map(match => (
                <div key={match._id} className="match-card-v2">
                   <div className="card-inner">
                    <div className="image-wrapper">
                      <img src={match.avatar} alt={match.name} />
                      <div className="match-badge gold-badge">{match.matchScore}%</div>
                    </div>
                    <div className="info-wrapper">
                      <h3>{match.name}, {calculateAge(match.birthday)}</h3>
                      <p className="city-name">📍 {match.location?.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. AD/PROMO: Upgrade to Gold */}
        {userPlan !== "gold" && (
          <div className="promo-banner gold-promo">
            <div className="promo-text">
              <h3>Unlock Everything with Gold 🏆</h3>
              <p>Unlimited city unlocks, personalized categories, and see who likes you.</p>
            </div>
            <button className="promo-btn gold-bg" onClick={() => navigate("/upgrade")}>Go Gold</button>
          </div>
        )}

        {/* 6. Global Country Matches */}
        {renderSection("Across the Country", sections.countryMatches, "country", `Everyone in ${currentUser?.location?.country}`, true)}
      </div>
    </div>
  );
};

export default ExplorePage;