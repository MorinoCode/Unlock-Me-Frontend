import React from "react";
import UserCard from "../userCard/UserCard"; 

const ExploreSection = ({ 
  title, 
  subtitle, 
  data, 
  limitKey, 
  userPlan, 
  onViewAll 
}) => {
  
  const previewLimits = {
    free: { city: 15, interest: 12, country: 20 },
    gold: { city: 50, interest: 40, country: 100 },      
    platinum: { city: 999, interest: 999, country: 999 } 
  };

  const currentLimit = previewLimits[userPlan]?.[limitKey] || 10;
  const displayData = data.slice(0, 20); 

  return (
    <section className="explore-section">
      <div className="section-info">
        <div className="title-area">
          <h2>{title}</h2>
          <p className="subtitle">{subtitle}</p>
        </div>
        <button className="view-all" onClick={() => onViewAll(limitKey)}>
          See More
        </button>
      </div>

      <div className="horizontal-scroll-container">
        {displayData.length > 0 ? (
          displayData.map((match, index) => (
            <UserCard 
              key={match._id} 
              user={match} 
              isLocked={index >= currentLimit} 
              userPlan={userPlan}
            />
          ))
        ) : (
          <div className="empty-state">No new profiles found in this category.</div>
        )}
      </div>
    </section>
  );
};

export default ExploreSection;