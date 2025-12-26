import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVisibilityThreshold } from "../../utils/subscriptionRules"; 
import "./UserCard.css";

const UserCard = ({ user, isLocked: parentLocked, userPlan }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // محاسبه قفل بودن
  const score = user.matchScore || 0;
  const threshold = getVisibilityThreshold(userPlan);
  const isLocked = parentLocked || score > threshold;

  const goToProfile = (e) => {
    e.stopPropagation();
    if (isLocked) {
        navigate("/upgrade");
        return;
    }
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

  // استایل مچ اسکور (برای استفاده در کنار دکمه)
  const getMatchColor = (s) => {
    if (s >= 80) return "#10b981"; // Green
    if (s >= 60) return "#f59e0b"; // Orange
    return "#94a3b8"; // Gray
  };

  return (
    <div className={`user-card ${isLocked ? "user-card--locked" : ""}`} onClick={goToProfile}>
      
      {/* --- لایک باتن (همیشه بالا سمت راست) --- */}
      {!isLocked && (
          <button 
            className={`user-card__like-btn ${liked ? "user-card__like-btn--active" : ""}`} 
            onClick={handleLikeClick}
          >
            <svg className="user-card__heart-svg" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
      )}

      {/* --- حالت قفل شده --- */}
      {isLocked ? (
        <div className="user-card__lock-overlay" onClick={handleUnlockClick}>
          <div 
            className="user-card__lock-bg-blur" 
            style={{ backgroundImage: `url(${user.avatar || "/default-avatar.png"})` }} 
          />
          <div className="user-card__lock-content">
            <span className="user-card__lock-icon">🔒</span>
            <h3 className="user-card__lock-title">
                {score > threshold ? "Too Hot!" : "Premium"}
            </h3>
            <p className="user-card__lock-desc">Upgrade to Reveal</p>
          </div>
        </div>
      ) : (
        /* --- حالت باز (طراحی جدید Overlay) --- */
        <>
          {/* 1. عکس پس‌زمینه (کل کارت) */}
          <div className="user-card__image-wrapper">
             <img 
              src={user.avatar || "/default-avatar.png"} 
              alt={user.name} 
              className="user-card__image"
            />
          </div>

          {/* 2. گرادینت محو شونده */}
          <div className="user-card__overlay-gradient"></div>

          {/* 3. محتوا (پایین کارت) */}
          <div className="user-card__content">
            
            <div className="user-card__text-group">
                <h3 className="user-card__name">
                    {user.name}, {calculateAge(user.birthday)}
                    {/* اگر کاربر وریفای شده است تیک آبی بگذار (اختیاری) */}
                    {user.isVerified && <span className="user-card__verified">🔹</span>}
                </h3>
                <span className="user-card__location">
                    📍 {user.location?.city || "Unknown City"}
                </span>
            </div>

            <div className="user-card__actions">
                {/* دکمه اصلی */}
                <button className="user-card__action-btn">
                    View Profile
                </button>

                {/* درصد مچ کنار دکمه */}
                <div className="user-card__match-pill" style={{ borderColor: getMatchColor(score) }}>
                    <span style={{ color: getMatchColor(score) }}>{score}%</span>
                </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default UserCard;