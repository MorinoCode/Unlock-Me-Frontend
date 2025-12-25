import React from "react";
import UserCard from "../userCard/UserCard"; 
import "./SoulmatesSection.css";

const SoulmatesSection = ({ exactMatches, userPlan, onUpgrade }) => {
  const displayLimit = userPlan === "platinum" ? 99 : 5;

  return (
    <section className="soulmates-section">
      <div className="soulmates-section__header">
        <div className="soulmates-section__title-group">
          <h2 className="soulmates-section__title">The Soulmates</h2>
          <p className="soulmates-section__subtitle">Highest compatibility scores (80%+)</p>
        </div>
      </div>
      
      {userPlan === "free" ? (
        <div className="soulmates-section__locked-card" onClick={onUpgrade}>
          <div className="soulmates-section__lock-glow"></div>
          <span className="soulmates-section__lock-icon">💎</span>
          <h3 className="soulmates-section__locked-title">Platinum Discovery</h3>
          <p className="soulmates-section__locked-desc">Your top matches are hidden. Upgrade to Platinum to reveal them.</p>
          <button className="soulmates-section__unlock-btn">Unlock Now</button>
        </div>
      ) : (
        <div className="soulmates-section__list">
          {exactMatches.slice(0, displayLimit).map(match => (
            <UserCard 
              key={match._id} 
              user={match} 
              isLocked={false} 
              userPlan={userPlan} 
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default SoulmatesSection;