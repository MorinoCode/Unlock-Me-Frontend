import React from "react";
import UserCard from "../userCard/UserCard";
import EmptyStateCard from "../emptyState/EmptyStateCard";
import PremiumLockCard from "../premiumLock/PremiumLockCard";
import { 
  getSoulmatePermissions, 
  getVisibilityThreshold 
} from "../../utils/subscriptionRules";
import "./ExploreSection.css"; 

const ExploreSection = ({ title, subtitle, users, type, link, userPlan, navigate }) => {
  let displayedUsers = users || [];
  
  if (type === "soulmates") {
    const { isLocked, limit } = getSoulmatePermissions(userPlan);

    if (isLocked) {
      return (
        <div className="explore-section">
          <div className="explore-section__header">
            <div className="explore-section__header-group">
              <h2 className="explore-section__title">{title}</h2>
              <p className="explore-section__subtitle">{subtitle}</p>
            </div>
          </div>
          <PremiumLockCard onUnlock={() => navigate("/upgrade")} />
        </div>
      );
    }

    const visibleUsers = displayedUsers.slice(0, limit);
    const remainingCount = Math.max(0, displayedUsers.length - limit);

    return (
      <div className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__header-group">
            <h2 className="explore-section__title">
              {title} <span className="explore-section__count">({displayedUsers.length})</span>
            </h2>
            <p className="explore-section__subtitle">{subtitle}</p>
          </div>
          {link && <button className="explore-section__see-more-btn" onClick={() => navigate(link)}>See More</button>}
        </div>

        <div className="explore-section__scroll-container">
          {displayedUsers.length > 0 ? (
            <>
              {visibleUsers.map((user) => (
                <UserCard key={user._id} user={user} isLocked={false} userPlan={userPlan} />
              ))}
              {userPlan === "gold" && remainingCount > 0 && (
                <div className="explore-section__locked-more-card" onClick={() => navigate("/upgrade")}>
                  <div className="explore-section__lock-icon">💎</div>
                  <h3 className="explore-section__locked-title">+{remainingCount} More</h3>
                  <p className="explore-section__locked-desc">Upgrade to Platinum for 90%+ matches</p>
                </div>
              )}
            </>
          ) : (
            <EmptyStateCard type="soulmates" />
          )}
        </div>
      </div>
    );
  }

  const scoreThreshold = getVisibilityThreshold(userPlan);
  displayedUsers = displayedUsers.filter(u => (u.matchScore || 0) <= scoreThreshold);

  return (
    <div className="explore-section">
      <div className="explore-section__header">
        <div className="explore-section__header-group">
          <h2 className="explore-section__title">
            {title} <span className="explore-section__count">({displayedUsers.length})</span>
          </h2>
          <p className="explore-section__subtitle">{subtitle}</p>
        </div>
        {link && <button className="explore-section__see-more-btn" onClick={() => navigate(link)}>See More</button>}
      </div>
      
      <div className="explore-section__scroll-container">
        {displayedUsers.length > 0 ? (
          displayedUsers.map((user) => (
            <UserCard 
              key={user._id} 
              user={user} 
              isLocked={false} 
              userPlan={userPlan}
            />
          ))
        ) : (
          <EmptyStateCard type={type === "city" ? "cityMatches" : "default"} />
        )}
      </div>
    </div>
  );
};

export default ExploreSection;