import React, { useState, useEffect } from "react";
import "./ExplorePage.css";

const ExplorePage = () => {
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
        const userRes = await fetch(`${API_URL}/api/user/location`, {
          credentials: "include",
        });
        const userData = await userRes.json();
        setCurrentUser(userData);
        const country = userData.location.country;
        console.log(country);

        const exploreRes = await fetch(
          `${API_URL}/api/user/explore?country=${country}`,
          {
            credentials: "include",
          }
        );
        const exploreData = await exploreRes.json();
        setSections(exploreData);
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

  const renderSection = (title, data, limitKey, subtitle) => {
    const limits = {
      free: { exact: 1, city: 15, interest: 12, country: 20 },
      premium: { exact: 5, city: 50, interest: 40, country: 100 },
      gold: { exact: 999, city: 999, interest: 999, country: 999 },
    };

    const userPlan = currentUser?.subscription?.plan || "free";
    const currentLimit = limits[userPlan][limitKey];

    return (
      <section className="explore-section">
        <div className="section-info">
          <div className="title-area">
            <h2>{title}</h2>
            <p className="subtitle">{subtitle}</p>
          </div>
          <button className="view-all">See All</button>
        </div>

        <div className="horizontal-scroll-container">
          {data.length > 0 ? (
            data.map((match, index) => {
              const isLocked = index >= currentLimit;
              return (
                <div
                  key={match._id}
                  className={`match-card-v2 ${isLocked ? "is-locked" : ""}`}
                >
                  {isLocked ? (
                    <div className="lock-overlay-v2">
                      <span className="lock-icon">🔒</span>
                      <p>
                        Unlock with {userPlan === "free" ? "Premium" : "Gold"}
                      </p>
                    </div>
                  ) : (
                    <div className="card-inner">
                      <div className="image-wrapper">
                        <img
                          src={match.avatar || "/default-avatar.png"}
                          alt={match.name}
                        />
                        <div className="match-badge">
                          {match.matchScore}% Match
                        </div>
                      </div>
                      <div className="info-wrapper">
                        <h3>
                          {match.name}, {calculateAge(match.birthday)}
                        </h3>
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
            })
          ) : (
            <div className="empty-state">
              No matches found in this category.
            </div>
          )}
        </div>
      </section>
    );
  };

  if (loading)
    return (
      <div className="explore-loading-screen">
        <div className="spinner"></div>
        <p>Calculating your matches...</p>
      </div>
    );

  return (
    <div className="explore-page-v2">
      <header className="explore-hero">
        <h1>Explore</h1>
        <div className="user-plan-badge">
          Plan: <span>{currentUser?.subscription?.plan || "Free"}</span>
        </div>
      </header>

      <div className="sections-wrapper">
        {renderSection(
          "The Soulmates",
          sections.exactMatches,
          "exact",
          "Highest compatibility based on your answers"
        )}
        {renderSection(
          `Nearby in ${currentUser?.location?.city || "Your City"}`,
          sections.cityMatches,
          "city",
          "People living right next to you"
        )}
        {renderSection(
          "Shared Interests",
          sections.interestMatches,
          "interest",
          "They like the same things you do"
        )}
        {renderSection(
          "Across the Country",
          sections.countryMatches,
          "country",
          `People in ${currentUser?.location?.country}`
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
