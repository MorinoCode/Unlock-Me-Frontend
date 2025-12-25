import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import "./ViewAllMatchesPage.css";

const ViewAllMatchesPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const userRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const userData = await userRes.json();
        setCurrentUser(userData);

        const res = await fetch(`${API_URL}/api/user/matches`, { credentials: "include" });
        const data = await res.json();

        if (type === "mutual") {
          setUsers(data.mutualMatches || []);
          setTitle("Mutual Matches");
        } else if (type === "sent") {
          setUsers(data.sentLikes || []);
          setTitle("People You Liked");
        } else if (type === "incoming") {
          setUsers(data.incomingLikes || []);
          setTitle("People Who Liked You");
        }
      } catch (err) {
        console.error("Error fetching all matches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [type, API_URL]);

  const userPlan = currentUser?.subscription?.plan || "free";
  
  const limits = {
    free: { mutual: 20, sent: 10, incoming: 0 },
    premium: { mutual: 100, sent: 50, incoming: 10 },
    gold: { mutual: 999, sent: 999, incoming: 999 }
  };
  const currentLimit = limits[userPlan][type] || 0;

  if (loading) return (
    <div className="matches-loader">
      <div className="matches-loader__spinner"></div>
      <p className="matches-loader__text">Loading {type} connections...</p>
    </div>
  );

  return (
    <ExploreBackgroundLayout>
      <div className="matches-page">
        <header className="matches-page__header">
          <div className="matches-page__header-top">
            <button className="matches-page__back-btn" onClick={() => navigate(-1)}>
              <span className="matches-page__back-icon">←</span> Back
            </button>
            <div className="matches-page__plan-badge">
               PLAN: <span className="matches-page__plan-name">{userPlan.toUpperCase()}</span>
            </div>
          </div>
          <div className="matches-page__header-content">
            <h1 className="matches-page__title">{title}</h1>
            <p className="matches-page__count">Showing {users.length} connections</p>
          </div>
        </header>

        <div className="matches-page__grid">
          {users.map((user, index) => (
            <div 
              className="matches-page__card-wrapper" 
              key={user._id} 
              style={{ "--delay": `${index * 0.05}s` }}
            >
              <UserCard 
                user={user} 
                isLocked={index >= currentLimit} 
                userPlan={userPlan} 
              />
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="matches-page__empty-state">
              <span className="matches-page__empty-icon">🔍</span>
              <p className="matches-page__empty-text">No connections found in this category.</p>
              <button className="matches-page__explore-btn" onClick={() => navigate("/explore")}>
                Explore People
              </button>
            </div>
          )}
        </div>

        {userPlan === "free" && type === "incoming" && (
          <div className="matches-page__upsell-banner" onClick={() => navigate("/upgrade")}>
            <div className="matches-page__upsell-info">
              <h2 className="matches-page__upsell-title">Reveal who liked you!</h2>
              <p className="matches-page__upsell-desc">Someone special is waiting in this list. Upgrade to Gold to unlock them instantly.</p>
            </div>
            <button className="matches-page__upsell-btn">Go Gold</button>
          </div>
        )}
      </div>
    </ExploreBackgroundLayout>
  );
};

export default ViewAllMatchesPage;