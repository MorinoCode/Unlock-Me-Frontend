import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AIInsightSection from "../../components/aiInsightSection/AIInsightSection";
import HeartBeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import { useAuth } from "../../context/useAuth.js";
import { getDailyDmLimit } from "../../utils/subscriptionRules.js"; // ✅ 1. Import Rules
import SubscriptionModal from "../../components/modals/subscriptionModal/SubscriptionModal.jsx";
import "./UserDetailPage.css";
import { FaLock } from "react-icons/fa6";

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 2. State for Subscription Modal
  const [showSubModal, setShowSubModal] = useState(false);

  const [isLiked, setIsLiked] = useState(() => {
    return currentUser?.likedUsers?.includes(userId) || false;
  });

  const [isDisliked, setIsDisliked] = useState(() => {
    return currentUser?.dislikedUsers?.includes(userId) || false;
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // --- ✅ 3. LOGIC: Check DM Limits ---
  const checkDmLimit = () => {
    const userPlan = currentUser?.subscription?.plan || "free";
    const dailyLimit = getDailyDmLimit(userPlan); // طبق فایل شما: Free=0, Gold=5, Plat=10
    const messagesSentToday = currentUser?.usage?.directMessagesCount || 0;

    // اگر لیمیت بی‌نهایت است (Infinity) یا هنوز نرسیده، فالس برمی‌گرداند
    // نکته: اگر لیمیت 0 باشد، همیشه True می‌شود (یعنی قفل است)
    const hasReachedLimit =
      messagesSentToday >= dailyLimit && dailyLimit !== Infinity;

    return hasReachedLimit;
  };

  const handleChatClick = () => {
    // اگر کاربر بلاک شده باشد یا لیمیت پر کرده باشد
    if (checkDmLimit()) {
      // باز کردن مدال
      setShowSubModal(true);
    } else {
      // هدایت به چت
      navigate(`/chat/${userId}`);
    }
  };
  // -------------------------------------

  useEffect(() => {
    if (currentUser) {
      setIsLiked(currentUser.likedUsers?.includes(userId) || false);
      setIsDisliked(currentUser.dislikedUsers?.includes(userId) || false);
    }
  }, [currentUser, userId]);

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId, API_URL]);

  const handleToggleAction = async (type) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const isRemoving = type === "like" ? isLiked : isDisliked;
    const endpoint =
      type === "like"
        ? isRemoving
          ? "/api/user/unlike"
          : "/api/user/like"
        : isRemoving
        ? "/api/user/undislike"
        : "/api/user/dislike";

    try {
      if (type === "like") {
        setIsLiked(!isLiked);
        if (!isLiked) setIsDisliked(false);
      } else {
        setIsDisliked(!isDisliked);
        if (!isDisliked) setIsLiked(false);
      }

      await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
        credentials: "include",
      });
    } catch (err) {
      console.error(`${type} toggle failed:`, err);
      if (type === "like") setIsLiked(isRemoving);
      else setIsDisliked(isRemoving);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <HeartBeatLoader />;
  if (!user) return <div className="user-detail-error">Profile not found.</div>;

  const age = user.birthday?.year
    ? new Date().getFullYear() - parseInt(user.birthday.year)
    : "N/A";

  const getMatchModifier = (score) => {
    if (score >= 80) return "high";
    if (score >= 60) return "mid";
    return "low";
  };

  return (
    <div className="user-profile">
      <button className="user-profile__close-btn" onClick={() => navigate(-1)}>
        ✕
      </button>

      <div className="user-profile__hero">
        <div className="user-profile__avatar-container">
          <img
            className="user-profile__avatar-img"
            src={user.avatar || "../../assets/default-avatar.png"}
            alt={user.name}
          />

          <div
            className={`user-match-badge user-match-badge--${getMatchModifier(
              user.matchScore || 0
            )}`}
          >
            <span className="user-match-badge__percent">
              {user.matchScore || 0}%
            </span>
            <span className="user-match-badge__label">MATCH</span>
          </div>
        </div>

        <div className="user-profile__header-info">
          <h1 className="user-profile__name">
            {user.name}, {age}
          </h1>
          <p className="user-profile__location">
            📍 {user.location?.city}, {user.location?.country}
          </p>
          <div className="user-profile__gender-tags">
            <span className="user-profile__gender-pill">{user.gender}</span>
          </div>
        </div>
      </div>

      <div className="user-profile__scroll-container">
        <section className="user-detail-card">
          <h3 className="user-detail-card__title">Gallery</h3>
          <div className="user-gallery">
            {user.gallery?.length > 0 ? (
              user.gallery.map((img, i) => (
                <div key={i} className="user-gallery__item">
                  <img src={img} alt="" className="user-gallery__image" />
                </div>
              ))
            ) : (
              <div className="user-gallery__empty">No photos shared yet.</div>
            )}
          </div>
        </section>

        <div className="user-profile__info-grid">
          <section className="user-detail-card">
            <h3 className="user-detail-card__title">Bio</h3>
            <p className="user-detail-card__bio-text">
              {user.bio || "No biography available."}
            </p>
          </section>
          <section className="user-detail-card user-detail-card--looking-for">
            <h3 className="user-detail-card__title user-detail-card__title--inline">
              Looking For :
            </h3>
            <div className="user-detail-card__pill">
              <p className="user-detail-card__pill-text">
                {user.lookingFor?.toUpperCase() ||
                  "Seeking a genuine connection."}
              </p>
            </div>
          </section>
        </div>

        <AIInsightSection user={user} />

        <section className="user-detail-card">
          <h3 className="user-detail-card__title">Interests & Common Ground</h3>
          <div className="user-interests">
            {user.interests?.map((item, i) => (
              <span
                key={i}
                className="user-interests__tag user-interests__tag--modern"
              >
                <span className="user-interests__icon">★</span> {item}
              </span>
            ))}
            {user.commonCategories?.map((cat, i) => (
              <span
                key={`common-${i}`}
                className="user-interests__tag user-interests__tag--common"
              >
                <span className="user-interests__icon">✔</span> {cat}
              </span>
            ))}
          </div>
        </section>
      </div>

      <footer className="user-actions">
        <button
          className={`user-actions__btn user-actions__btn--dislike ${
            isDisliked ? "user-actions__btn--dislike-active" : ""
          }`}
          onClick={() => handleToggleAction("dislike")}
          disabled={isProcessing}
        >
          {isDisliked ? "👎" : "👎🏻"}
        </button>

        {/* ✅ 4. Updated Button with new Handler */}
        <button className="user-actions__chat-btn" onClick={handleChatClick}>
          Send Message
          {checkDmLimit() && (
            <span style={{ fontSize: "0.7em", marginLeft: "5px" }}>
              {" "}
              <FaLock />
            </span>
          )}
        </button>

        <button
          className={`user-actions__btn user-actions__btn--like ${
            isLiked ? "user-actions__btn--like-active" : ""
          }`}
          onClick={() => handleToggleAction("like")}
          disabled={isProcessing}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>
      </footer>

      {/* ✅ 5. Render Modal */}
      {showSubModal && (
        <SubscriptionModal
          onClose={() => setShowSubModal(false)}
          message="You've reached your daily direct message limit! Upgrade to chat more."
        />
      )}
    </div>
  );
};

export default UserDetailPage;
