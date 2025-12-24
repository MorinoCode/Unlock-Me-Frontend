import React from "react";
import UserCard from "../userCard/UserCard";
import EmptyStateCard from "../emptyState/EmptyStateCard";
import PremiumLockCard from "../premiumLock/PremiumLockCard";
import { 
  getSoulmatePermissions, 
  getVisibilityThreshold 
} from "../../utils/subscriptionRules";

const ExploreSection = ({ title, subtitle, users, type, link, userPlan, navigate }) => {
  let displayedUsers = users || [];
  
  // ۱. منطق بخش VIP (The Soulmates)
  if (type === "soulmates") {
    const { isLocked, limit } = getSoulmatePermissions(userPlan);

    if (isLocked) {
      return (
        <div className="explore-section">
          <div className="section-header-wrapper">
            <div className="section-header-group">
              <h2 className="section-title">{title}</h2>
              <p className="section-subtitle">{subtitle}</p>
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
        <div className="section-header-wrapper">
          <div className="section-header-group">
            <h2 className="section-title">
              {title} <span className="count">({displayedUsers.length})</span>
            </h2>
            <p className="section-subtitle">{subtitle}</p>
          </div>
          {link && <button className="see-all-btn" onClick={() => navigate(link)}>See More</button>}
        </div>

        <div className="horizontal-scroll">
          {displayedUsers.length > 0 ? (
            <>
              {visibleUsers.map((user) => (
                <UserCard key={user._id} user={user} isLocked={false} userPlan={userPlan} />
              ))}
              {userPlan === "gold" && remainingCount > 0 && (
                <div className="locked-more-card" onClick={() => navigate("/upgrade")}>
                  <div className="lock-circle">💎</div>
                  <h3>+{remainingCount} More</h3>
                  <p>Upgrade to Platinum for 90%+ matches</p>
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

  // ۲. منطق بخش‌های عمومی (Near You, etc.)
  const scoreThreshold = getVisibilityThreshold(userPlan);
  displayedUsers = displayedUsers.filter(u => (u.matchScore || 0) <= scoreThreshold);

  return (
    <div className="explore-section">
      <div className="section-header-wrapper">
        <div className="section-header-group">
          <h2 className="section-title">
            {title} <span className="count">({displayedUsers.length})</span>
          </h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>
        {link && <button className="see-all-btn" onClick={() => navigate(link)}>See More</button>}
      </div>
      
      <div className="horizontal-scroll">
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