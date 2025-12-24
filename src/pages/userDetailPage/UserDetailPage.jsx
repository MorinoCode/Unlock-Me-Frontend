import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AIInsightSection from "../../components/aiInsightSection/AIInsightSection";
import "./UserDetailPage.css";

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/user/details/${userId}`, { credentials: "include" });
        const data = await res.json();
        setUser(data);
        setIsLiked(data.alreadyLiked || false);
        setIsDisliked(data.alreadyDisliked || false);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchUserDetails();
  }, [userId, API_URL]);

  const handleToggleAction = async (type) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const isRemoving = type === "like" ? isLiked : isDisliked;
    const endpoint = type === "like" 
      ? (isRemoving ? "/api/user/unlike" : "/api/user/like") 
      : (isRemoving ? "/api/user/undislike" : "/api/user/dislike");

    try {
      await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
        credentials: "include",
      });

      if (type === "like") {
        setIsLiked(!isLiked);
        if (!isLiked) setIsDisliked(false); 
      } else {
        setIsDisliked(!isDisliked);
        if (!isDisliked) setIsLiked(false); 
      }
    } catch (err) {
      console.error(`${type} toggle failed:`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="loading-screen-full"><div className="spinner"></div></div>;
  if (!user) return <div className="error-screen">Profile not found.</div>;

  const age = user.birthday?.year ? new Date().getFullYear() - parseInt(user.birthday.year) : "N/A";

  // تابع کمکی برای تعیین کلاس رنگی بر اساس امتیاز (هماهنگ با Explore)
  const getMatchClass = (score) => {
    if (score >= 80) return "match-high-badge"; // سبز
    if (score >= 60) return "match-mid-badge";  // نارنجی
    return "match-low-badge";              // سرمه‌ای/خاکستری
  };

  return (
    <div className="profile-detail-page">
      <button className="sticky-close-btn" onClick={() => navigate(-1)}>✕</button>

      <div className="profile-hero-section">
        <div className="hero-img-box">
          <img className="circle-avatar" src={user.avatar || "../../assets/default-avatar.png"} alt={user.name} />
          
          {/* بخش Badge که حالا کلاس داینامیک می‌گیرد */}
          <div className={`match-badge-premium ${getMatchClass(user.matchScore || 0)}`}>
            <span className="mb-percent">{user.matchScore || 0}%</span>
            <span className="mb-label">MATCH</span>
          </div>
        </div>
        
        <div className="hero-text-box">
          <h1>{user.name}, {age}</h1>
          <p className="loc-display">📍 {user.location?.city}, {user.location?.country}</p>
          <div className="hero-tags">
            <span className="tag-gender-styled">{user.gender}</span>
          </div>
        </div>
      </div>

      <div className="profile-scroll-content">
        <section className="detail-card">
          <h3 className="card-title">Gallery</h3>
          <div className="gallery-masonry">
            {user.gallery?.length > 0 ? (
              user.gallery.map((img, i) => (
                <div key={i} className="gallery-img-wrapper"><img src={img} alt="" /></div>
              ))
            ) : (
              <div className="empty-gallery-msg">No photos shared yet.</div>
            )}
          </div>
        </section>

        <div className="info-double-grid">
          <section className="detail-card">
            <h3 className="card-title">Bio</h3>
            <p className="bio-text">{user.bio || "No biography available."}</p>
          </section>
          <section className="detail-card-looking-for">
            <h3 className="card-title">Looking For :</h3>
            <div className="looking-for-pill--looking-for"><p className="user-looking-for-gender">{user.lookingFor?.toUpperCase() || "Seeking a genuine connection."}</p></div>
          </section>
        </div>

        <AIInsightSection user={user} />

        <section className="detail-card">
          <h3 className="card-title">Interests & Common Ground</h3>
          <div className="interest-flow">
            {user.interests?.map((item, i) => (
              <span key={i} className="modern-tag"><span className="t-star">★</span> {item}</span>
            ))}
            {user.commonCategories?.map((cat, i) => (
              <span key={`common-${i}`} className="common-tag"><span className="t-check">✔</span> {cat}</span>
            ))}
          </div>
        </section>
      </div>

      <footer className="action-bar-floating">
        <button 
          className={`act-circle dislike ${isDisliked ? "active-dislike" : ""}`} 
          onClick={() => handleToggleAction("dislike")} 
          disabled={isProcessing}
        >
          {isDisliked ? "👎" : "👎🏻"}
        </button>
        <button className="act-main-chat" onClick={() => navigate(`/chat/${userId}`)}>
          Start Conversation
        </button>
        <button 
          className={`act-circle like ${isLiked ? "active-like" : ""}`} 
          onClick={() => handleToggleAction("like")} 
          disabled={isProcessing}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>
      </footer>
    </div>
  );
};

export default UserDetailPage;