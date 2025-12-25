import React from "react";
import "./PremiumLockCard.css";

const PremiumLockCard = ({ onUnlock }) => {
  return (
    <div className="premium-lock-card">
      <div className="premium-lock-card__icon">💎</div>
      <h3 className="premium-lock-card__title">Premium Discovery</h3>
      <p className="premium-lock-card__description">Your top matches are hidden. Upgrade to Premium to reveal them.</p>
      <button className="premium-lock-card__btn" onClick={onUnlock}>
        Unlock Now
      </button>
    </div>
  );
};

export default PremiumLockCard;