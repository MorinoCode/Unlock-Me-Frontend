import React from "react";
import "./PremiumLockCard.css";

const PremiumLockCard = ({ onUnlock }) => {
  return (
    <div className="premium-lock-container">
      <div className="lock-icon-diamond">💎</div>
      <h3>Premium Discovery</h3>
      <p>Your top matches are hidden. Upgrade to Premium to reveal them.</p>
      <button className="unlock-now-btn" onClick={onUnlock}>
        Unlock Now
      </button>
    </div>
  );
};

export default PremiumLockCard;