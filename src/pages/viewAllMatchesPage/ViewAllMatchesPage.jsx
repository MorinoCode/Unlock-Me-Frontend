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
        // دریافت اطلاعات کاربر برای بررسی پلن
        const userRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const userData = await userRes.json();
        setCurrentUser(userData);

        // اصلاح شده: استفاده از اندپوینت صحیح مطابق بک‌اِند
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
    <div className="loading-container-viewall">
      <div className="match-spinner"></div>
      <p>Loading {type} connections...</p>
    </div>
  );

  return (
    <ExploreBackgroundLayout>
      <div className="view-all-container">
        <header className="view-all-header-modern">
          <div className="header-top">
            <button className="back-btn-modern" onClick={() => navigate(-1)}>
              <span>←</span> Back
            </button>
            <div className="plan-badge-viewall">
               PLAN: <span>{userPlan.toUpperCase()}</span>
            </div>
          </div>
          <div className="header-bottom-text">
            <h1 className="gradient-title-viewall">{title}</h1>
            <p className="results-count">Showing {users.length} connections</p>
          </div>
        </header>

        <div className="matches-grid-modern">
          {users.map((user, index) => (
            <div className="grid-card-anim" key={user._id} style={{ "--delay": `${index * 0.05}s` }}>
              <UserCard 
                user={user} 
                isLocked={index >= currentLimit} 
                userPlan={userPlan} 
              />
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="empty-view-state">
              <span className="empty-icon-large">🔍</span>
              <p>No connections found in this category.</p>
              <button className="explore-more-btn" onClick={() => navigate("/explore")}>
                Explore People
              </button>
            </div>
          )}
        </div>

        {userPlan === "free" && type === "incoming" && (
          <div className="gold-upsell-banner" onClick={() => navigate("/upgrade")}>
            <div className="upsell-content">
              <h2>Reveal who liked you!</h2>
              <p>Someone special is waiting in this list. Upgrade to Gold to unlock them instantly.</p>
            </div>
            <button className="gold-action-btn">Go Gold</button>
          </div>
        )}
      </div>
    </ExploreBackgroundLayout>
  );
};

export default ViewAllMatchesPage;