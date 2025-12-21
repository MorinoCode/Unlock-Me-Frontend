import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewAllMatchedUsersPage.css";

const ViewAllMatchedUsersPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
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
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [category, API_URL]);

  const userPlan = currentUser?.subscription?.plan || "free";
  // Limit for free users in grid view
  const freeLimit = 12; 

  if (loading) return <div className="loading-grid">Loading matches...</div>;

  return (
    <div className="view-all-container">
      <header className="view-all-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>{users.title}</h1>
        <p>{users.data.length} potential matches found</p>
      </header>

      <div className="matches-grid">
        {users.data.map((match, index) => {
          const isLocked = userPlan === "free" && index >= freeLimit;

          return (
            <div key={match._id} className={`grid-card ${isLocked ? "locked-grid-card" : ""}`}>
              {isLocked ? (
                <div className="grid-lock-content">
                  <span className="lock-icon">🔒</span>
                  <button onClick={() => navigate("/upgrade")}>Unlock All</button>
                </div>
              ) : (
                <div className="grid-card-inner">
                  <div className="grid-image-hold">
                    <img src={match.avatar || "/default-avatar.png"} alt={match.name} />
                    <div className="grid-score">{match.matchScore}%</div>
                  </div>
                  <div className="grid-info">
                    <h3>{match.name}, {new Date().getFullYear() - (match.birthday?.year || 2000)}</h3>
                    <p>{match.location?.city}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {userPlan === "free" && users.data.length > freeLimit && (
        <div className="grid-upgrade-footer">
          <h2>Want to see more?</h2>
          <p>Upgrade to Premium or Gold to see all matches in this category.</p>
          <button onClick={() => navigate("/upgrade")}>Upgrade Plan</button>
        </div>
      )}
    </div>
  );
};

export default ViewAllMatchedUsersPage;