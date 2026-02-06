import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import SubscriptionModal from "../../components/modals/subscriptionModal/SubscriptionModal";
import { getSwipeLimit } from "../../utils/subscriptionRules"; 
import "./UserCard.css";

const UserCard = ({ user }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // وضعیت قفل بودن از سمت سرور می‌آید
  const isLocked = user.isLocked || false; 
  const score = user.matchScore || 0;

  const [liked, setLiked] = useState(() => {
    return currentUser?.likedUsers?.includes(user._id) || false;
  });
  
  const [isLiking, setIsLiking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    setLiked(currentUser?.likedUsers?.includes(user._id) || false);
  }, [currentUser, user._id]);

  const age = user.birthday?.year ? new Date().getFullYear() - parseInt(user.birthday.year) : "";

  // چک کردن محدودیت لایک در سمت کلاینت
  const checkLikeLimit = () => {
    const userPlan = currentUser?.subscription?.plan || "free";
    const limit = getSwipeLimit(userPlan);
    const usage = currentUser?.usage?.swipesCount || 0;
    return limit !== Infinity && usage >= limit;
  };

  // هندلر کلیک روی کارت
  const handleCardClick = () => {
    if (isLocked) {
        setModalMessage(`This user is a ${score}% match! Upgrade to unlock high matches.`);
        setShowModal(true); 
    } else {
        navigate(`/user-profile/${user._id}`);
    }
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    
    // اگر قفل است -> باز کردن مودال
    if (isLocked) {
        setModalMessage("Upgrade to unlock and like high matches!");
        setShowModal(true);
        return;
    }

    // اگر محدودیت لایک پر شده -> باز کردن مودال
    if (!liked && checkLikeLimit()) {
        setModalMessage("You've reached your daily like limit! Upgrade to swipe more.");
        setShowModal(true);
        return;
    }

    if (isLiking) return;

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

  const getMatchColor = (s) => {
    if (s >= 80) return "#10b981"; 
    if (s >= 60) return "#f59e0b"; 
    return "#94a3b8"; 
  };

  return (
    <>
      <div 
        className={`user-card ${isLocked ? "user-card--locked" : ""}`} 
        onClick={handleCardClick}
      >
        
        {/* دکمه لایک فقط وقتی باز است نشان داده شود */}
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

        <div className="user-card__image-wrapper">
           <img 
            src={user.avatar || "/default-avatar.png"} 
            alt={user.name} 
            className={`user-card__image ${isLocked ? "user-card__image--blur" : ""}`}
            loading="lazy" 
          />
          
          {/* لایه بلور و قفل */}
          {isLocked && (
            <div className="user-card__blur-overlay">
                <div className="user-card__lock-icon-bg">
                    🔒
                </div>
            </div>
          )}
          
          {/* گرادینت پایین */}
          <div className="user-card__overlay-gradient"></div>
        </div>

        <div className="user-card__content">
            <div className="user-card__text-group">
                <h3 className="user-card__name">
                    {/* اگر قفل بود بنویس Hidden User */}
                    {isLocked ? "Locked User" : `${user.name}, ${age}`}
                    {!isLocked && user.isVerified && <span className="user-card__verified">🔹</span>}
                </h3>
                <span className="user-card__location">
                    📍 {user.location?.city || "Nearby"}
                </span>
            </div>

            {/* اگر قفل بود دکمه‌ها را نشان نده */}
            {!isLocked ? (
                <div className="user-card__actions">
                    <button className="user-card__action-btn">
                        View Profile
                    </button>
                    <div className="user-card__match-pill" style={{ borderColor: getMatchColor(score) }}>
                        <span style={{ color: getMatchColor(score) }}>{score}%</span>
                    </div>
                </div>
            ) : (
                <div className="user-card__actions">
                    <button className="user-card__action-btn user-card__action-btn--unlock">
                        Unlock Match
                    </button>
                </div>
            )}
        </div>
      </div>

      {showModal && (
        <SubscriptionModal 
            onClose={() => setShowModal(false)} 
            message={modalMessage}
        />
      )}
    </>
  );
};

export default UserCard;