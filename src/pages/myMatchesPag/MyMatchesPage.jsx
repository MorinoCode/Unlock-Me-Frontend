import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
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
        // Get user context for plans
        const userRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const userData = await userRes.json();
        setCurrentUser(userData);

        // Get all types of matches
        const res = await fetch(`${API_URL}/api/user/matches-dashboard`, { credentials: "include" });
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const userPlan = currentUser?.subscription?.plan || "free";

  const renderSection = (title, list, type, subtitle, isLockedForFree = false) => {
    const limits = {
      free: { mutual: 10, sent: 5, incoming: 0 }, // Incoming is totally locked for free
      premium: { mutual: 50, sent: 30, incoming: 5 },
      gold: { mutual: 999, sent: 999, incoming: 999 }
    };

    const currentLimit = limits[userPlan][type] || 0;
    const displayList = list.slice(0, 20);

    return (
      <section className="match-section">
        <div className="section-header">
          <div>
            <h2>{title}</h2>
            <p className="subtitle">{subtitle}</p>
          </div>
          <button className="see-more-btn" onClick={() => navigate(`/matches/view-all/${type}`)}>See More</button>
        </div>

        <div className="horizontal-scroll">
          {isLockedForFree && userPlan === "free" ? (
            <div className="locked-section-card" onClick={() => navigate("/upgrade")}>
              <span>🔒</span>
              <h3>Who liked you?</h3>
              <p>Upgrade to Gold to see people who already swiped right on you!</p>
            </div>
          ) : list.length > 0 ? (
            displayList.map((user, index) => (
              <UserCard 
                key={user._id} 
                user={user} 
                isLocked={index >= currentLimit} 
                userPlan={userPlan} 
              />
            ))
          ) : (
            <div className="empty-mini-state">No one here yet.</div>
          )}
        </div>
      </section>
    );
  };

  if (loading) return <div className="loading-matches">Loading your connections...</div>;

  return (
    <div className="matches-dashboard">
      <header className="dashboard-header">
        <h1>My Connections</h1>
        <div className="plan-tag">Plan: {userPlan}</div>
      </header>

      <div className="dashboard-content">
        {/* 1. Mutual Matches */}
        {renderSection("Mutual Matches", data.mutualMatches, "mutual", "People you both liked each other")}

        {/* PROMO */}
        <div className="match-promo blue-promo">
          <p>Want to stand out? Users with Gold plan get 3x more mutual matches.</p>
          <button onClick={() => navigate("/upgrade")}>Go Gold</button>
        </div>

        {/* 2. Who Liked Me (Incoming) - Best selling point for Gold */}
        {renderSection("Who Liked You", data.incomingLikes, "incoming", "They are waiting for you!", true)}

        {/* 3. Sent Likes */}
        {renderSection("Sent Likes", data.sentLikes, "sent", "People you are interested in")}
      </div>
    </div>
  );
};

export default MyMatchesPage;