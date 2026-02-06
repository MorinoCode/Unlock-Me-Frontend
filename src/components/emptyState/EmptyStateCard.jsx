import React, { useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { PLANS, getSoulmatePermissions } from "../../utils/subscriptionRules";
import "./EmptyStateCard.css";

/** Empty state types aligned with Explore sections and subscription rules */
const EMPTY_TYPES = {
  soulmates: "soulmates",
  cityMatches: "cityMatches",
  interestMatches: "interestMatches",
  freshFaces: "freshFaces",
  default: "default",
};

const CONTENT = {
  soulmates: {
    emoji: "💎",
    title: "No Soulmates Yet",
    desc: "True love is rare. Upgrade to Gold or higher to see your top 90%+ matches, or invite friends to join.",
    btnText: "Invite Friends",
    shareText: "Join me on Unlock Me to find our soulmates! 💎",
    upgradeCta: "View Plans",
  },
  cityMatches: {
    emoji: "🏙️",
    title: "Quiet in Your City",
    desc: "Be the trendsetter. Share the app with people in your city and fill this space with matches.",
    btnText: "Share with Locals",
    shareText: "Join Unlock Me and let's meet new people in our city! 🏙️",
  },
  interestMatches: {
    emoji: "🎨",
    title: "Unique Vibe",
    desc: "Your interests are special. Share the app to find your tribe.",
    btnText: "Invite Your Tribe",
    shareText: "I'm using Unlock Me to find people with cool interests. 🎨",
  },
  freshFaces: {
    emoji: "✨",
    title: "Fresh Faces Coming Soon",
    desc: "New members join every day. Check back later or share the app to grow the community.",
    btnText: "Share App",
    shareText: "Check out Unlock Me! ✨",
  },
  default: {
    emoji: "🌍",
    title: "Expand the Circle",
    desc: "More users mean more matches. Help grow the community.",
    btnText: "Spread the Word",
    shareText: "Check out Unlock Me! 🌍",
  },
};

const EmptyStateCard = ({ type, userPlan }) => {
  const navigate = useNavigate();
  const normalizedType = EMPTY_TYPES[type] || EMPTY_TYPES.default;
  const data = useMemo(
    () => CONTENT[normalizedType] || CONTENT.default,
    [normalizedType]
  );
  const isFullWidth = normalizedType === "cityMatches";

  const soulmateLocked = useMemo(() => {
    if (normalizedType !== "soulmates") return false;
    const { isLocked } = getSoulmatePermissions(userPlan || PLANS.FREE);
    return isLocked;
  }, [normalizedType, userPlan]);

  const handleShare = useCallback(async () => {
    const sharePayload = {
      title: "Unlock Me",
      text: data.shareText,
      url: window.location.origin,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(sharePayload);
      } catch (err) {
        if (err.name !== "AbortError") copyLinkFallback();
      }
    } else {
      copyLinkFallback();
    }
  }, [data.shareText]);

  const copyLinkFallback = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.origin).then(() => {
        if (typeof document !== "undefined" && document.body) {
          const el = document.createElement("div");
          el.setAttribute("role", "status");
          el.className = "empty-state-card__toast";
          el.textContent = "Link copied to clipboard";
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 2500);
        }
      });
    }
  }, []);

  const handleUpgrade = useCallback(() => {
    navigate("/upgrade");
  }, [navigate]);

  return (
    <div
      className={`empty-state-card ${
        isFullWidth ? "empty-state-card--full-width" : ""
      }`}
      role="status"
      aria-label={data.title}
    >
      <div className="empty-state-card__icon-circle" aria-hidden="true">
        <span className="empty-state-card__emoji">{data.emoji}</span>
      </div>
      <h3 className="empty-state-card__title">{data.title}</h3>
      <p className="empty-state-card__desc">{data.desc}</p>
      <div className="empty-state-card__actions">
        {soulmateLocked && data.upgradeCta && (
          <button
            type="button"
            className="empty-state-card__btn empty-state-card__btn--primary"
            onClick={handleUpgrade}
            aria-label={data.upgradeCta}
          >
            {data.upgradeCta}
          </button>
        )}
        <button
          type="button"
          className={`empty-state-card__btn ${
            soulmateLocked
              ? "empty-state-card__btn--secondary"
              : "empty-state-card__btn--primary"
          }`}
          onClick={handleShare}
          aria-label={data.btnText}
        >
          {data.btnText}
        </button>
      </div>
    </div>
  );
};

export default memo(EmptyStateCard);
export { EMPTY_TYPES };
