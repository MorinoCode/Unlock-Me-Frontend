import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserCard.css";

const UserCard = ({ user, isLocked }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const goToProfile = (e) => {
    e.stopPropagation();
    navigate(`/user-profile/${user._id}`);
  };

  const handleUnlockClick = () => {
    navigate("/upgrade");
  };

  const calculateAge = (birthday) => {
    if (!birthday || !birthday.year) return "";
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthday.year);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (isLiking || isLocked) return;

    setIsLiking(true);
    const newStatus = !liked;
    setLiked(newStatus);

    try {
      if (newStatus) {
        await fetch(`${API_URL}/api/user/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: user._id }),
          credentials: "include",
        });
      }
    } catch (err) {
      console.error("Like error:", err);
      setLiked(!newStatus);
    } finally {
      setIsLiking(false);
    }
  };

  const score = user.matchScore || 0;
  
  const getMatchStyle = (s) => {
    if (s >= 80) return { class: "match-high", icon: "🔥", label: "SUPER" };
    if (s >= 60) return { class: "match-mid", icon: "✨", label: "GOOD" };
    return { class: "match-low", icon: "•", label: "MATCH" };
  };
  
  const matchStyle = getMatchStyle(score);

  return (
    <div className={`compact-user-card ${isLocked ? "is-locked" : ""}`}>
      
      {isLocked ? (
        <div className="card-lock-overlay" onClick={handleUnlockClick}>
          <div className="lock-content">
            <span className="lock-emoji">🔒</span>
            <h3>Premium</h3>
            <p>Tap to unlock</p>
          </div>
        </div>
      ) : (
        <>
          <div className="card-media-wrapper">
            <img 
              src={user.avatar || "/default-avatar.png"} 
              alt={user.name} 
              className="user-img-cover"
            />
            
            <button 
              className={`like-btn-compact ${liked ? "is-liked" : ""}`} 
              onClick={handleLikeClick}
            >
              <svg className="heart-svg" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
            
            <div className={`match-badge-compact ${matchStyle.class}`}>
              <span className="match-val">{score}%</span>
              <span className="match-lbl">{matchStyle.label}</span>
            </div>
            
            <div className="gradient-shadow"></div>
          </div>

          <div className="card-body-compact">
            <div className="info-header">
              <h3 className="user-name-age">{user.name}, {calculateAge(user.birthday)}</h3>
              <span className="location-tiny">📍 {user.location?.city || "N/A"}</span>
            </div>


            <button className="view-profile-compact" onClick={goToProfile}>
              View Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserCard;