import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import "./MyMatchesPage.css";

const MyMatchesPage = () => {
  const [data, setData] = useState({ mutualMatches: [], sentLikes: [], incomingLikes: [] });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const userData = await userRes.json();
        setCurrentUser(userData);

        const res = await fetch(`${API_URL}/api/user/matches`, { credentials: "include" });
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const userPlan = currentUser?.subscription?.plan || "free";

  const renderSection = (title, list, type, subtitle, isLockedForFree = false) => {
    const limits = {
      free: { mutual: 10, sent: 5, incoming: 0 },
      premium: { mutual: 50, sent: 30, incoming: 10 },
      gold: { mutual: 999, sent: 999, incoming: 999 }
    };

    const currentLimit = limits[userPlan][type] || 0;
    const displayList = list.slice(0, 20);

    return (
      <section className="explore-section">
        <div className="section-header-wrapper">
          <div className="header-title-group">
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </div>
          <button className="see-all-btn" onClick={() => navigate(`/mymatches/view-all/${type}`)}>
            See All
          </button>
        </div>

        <div className="horizontal-scroll">
          {isLockedForFree && userPlan === "free" ? (
            <div className="locked-more-card" onClick={() => navigate("/upgrade")}>
              <div className="lock-circle">🔒</div>
              <h3 style={{fontSize: '1.1rem', marginBottom: '8px'}}>Who's interested?</h3>
              <p style={{fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center'}}>
                Upgrade to <span>GOLD</span> to reveal people who already liked you!
              </p>
            </div>
          ) : list.length > 0 ? (
            <>
              {displayList.map((user, index) => (
                <UserCard 
                  key={user._id} 
                  user={user} 
                  isLocked={index >= currentLimit} 
                  userPlan={userPlan} 
                />
              ))}
              {list.length > 20 && (
                <div className="locked-more-card" onClick={() => navigate(`/mymatches/view-all/${type}`)}>
                  <div className="lock-circle">✨</div>
                  <p>View all {list.length} matches</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state-modern-box">
              <p>No connections here yet. Keep exploring!</p>
            </div>
          )}
        </div>
      </section>
    );
  };

  if (loading) return (
    <div className="loading-matches-screen">
      <div className="match-spinner"></div>
      <p>Finding your connections...</p>
    </div>
  );

  return (
    <ExploreBackgroundLayout>
      <div className="explore-page-container">
        <header className="explore-header">
          <div className="header-text">
            <h1>My Connections</h1>
            <p>Managing your matches and likes</p>
          </div>
          <div className="plan-badge">
            Plan: <span>{userPlan.toUpperCase()}</span>
          </div>
        </header>

        <div className="dashboard-content-scroll">
          {renderSection("Mutual Matches", data.mutualMatches, "mutual", "People you both liked each other")}

          {userPlan === "free" && (
            <div className="promo-banner-card" onClick={() => navigate("/upgrade")}>
              <div className="promo-text">
                <h3>Unlock "Who Liked You"</h3>
                <p>Users with Gold plan get 3x more connections.</p>
              </div>
              <button className="promo-upgrade-btn">Go Gold</button>
            </div>
          )}

          {renderSection("Who Liked You", data.incomingLikes, "incoming", "They are waiting for your swipe!", true)}

          {renderSection("Sent Likes", data.sentLikes, "sent", "People you've shown interest in")}
        </div>
      </div>
    </ExploreBackgroundLayout>
  );
};

export default MyMatchesPage;