import React from "react";
import "./ExploreBackgroundLayout.css";

// ✅ مقادیر را بیرون از کامپوننت می‌سازیم تا React Compiler ارور ندهد
const STATIC_STARS = Array.from({ length: 50 }).map((_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 5}s`,
  scale: Math.random() * 0.7 + 0.3,
}));

const STATIC_HEARTS = Array.from({ length: 2 }).map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 60}s`,
  duration: `${10 + Math.random() * 10}s`,
  opacity: Math.random() * 0.5 + 0.2,
}));

const ExploreBackgroundLayout = ({ children }) => {
  return (
    <div className="explore-bg-layout">
      <div className="explore-bg-layout__background">
        {/* ستاره‌های چشمک‌زن */}
        {STATIC_STARS.map((star) => (
          <div 
            key={`star-${star.id}`} 
            className="explore-bg-layout__star" 
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
              transform: `scale(${star.scale})`
            }}
          />
        ))}

        {/* قلب‌های شناور */}
        {STATIC_HEARTS.map((heart) => (
          <div 
            key={`heart-${heart.id}`} 
            className="explore-bg-layout__heart" 
            style={{
              left: heart.left,
              animationDelay: heart.delay,
              animationDuration: heart.duration,
              opacity: heart.opacity
            }}
          >
            ❤️
          </div>
        ))}

        {/* هاله‌های رنگی */}
        <div className="explore-bg-layout__glow explore-bg-layout__glow--purple"></div>
        <div className="explore-bg-layout__glow explore-bg-layout__glow--pink"></div>
      </div>

      <div className="explore-bg-layout__content">
        {children}
      </div>
    </div>
  );
};

export default ExploreBackgroundLayout;