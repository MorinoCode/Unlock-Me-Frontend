import React from "react";
import { useNavigate } from "react-router-dom";
import "./UserCard.css";

const UserCard = ({ user, isLocked, userPlan }) => {
  const navigate = useNavigate();

  // Handle click on card
  const handleCardClick = () => {
    if (isLocked) {
      navigate("/upgrade");
    } else {
      // Navigate to the specific user's detail page
      navigate(`/user-profile/${user._id}`);
    }
  };

  const calculateAge = (birthday) => {
    if (!birthday || !birthday.year) return "";
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthday.year);
  };

  return (
    <div 
      className={`user-card-component ${isLocked ? "is-locked" : ""}`} 
      onClick={handleCardClick}
    >
      {isLocked ? (
        <div className="card-lock-overlay">
          <span className="lock-icon">🔒</span>
          <p>Unlock with {userPlan === "free" ? "Premium" : "Gold"}</p>
        </div>
      ) : (
        <div className="card-inner-content">
          <div className="image-container">
            <img src={user.avatar || "/default-avatar.png"} alt={user.name} />
            <div className={`score-badge ${user.matchScore >= 80 ? "high-match" : ""}`}>
              {user.matchScore}% Match
            </div>
          </div>
          <div className="user-details">
            <h3>{user.name}, {calculateAge(user.birthday)}</h3>
            <p className="location-text">📍 {user.location?.city}</p>
            <div className="tags-preview">
              {user.interests?.slice(0, 2).map((tag, i) => (
                <span key={i} className="mini-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;