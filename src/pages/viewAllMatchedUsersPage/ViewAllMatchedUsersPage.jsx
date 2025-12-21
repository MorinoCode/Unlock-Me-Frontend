import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
import "./ViewAllMatchedUsersPage.css";

const ViewAllMatchedUsersPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState({ data: [], title: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Get User for Plan Info
        const userRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const userData = await userRes.json();
        setCurrentUser(userData);

        // 2. Get Matches
        const exploreRes = await fetch(`${API_URL}/api/user/explore?country=${userData.location?.country}`, { credentials: "include" });
        const exploreData = await exploreRes.json();

        // 3. Map category keys to actual data
        const categoryMap = {
          city: { data: exploreData.cityMatches, title: `People in ${userData.location?.city}` },
          interest: { data: exploreData.interestMatches, title: "Shared Passions" },
          country: { data: exploreData.countryMatches, title: `Across ${userData.location?.country}` }
        };

        setUsers(categoryMap[category] || { data: [], title: "Explore" });
      } catch (err) {
        console.error("Error fetching all matches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [category, API_URL]);

  const userPlan = currentUser?.subscription?.plan || "free";
  
  // Quota: Limit for free users in grid view
  const freeLimit = 12; 

  if (loading) return (
    <div className="loading-grid-container">
      <div className="spinner"></div>
      <p>Loading your potential matches...</p>
    </div>
  );

  return (
    <div className="view-all-container">
      <header className="view-all-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span className="arrow">←</span> Back to Explore
        </button>
        <div className="header-text-content">
          <h1>{users.title}</h1>
          <p>{users.data.length} amazing people found</p>
        </div>
      </header>

      <div className="matches-grid">
        {users.data.map((match, index) => (
          <UserCard 
            key={match._id} 
            user={match} 
            isLocked={userPlan === "free" && index >= freeLimit} 
            userPlan={userPlan} 
          />
        ))}
      </div>

      {/* Promotion Footer for Free Users */}
      {userPlan === "free" && users.data.length > freeLimit && (
        <div className="grid-upgrade-footer">
          <div className="footer-glow"></div>
          <h2>Explore Without Limits</h2>
          <p>You've reached the limit for the Free plan. Upgrade to see every single match in this category.</p>
          <div className="footer-actions">
            <button className="upgrade-btn-primary" onClick={() => navigate("/upgrade")}>
              Unlock All Matches
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllMatchedUsersPage;