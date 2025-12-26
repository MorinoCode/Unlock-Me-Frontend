import React from "react";
import UserCard from "../userCard/UserCard";
import EmptyStateCard from "../emptyState/EmptyStateCard";
import PremiumLockCard from "../premiumLock/PremiumLockCard";
import { getSoulmatePermissions } from "../../utils/subscriptionRules";
import "./ExploreSection.css"; 

const ExploreSection = ({ title, subtitle, users, type, link, userPlan, navigate }) => {
  const displayedUsers = users || [];
  
  // ----------------------------------------------------
  // بخش ۱: لاجیک مخصوص Soulmates
  // (طبق قوانین: Free=قفل، Gold=۵ نفر، Premium=همه)
  // ----------------------------------------------------
  if (type === "soulmates") {
    const { isLocked, limit } = getSoulmatePermissions(userPlan);

    // حالت ۱: کاربر Free است و کلاً قفل است
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

    // حالت ۲: کاربر Gold یا Premium است
    // اگر limit برابر Infinity باشد (Premium)، کل لیست را نشان بده
    // اگر limit عدد باشد (Gold)، فقط همان تعداد را برش بزن
    const visibleUsers = (limit === Infinity) 
        ? displayedUsers 
        : displayedUsers.slice(0, limit);
        
    const remainingCount = (limit === Infinity) 
        ? 0 
        : Math.max(0, displayedUsers.length - limit);

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
                <UserCard 
                  key={user._id} 
                  user={user} 
                  // در بخش سول‌میت، کسانی که نمایش داده می‌شوند معمولاً باز هستند
                  // مگر اینکه بخواهید منطق دیگری اضافه کنید
                  isLocked={false} 
                  userPlan={userPlan} 
                />
              ))}

              {/* کارت "بقیه کاربران" فقط برای Gold نمایش داده می‌شود */}
              {remainingCount > 0 && (
                <div className="explore-section__locked-more-card" onClick={() => navigate("/upgrade")}>
                  <div className="explore-section__lock-icon">💎</div>
                  <h3 className="explore-section__locked-title">+{remainingCount} More</h3>
                  <p className="explore-section__locked-desc">Upgrade to Premium to see everyone!</p>
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

  // ----------------------------------------------------
  // بخش ۲: سایر بخش‌ها (Nearby, Fresh, Interests, Country)
  // طبق "حالت B": هیچکس حذف نمی‌شود، فقط UserCard تصمیم می‌گیرد بلر کند یا نه
  // ----------------------------------------------------
  
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
              isLocked={false} // در لیست‌های عمومی قفل کامل نداریم، بلر داریم که داخل کارد هندل میشه
              userPlan={userPlan}
            />
          ))
        ) : (
          <EmptyStateCard type={getEmptyStateType(type)} />
        )}
      </div>
    </div>
  );
};

// تابع کمکی برای تعیین نوع EmptyState
const getEmptyStateType = (sectionType) => {
    switch(sectionType) {
        case 'city': return 'cityMatches';
        case 'fresh': return 'freshFaces';
        case 'interests': return 'interestMatches';
        default: return 'default';
    }
};

export default ExploreSection;