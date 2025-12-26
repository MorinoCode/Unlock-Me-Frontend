import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import "./MyMatchesPage.css";
import { useAuth } from "../../context/useAuth";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";

const MyMatchesPage = () => {
  const [data, setData] = useState({ mutualMatches: [], sentLikes: [], incomingLikes: [] });
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {

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
      <section className="matches-section">
        <div className="matches-section__header">
          <div className="matches-section__title-group">
            <h2 className="matches-section__title">{title}</h2>
            <p className="matches-section__subtitle">{subtitle}</p>
          </div>
          <button className="matches-section__see-all-btn" onClick={() => navigate(`/mymatches/view-all/${type}`)}>
            See All
          </button>
        </div>

        <div className="matches-section__list">
          {isLockedForFree && userPlan === "free" ? (
            <div className="locked-card" onClick={() => navigate("/upgrade")}>
              <div className="locked-card__icon">🔒</div>
              <h3 className="locked-card__title">Who's interested?</h3>
              <p className="locked-card__text">
                Upgrade to <span className="locked-card__highlight">GOLD</span> to reveal people who already liked you!
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
                <div className="locked-card" onClick={() => navigate(`/mymatches/view-all/${type}`)}>
                  <div className="locked-card__icon">✨</div>
                  <p className="locked-card__text">View all {list.length} matches</p>
                </div>
              )}
            </>
          ) : (
            <div className="matches-section__empty">
              <p className="matches-section__empty-text">No connections here yet. Keep exploring!</p>
            </div>
          )}
        </div>
      </section>
    );
  };

  if (loading) return (
    <HeartbeatLoader/>
  );

  return (
    <ExploreBackgroundLayout>
      <div className="matches-page">
        <header className="matches-page__header">
          <div className="matches-page__header-content">
            <h1 className="matches-page__title">My Connections</h1>
            <p className="matches-page__subtitle">Managing your matches and likes</p>
          </div>
          <div className="matches-page__badge">
            Plan: <span className="matches-page__badge-val">{userPlan.toUpperCase()}</span>
          </div>
        </header>

        <div className="matches-page__content">
          {renderSection("Mutual Matches", data.mutualMatches, "mutual", "People you both liked each other")}

          {userPlan === "free" && (
            <div className="promo-card" onClick={() => navigate("/upgrade")}>
              <div className="promo-card__content">
                <h3 className="promo-card__title">Unlock "Who Liked You"</h3>
                <p className="promo-card__desc">Users with Gold plan get 3x more connections.</p>
              </div>
              <button className="promo-card__btn">Go Gold</button>
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