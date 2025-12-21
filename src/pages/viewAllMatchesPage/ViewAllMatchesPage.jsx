import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
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
        // Get user for plan check
        const userRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const userData = await userRes.json();
        setCurrentUser(userData);

        // Get dashboard data
        const res = await fetch(`${API_URL}/api/user/matches-dashboard`, { credentials: "include" });
        const data = await res.json();

        // Map type to data and title
        if (type === "mutual") {
          setUsers(data.mutualMatches);
          setTitle("Mutual Matches");
        } else if (type === "sent") {
          setUsers(data.sentLikes);
          setTitle("People You Liked");
        } else if (type === "incoming") {
          setUsers(data.incomingLikes);
          setTitle("People Who Liked You");
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [type, API_URL]);

  const userPlan = currentUser?.subscription?.plan || "free";
  
  // Custom limits for Grid view
  const limits = {
    free: { mutual: 20, sent: 10, incoming: 0 },
    premium: { mutual: 100, sent: 50, incoming: 10 },
    gold: { mutual: 999, sent: 999, incoming: 999 }
  };
  const currentLimit = limits[userPlan][type] || 0;

  if (loading) return <div className="loading-state">Loading your matches...</div>;

  return (
    <div className="view-all-matches">
      <header className="view-all-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>{title}</h1>
        <p>Showing {users.length} connections</p>
      </header>

      <div className="matches-grid">
        {users.map((user, index) => (
          <UserCard 
            key={user._id} 
            user={user} 
            isLocked={index >= currentLimit} 
            userPlan={userPlan} 
          />
        ))}
      </div>

      {userPlan === "free" && type === "incoming" && (
        <div className="upsell-footer">
          <h2>Want to see who likes you?</h2>
          <p>Upgrade to Gold to unlock your incoming likes and match instantly!</p>
          <button onClick={() => navigate("/upgrade")}>Upgrade Now</button>
        </div>
      )}
    </div>
  );
};

export default ViewAllMatchesPage;