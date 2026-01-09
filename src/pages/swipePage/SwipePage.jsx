import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../context/useAuth.js";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import SwipeCard from "../../components/swipeCard/SwipeCard";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import SubscriptionModal from "../../components/modals/subscriptionModal/SubscriptionModal.jsx";
import "./SwipePage.css";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import { useNavigate } from "react-router-dom";
import { ThumbsDown, User, ThumbsUp, Heart, MessageSquareMore } from "lucide-react";
// ✅ 1. Import getDailyDmLimit
import { getSwipeLimit, getSuperLikeLimit, getDailyDmLimit } from "../../utils/subscriptionRules.js";

const SwipePage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const [matchModal, setMatchModal] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [icebreakerUser, setIcebreakerUser] = useState(null);
  
  // Modal State
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  // Ref to block card removal
  const blockRemovalRef = useRef(false);

  const [topIndex, setTopIndex] = useState(-1);
  const topIndexRef = useRef(-1);
  const childRefs = useMemo(
    () =>
      Array(users.length)
        .fill(0)
        .map(() => React.createRef()),
    [users.length]
  );

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { currentUser, setCurrentUser } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    topIndexRef.current = topIndex;
  }, [topIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showUpsell || matchModal || icebreakerUser || showLimitModal) return;
      const idx = topIndexRef.current;
      switch (e.key) {
        case "ArrowLeft": triggerSwipe("left"); break;
        case "ArrowRight": triggerSwipe("right"); break;
        case "ArrowUp": triggerSwipe("up"); break;
        case " ":
          e.preventDefault();
          if (idx >= 0 && idx < users.length) childRefs[idx]?.current?.flip();
          break;
        case "Enter":
          e.preventDefault();
          handleProfileNavigation();
          break;
        default: break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showUpsell, matchModal, icebreakerUser, users, showLimitModal]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/swipe/cards`, {
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
        setTopIndex(data.length - 1);
        topIndexRef.current = data.length - 1;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUsers = sessionStorage.getItem("swipe_restore_users");
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUsers(parsedUsers);
          setTopIndex(parsedUsers.length - 1);
          topIndexRef.current = parsedUsers.length - 1;
          setLoading(false);
          sessionStorage.removeItem("swipe_restore_users");
        } else {
          fetchCards();
        }
      } catch (e) {
        console.error(e);
        fetchCards();
      }
    } else {
      fetchCards();
    }
  }, []);

  // --- Check Swipe/Super Limits ---
  const checkLimits = (direction) => {
    const userPlan = currentUser?.subscription?.plan || "free";
    const usage = currentUser?.usage || {};

    if (direction === "right" || direction === "left") {
        const limit = getSwipeLimit(userPlan);
        const count = usage.swipesCount || 0;
        if (limit !== Infinity && count >= limit) {
            setLimitMessage("You've reached your daily swipe limit!");
            return false;
        }
    }
    
    if (direction === "up") {
        const limit = getSuperLikeLimit(userPlan);
        const count = usage.superLikesCount || 0;
        if (limit !== Infinity && count >= limit) {
            setLimitMessage("You've reached your daily Super Like limit!");
            return false;
        }
    }
    return true;
  };

  const handleSwipe = async (direction, user, index) => {
    // 1. Client-side Check
    if (!checkLimits(direction)) {
        blockRemovalRef.current = true; 
        if (childRefs[index]?.current?.restoreCard) {
            await childRefs[index].current.restoreCard();
        }
        setShowLimitModal(true);
        setTimeout(() => { blockRemovalRef.current = false; }, 1000);
        return;
    }

    setFeedback(direction);
    setTimeout(() => setFeedback(null), 300);

    const userPlan = currentUser?.subscription?.plan || "free";
    const isPositive = direction === "right" || direction === "up";
    
    // Upsell Check
    if (isPositive && user.isPremiumCandidate && userPlan === "free") {
      blockRemovalRef.current = true; 
      if (childRefs[index]?.current?.restoreCard) {
        await childRefs[index].current.restoreCard();
      }
      setShowUpsell(true);
      setTimeout(() => { blockRemovalRef.current = false; }, 1000);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/swipe/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user._id, action: direction }),
        credentials: "include",
      });
      
      // 2. Server-side Error
      if (res.status === 403) {
         blockRemovalRef.current = true; 
         
         const errData = await res.json();
         if (childRefs[index]?.current?.restoreCard) {
             await childRefs[index].current.restoreCard();
         }
         setLimitMessage(errData.message || "Limit reached.");
         setShowLimitModal(true);
         
         setTimeout(() => { blockRemovalRef.current = false; }, 1000);
         return;
      }

      const data = await res.json();
      if (data.isMatch) setMatchModal(data.matchDetails);

      if (data.updatedUsage) {
          setCurrentUser(prev => ({
              ...prev,
              usage: {
                  ...prev.usage,
                  ...data.updatedUsage
              }
          }));
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleCardLeftScreen = (index) => {
    if (blockRemovalRef.current || showLimitModal || showUpsell) {
        return; 
    }

    setUsers((prev) => {
        const next = prev.filter((_, i) => i !== index);
        const newTop = next.length - 1;
        setTopIndex(newTop);
        topIndexRef.current = newTop;
        return next;
    });
  };

  const triggerSwipe = async (dir) => {
    const idx = topIndexRef.current;
    if (idx >= 0 && idx < users.length) {
      if (!checkLimits(dir)) {
          blockRemovalRef.current = true;
          setShowLimitModal(true);
          setTimeout(() => { blockRemovalRef.current = false; }, 500);
          return;
      }
      if (childRefs[idx]?.current?.swipe)
        await childRefs[idx].current.swipe(dir);
    }
  };

  const handleProfileNavigation = () => {
    const idx = topIndexRef.current;
    if (idx >= 0 && idx < users.length) {
      const currentUser = users[idx];
      sessionStorage.setItem("swipe_restore_users", JSON.stringify(users));
      navigate(`/user-profile/${currentUser._id}`);
    }
  };

  // ✅ 2. Updated Chat Click Handler (Locked for Limits)
  const handleChatClick = () => {
    const idx = topIndexRef.current;
    if (idx >= 0 && idx < users.length) {
      
      // -- Check DM Limits Here --
      const userPlan = currentUser?.subscription?.plan || "free";
      const dmLimit = getDailyDmLimit(userPlan);
      const dmUsage = currentUser?.usage?.directMessagesCount || 0;

      // الف) اگر کلا اجازه ندارد (Free)
      if (dmLimit === 0) {
          setLimitMessage("Free users cannot send direct messages. Upgrade to chat!");
          setShowLimitModal(true);
          return;
      }

      // ب) اگر لیمیت روزانه پر شده (Gold)
      if (dmLimit !== Infinity && dmUsage >= dmLimit) {
          setLimitMessage("You've reached your daily Direct Message limit!");
          setShowLimitModal(true);
          return;
      }

      // اگر مجاز بود، ادامه بده
      setIcebreakerUser(users[idx]);
    }
  };

  const proceedToChat = () => {
    if (icebreakerUser) {
      navigate(`/chat/${icebreakerUser._id}`);
    }
  };

  if (loading) return <HeartbeatLoader />;

  return (
    <ExploreBackgroundLayout>
      <div className="swipe-page">
        <div className="swipe-page__container">
          {users.map((user, index) => (
            <SwipeCard
              ref={childRefs[index]}
              key={user._id}
              user={user}
              index={index}
              actionFeedback={index === topIndex ? feedback : null}
              onSwipe={(dir) => handleSwipe(dir, user, index)}
              onCardLeftScreen={(idx) => handleCardLeftScreen(idx)}
            />
          ))}

          {users.length === 0 && !loading && (
            <div className="swipe-page__empty-state">
              <h2>That's everyone!</h2>
              <button onClick={fetchCards} className="swipe-page__refresh-btn">
                Refresh
              </button>
            </div>
          )}
        </div>

        <div className="swipe-page__controls">
          <button className="swipe-page__control-btn swipe-page__btn--nope" onClick={() => triggerSwipe("left")}>
            <ThumbsDown size={40} />
          </button>
          <button className="swipe-page__control-btn swipe-page__btn--super" onClick={() => triggerSwipe("up")}>
            <Heart size={50} />
          </button>
          <button className="swipe-page__control-btn swipe-page__btn--profile" onClick={handleProfileNavigation}>
            <User size={50}/>
          </button>
          {/* دکمه چت به تابع جدید وصل شد */}
          <button className="swipe-page__control-btn swipe-page__btn--chat" onClick={handleChatClick}>
            <MessageSquareMore size={45} />
          </button>
          <button className="swipe-page__control-btn swipe-page__btn--like" onClick={() => triggerSwipe("right")}>
            <ThumbsUp size={40}/>
          </button>
        </div>

        <div className="swipe-page__keyboard-help">
          <div className="swipe-page__key-item"><span className="swipe-page__key-box">←</span> Nope</div>
          <div className="swipe-page__key-item"><span className="swipe-page__key-box">↑</span> Super</div>
          <div className="swipe-page__key-item"><span className="swipe-page__key-box">Enter</span> Profile</div>
          <div className="swipe-page__key-item"><span className="swipe-page__key-box">→</span> Like</div>
        </div>

        {icebreakerUser && (
            <div className="swipe-page__modal-overlay">
                <div className="swipe-page__modal swipe-page__modal--icebreaker">
                <h3>🧊 Icebreaker</h3>
                <p>"{icebreakerUser.icebreaker || `Ask about ${icebreakerUser.name}'s bio!`}"</p>
                <div className="swipe-page__modal-actions">
                    <button className="swipe-page__btn-cancel" onClick={() => setIcebreakerUser(null)}>Cancel</button>
                    <button className="swipe-page__btn-proceed" onClick={proceedToChat}>Start Chat</button>
                </div>
                </div>
            </div>
        )}

        {showUpsell && (
             <div className="swipe-page__modal-overlay">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <PromoBanner
                    title="Premium Match! 💎"
                    desc="Upgrade to Gold to match instantly with this top-tier profile."
                    btnText="Upgrade Now"
                    onClick={() => { window.location.href = "/upgrade"; }}
                    onClose={() => setShowUpsell(false)}
                />
                <button className="swipe-page__modal-close-text" onClick={() => setShowUpsell(false)}>Maybe later</button>
                </div>
            </div>
        )}

        {matchModal && (
            <div className="swipe-page__modal-overlay">
                <div className="swipe-page__modal swipe-page__modal--match">
                <h1>It's a Match! 🎉</h1>
                <p>You matched with {matchModal.name}</p>
                <button onClick={() => setMatchModal(null)}>Keep Swiping</button>
                </div>
            </div>
        )}

        {showLimitModal && (
            <SubscriptionModal 
                onClose={() => setShowLimitModal(false)}
                message={limitMessage}
            />
        )}

      </div>
    </ExploreBackgroundLayout>
  );
};

export default SwipePage;