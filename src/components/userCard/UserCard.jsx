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
    if (s >= 80) return { modifier: "user-card__match-badge--high", icon: "🔥", label: "SUPER" };
    if (s >= 60) return { modifier: "user-card__match-badge--mid", icon: "✨", label: "GOOD" };
    return { modifier: "user-card__match-badge--low", icon: "•", label: "MATCH" };
  };
  
  const matchStyle = getMatchStyle(score);

  return (
    <div className={`user-card ${isLocked ? "user-card--locked" : ""}`}>
      
      {isLocked ? (
        <div className="user-card__lock-overlay" onClick={handleUnlockClick}>
          <div className="user-card__lock-content">
            <span className="user-card__lock-icon">🔒</span>
            <h3 className="user-card__lock-title">Premium</h3>
            <p className="user-card__lock-desc">Tap to unlock</p>
          </div>
        </div>
      ) : (
        <>
          <div className="user-card__media">
            <img 
              src={user.avatar || "/default-avatar.png"} 
              alt={user.name} 
              className="user-card__image"
            />
            
            <button 
              className={`user-card__like-btn ${liked ? "user-card__like-btn--active" : ""}`} 
              onClick={handleLikeClick}
            >
              <svg className="user-card__heart-svg" viewBox="0 0 24 24">
                <path className="user-card__heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
            
            <div className={`user-card__match-badge ${matchStyle.modifier}`}>
              <span className="user-card__match-score">{score}%</span>
              <span className="user-card__match-label">{matchStyle.label}</span>
            </div>
            
            <div className="user-card__shadow"></div>
          </div>

          <div className="user-card__body">
            <div className="user-card__info">
              <h3 className="user-card__name">{user.name}, {calculateAge(user.birthday)}</h3>
              <span className="user-card__location">📍 {user.location?.city || "N/A"}</span>
            </div>

            <button className="user-card__action-btn" onClick={goToProfile}>
              View Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserCard;