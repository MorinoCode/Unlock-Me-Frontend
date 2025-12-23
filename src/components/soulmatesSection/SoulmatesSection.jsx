import React from "react";
import UserCard from "../userCard/UserCard"; 

const SoulmatesSection = ({ exactMatches, userPlan, onUpgrade }) => {
  const displayLimit = userPlan === "platinum" ? 99 : 5;

  return (
    <section className="explore-section soulmates-container">
      <div className="section-info">
        <div className="title-area">
          <h2>The Soulmates</h2>
          <p className="subtitle">Highest compatibility scores (80%+)</p>
        </div>
      </div>
      
      {userPlan === "free" ? (
        <div className="soulmate-locked-card" onClick={onUpgrade}>
          <div className="lock-glow"></div>
          <span className="lock-emoji">💎</span>
          <h3>Platinum Discovery</h3>
          <p>Your top matches are hidden. Upgrade to Platinum to reveal them.</p>
          <button className="upgrade-action-btn">Unlock Now</button>
        </div>
      ) : (
        <div className="horizontal-scroll-container">
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