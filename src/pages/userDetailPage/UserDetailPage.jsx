import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./UserDetailPage.css";

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/user/details/${userId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId, API_URL]);

  const handleAction = async (type) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const endpoint = type === "like" ? "/api/user/like" : "/api/user/dislike";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
        credentials: "include",
      });
      const data = await res.json();

      if (type === "like" && data.isMatch) {
        alert("🎉 It's a Match! You can now start chatting.");
      } else if (type === "like") {
        alert("Profile Liked! ❤️");
      }
      
      navigate("/explore");
    } catch (err) {
      console.error(`${type} action failed:`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="loading-screen-full">
      <div className="spinner"></div>
      <p>Opening Profile...</p>
    </div>
  );

  if (!user) return <div className="error-screen">User profile not found.</div>;

  const age = user.birthday?.year
    ? new Date().getFullYear() - parseInt(user.birthday.year)
    : "N/A";

  const displayTraits = (user.traits && user.traits.length > 0) 
    ? user.traits.slice(0, 4) 
    : (user.interests || []).slice(0, 4);

  return (
    <div className="profile-detail-page">
      <button className="back-nav-btn" onClick={() => navigate(-1)}>✕</button>

      <div className="profile-hero-header">
        <div className="profile-image-main">
          <img src={user.avatar || "/default-avatar.png"} alt={user.name} />
          <div className="match-score-pill">
            <span>{user.matchScore || 0}%</span>
            <small>Match</small>
          </div>
        </div>

        <div className="profile-meta">
          <h1>{user.name}, {age}</h1>
          <p className="location-info">📍 {user.location?.city || "Unknown City"}, {user.location?.country}</p>
          <div className="gender-tag">{user.gender}</div>
        </div>
      </div>

      <div className="profile-body-content">
        <section className="content-block">
          <h3>Personal Bio</h3>
          <p className="bio-description">
            {user.bio || "This user hasn't written a bio yet. They are a mystery!"}
          </p>
        </section>

        <section className="content-block">
          <h3>Interests & Hobbies</h3>
          <div className="interest-bubbles">
            {user.interests && user.interests.length > 0 ? (
              user.interests.map((item, i) => (
                <span key={i} className="bubble">{item}</span>
              ))
            ) : (
              <p className="empty-text">No interests listed.</p>
            )}
          </div>
        </section>

        <section className="content-block">
          <h3>Compatibility Vibes</h3>
          <div className="personality-traits">
            {user.matchScore >= 70 && (
              <p className="match-insight">✨ You have a strong personality connection!</p>
            )}
            <div className="traits-grid-detail">
              {displayTraits.length > 0 ? (
                displayTraits.map((trait, i) => (
                  <div key={i} className="trait-item">
                    <span className="trait-icon">✦</span>
                    <span className="trait-name">{trait}</span>
                  </div>
                ))
              ) : (
                <p className="empty-text">Answer more quizzes to see compatibility traits.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="action-bar-fixed">
        <button 
          className="circle-action dislike-btn" 
          disabled={isProcessing}
          onClick={() => handleAction("dislike")}
          title="Dislike"
        >
          ✕
        </button>
        
        <button 
          className="main-action chat-btn" 
          onClick={() => navigate(`/chat/${userId}`)}
        >
          Start Chat
        </button>
        
        <button 
          className="circle-action like-btn" 
          disabled={isProcessing}
          onClick={() => handleAction("like")}
          title="Like"
        >
          ❤
        </button>
      </footer>
    </div>
  );
};

export default UserDetailPage;