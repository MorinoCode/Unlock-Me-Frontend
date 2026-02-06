import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth.js";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import SwipeCard from "../../components/swipeCard/SwipeCard";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import SubscriptionModal from "../../components/modals/subscriptionModal/SubscriptionModal.jsx";
import "./SwipePage.css";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import { useNavigate } from "react-router-dom";
import {
  ThumbsDown,
  User,
  ThumbsUp,
  Heart,
  MessageSquareMore,
} from "lucide-react";
import {
  getSwipeLimit,
  getSuperLikeLimit,
  getDailyDmLimit,
} from "../../utils/subscriptionRules.js";
import {
  useSwipeStore,
  SWIPE_BACKGROUND_REFRESH_MS,
} from "../../store/swipeStore";

const REQUEST_TIMEOUT_MS = 28000;

const SwipePage = () => {
  const { t } = useTranslation();
  const cards = useSwipeStore((s) => s.cards);
  const loading = useSwipeStore((s) => s.loading);
  const fetchCards = useSwipeStore((s) => s.fetchCards);
  const removeCard = useSwipeStore((s) => s.removeCard);
  const isCacheValid = useSwipeStore((s) => s.isCacheValid);
  const setLoading = useSwipeStore((s) => s.setLoading);
  const setError = useSwipeStore((s) => s.setError);

  const [showUpsell, setShowUpsell] = useState(false);
  const [matchModal, setMatchModal] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [icebreakerUser, setIcebreakerUser] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  const blockRemovalRef = useRef(false);
  const abortRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const topIndex = cards.length - 1;
  const topIndexRef = useRef(-1);

  const childRefs = useMemo(
    () =>
      Array(cards.length)
        .fill(0)
        .map(() => React.createRef()),
    [cards.length]
  );

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const userId = currentUser?._id || currentUser?.userId;

  useEffect(() => {
    topIndexRef.current = topIndex;
  }, [topIndex]);

  const checkLimits = useCallback(
    (direction) => {
      const userPlan = currentUser?.subscription?.plan || "free";
      const usage = currentUser?.usage || {};

      if (direction === "right" || direction === "left") {
        const limit = getSwipeLimit(userPlan);
        const count = usage.swipesCount || 0;
        if (limit !== Infinity && count >= limit) {
          setLimitMessage(t("swipe.limitSwipe"));
          return false;
        }
      }

      if (direction === "up") {
        const limit = getSuperLikeLimit(userPlan);
        const count = usage.superLikesCount || 0;
        if (limit !== Infinity && count >= limit) {
          setLimitMessage(t("swipe.limitSuperLike"));
          return false;
        }
      }
      return true;
    },
    [currentUser, t]
  );

  const handleSwipe = useCallback(
    async (direction, user, index) => {
      // 1. Client Check
      if (!checkLimits(direction)) {
        blockRemovalRef.current = true;
        if (childRefs[index]?.current?.restoreCard) {
          await childRefs[index].current.restoreCard();
        }
        setShowLimitModal(true);
        setTimeout(() => {
          blockRemovalRef.current = false;
        }, 1000);
        return;
      }

      setFeedback(direction);
      setTimeout(() => setFeedback(null), 300);

      const userPlan = currentUser?.subscription?.plan || "free";
      const isPositive = direction === "right" || direction === "up";

      if (isPositive && user.isPremiumCandidate && userPlan === "free") {
        blockRemovalRef.current = true;
        if (childRefs[index]?.current?.restoreCard) {
          await childRefs[index].current.restoreCard();
        }
        setShowUpsell(true);
        setTimeout(() => {
          blockRemovalRef.current = false;
        }, 1000);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/swipe/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: user._id, action: direction }),
          credentials: "include",
        });

        // 2. Server Error
        if (res.status === 403) {
          blockRemovalRef.current = true;
          const errData = await res.json();
          if (childRefs[index]?.current?.restoreCard) {
            await childRefs[index].current.restoreCard();
          }
          setLimitMessage(errData.message || t("swipe.limitReached"));
          setShowLimitModal(true);
          setTimeout(() => {
            blockRemovalRef.current = false;
          }, 1000);
          return;
        }

        const data = await res.json();
        if (data.isMatch) setMatchModal(data.matchDetails);

        if (data.updatedUsage) {
          setCurrentUser((prev) => ({
            ...prev,
            usage: { ...prev.usage, ...data.updatedUsage },
          }));
        }
      } catch (err) {
        console.error(err);
      }
    },
    [API_URL, checkLimits, childRefs, currentUser, setCurrentUser]
  );

  const triggerSwipe = useCallback(
    async (dir) => {
      const idx = topIndexRef.current;
      if (idx >= 0 && idx < cards.length) {
        if (!checkLimits(dir)) {
          blockRemovalRef.current = true;
          setShowLimitModal(true);
          setTimeout(() => {
            blockRemovalRef.current = false;
          }, 500);
          return;
        }
        if (childRefs[idx]?.current?.swipe)
          await childRefs[idx].current.swipe(dir);
      }
    },
    [checkLimits, childRefs, cards.length]
  );

  const handleProfileNavigation = useCallback(() => {
    const idx = topIndexRef.current;
    if (idx >= 0 && idx < cards.length) {
      const user = cards[idx];
      navigate(`/user-profile/${user._id}`);
    }
  }, [cards, navigate]);

  const handleCardLeftScreen = useCallback(
    (index) => {
      if (blockRemovalRef.current || showLimitModal || showUpsell) {
        return;
      }
      removeCard(index);
    },
    [showLimitModal, showUpsell, removeCard]
  );

  const handleChatClick = useCallback(() => {
    const idx = topIndexRef.current;
    if (idx >= 0 && idx < cards.length) {
      const userPlan = currentUser?.subscription?.plan || "free";
      const dmLimit = getDailyDmLimit(userPlan);
      const dmUsage = currentUser?.usage?.directMessagesCount || 0;

      if (dmLimit === 0) {
        setLimitMessage(t("swipe.limitDmFree"));
        setShowLimitModal(true);
        return;
      }

      if (dmLimit !== Infinity && dmUsage >= dmLimit) {
        setLimitMessage(t("swipe.limitDmDaily"));
        setShowLimitModal(true);
        return;
      }

      setIcebreakerUser(cards[idx]);
    }
  }, [currentUser, cards, t]);

  // --- Effects: load from cache or fetch, then background refresh ---

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const valid = isCacheValid(userId);

    if (valid) {
      setLoading(false);
      setError(null);
      abortRef.current = new AbortController();
      fetchCards(API_URL, userId, true, abortRef.current.signal);
    } else {
      setLoading(true);
      setError(null);
      abortRef.current = new AbortController();
      timeoutRef.current = setTimeout(() => {
        if (abortRef.current) {
          abortRef.current.abort();
          setLoading(false);
        }
      }, REQUEST_TIMEOUT_MS);
      fetchCards(API_URL, userId, false, abortRef.current.signal).finally(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      });
    }

    intervalRef.current = setInterval(() => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      fetchCards(API_URL, userId, true, abortRef.current.signal);
    }, SWIPE_BACKGROUND_REFRESH_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [userId, API_URL, isCacheValid, fetchCards, setLoading, setError]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showUpsell || matchModal || icebreakerUser || showLimitModal) return;
      const idx = topIndexRef.current;
      switch (e.key) {
        case "ArrowLeft":
          triggerSwipe("left");
          break;
        case "ArrowRight":
          triggerSwipe("right");
          break;
        case "ArrowUp":
          triggerSwipe("up");
          break;
        case " ":
          e.preventDefault();
          if (idx >= 0 && idx < cards.length) childRefs[idx]?.current?.flip();
          break;
        case "Enter":
          e.preventDefault();
          handleProfileNavigation();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showUpsell,
    matchModal,
    icebreakerUser,
    cards.length,
    showLimitModal,
    triggerSwipe,
    handleProfileNavigation,
    childRefs,
  ]);

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
          {cards.map((user, index) => (
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

          {cards.length === 0 && !loading && (
            <div className="swipe-page__empty-state">
              <h2>{t("swipe.emptyTitle")}</h2>
              <button
                onClick={() => fetchCards(API_URL, userId, false)}
                className="swipe-page__refresh-btn"
              >
                {t("swipe.refresh")}
              </button>
            </div>
          )}
        </div>

        <div className="swipe-page__controls">
          <button
            className="swipe-page__control-btn swipe-page__btn--nope"
            onClick={() => triggerSwipe("left")}
          >
            <ThumbsDown size={40} />
          </button>
          <button
            className="swipe-page__control-btn swipe-page__btn--super"
            onClick={() => triggerSwipe("up")}
          >
            <Heart size={50} />
          </button>
          <button
            className="swipe-page__control-btn swipe-page__btn--profile"
            onClick={handleProfileNavigation}
          >
            <User size={50} />
          </button>
          <button
            className="swipe-page__control-btn swipe-page__btn--chat"
            onClick={handleChatClick}
          >
            <MessageSquareMore size={45} />
          </button>
          <button
            className="swipe-page__control-btn swipe-page__btn--like"
            onClick={() => triggerSwipe("right")}
          >
            <ThumbsUp size={40} />
          </button>
        </div>
        {/* ... Keyboard Help ... */}
        <div className="swipe-page__keyboard-help">
          <div className="swipe-page__key-item">
            <span className="swipe-page__key-box">←</span> {t("swipe.keyNope")}
          </div>
          <div className="swipe-page__key-item">
            <span className="swipe-page__key-box">↑</span> {t("swipe.keySuper")}
          </div>
          <div className="swipe-page__key-item">
            <span className="swipe-page__key-box">Enter</span>{" "}
            {t("swipe.keyProfile")}
          </div>
          <div className="swipe-page__key-item">
            <span className="swipe-page__key-box">→</span> {t("swipe.keyLike")}
          </div>
        </div>

        {icebreakerUser && (
          <div className="swipe-page__modal-overlay">
            <div className="swipe-page__modal swipe-page__modal--icebreaker">
              <h3>{t("swipe.icebreakerTitle")}</h3>
              <p>
                "
                {icebreakerUser.icebreaker ||
                  t("swipe.icebreakerFallback", { name: icebreakerUser.name })}
                "
              </p>
              <div className="swipe-page__modal-actions">
                <button
                  className="swipe-page__btn-cancel"
                  onClick={() => setIcebreakerUser(null)}
                >
                  {t("swipe.cancel")}
                </button>
                <button
                  className="swipe-page__btn-proceed"
                  onClick={proceedToChat}
                >
                  {t("swipe.startChat")}
                </button>
              </div>
            </div>
          </div>
        )}

        {showUpsell && (
          <div className="swipe-page__modal-overlay">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <PromoBanner
                title={t("swipe.premiumMatchTitle")}
                desc={t("swipe.premiumMatchDesc")}
                btnText={t("swipe.upgradeNow")}
                onClick={() => {
                  window.location.href = "/upgrade";
                }}
                onClose={() => setShowUpsell(false)}
              />
              <button
                className="swipe-page__modal-close-text"
                onClick={() => setShowUpsell(false)}
              >
                {t("swipe.maybeLater")}
              </button>
            </div>
          </div>
        )}

        {matchModal && (
          <div className="swipe-page__modal-overlay">
            <div className="swipe-page__modal swipe-page__modal--match">
              <h1>{t("swipe.matchTitle")}</h1>
              <p>{t("swipe.matchWith", { name: matchModal.name })}</p>
              <button onClick={() => setMatchModal(null)}>
                {t("swipe.keepSwiping")}
              </button>
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
