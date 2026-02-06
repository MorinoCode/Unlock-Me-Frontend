import React, { useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import "./PremiumLockCard.css";

/**
 * feature: 'soulmates' | 'visibility' | 'general'
 * – soulmates: section locked for free (upgrade to Gold+ to see Soulmates)
 * – visibility: high matches hidden (upgrade to see above threshold)
 * – general: generic premium discovery
 */
const FEATURES = {
  SOULMATES: "soulmates",
  VISIBILITY: "visibility",
  GENERAL: "general",
};

const COPY = {
  soulmates: {
    icon: "💎",
    title: "Soulmates Are Premium",
    description:
      "Your top 90%+ matches are hidden. Upgrade to Gold or higher to reveal your Soulmates and see who likes you back.",
    cta: "View Plans",
  },
  visibility: {
    icon: "🔒",
    title: "Unlock Higher Matches",
    description:
      "See profiles above your visibility limit. Upgrade to Gold (80%), Platinum (90%), or Diamond (100%) to reveal them.",
    cta: "Upgrade Now",
  },
  general: {
    icon: "💎",
    title: "Premium Discovery",
    description:
      "Your top matches are hidden. Upgrade to Premium to reveal them.",
    cta: "Unlock Now",
  },
};

const PremiumLockCard = ({ onUnlock, feature: featureProp }) => {
  const navigate = useNavigate();
  const feature = useMemo(() => {
    if (featureProp && Object.values(FEATURES).includes(featureProp))
      return featureProp;
    return FEATURES.GENERAL;
  }, [featureProp]);

  const data = useMemo(() => COPY[feature] || COPY.general, [feature]);

  const handleUnlock = useCallback(() => {
    if (typeof onUnlock === "function") {
      onUnlock();
    } else {
      navigate("/upgrade");
    }
  }, [onUnlock, navigate]);

  return (
    <div
      className="premium-lock-card"
      role="region"
      aria-labelledby="premium-lock-title"
      aria-describedby="premium-lock-desc"
    >
      <div className="premium-lock-card__icon" aria-hidden="true">
        {data.icon}
      </div>
      <h3 id="premium-lock-title" className="premium-lock-card__title">
        {data.title}
      </h3>
      <p id="premium-lock-desc" className="premium-lock-card__description">
        {data.description}
      </p>
      <button
        type="button"
        className="premium-lock-card__btn"
        onClick={handleUnlock}
        aria-label={data.cta}
      >
        {data.cta}
      </button>
    </div>
  );
};

export default memo(PremiumLockCard);
export { FEATURES };
