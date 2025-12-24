import React from "react";
import "./ExploreBackgroundLayout.css";

// ✅ مقادیر را بیرون از کامپوننت می‌سازیم تا React Compiler ارور ندهد
// این مقادیر فقط یکبار هنگام لود شدن اپلیکیشن ساخته می‌شوند
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
    <div className="romantic-layout">
      <div className="romantic-bg">
        {/* ستاره‌های چشمک‌زن */}
        {STATIC_STARS.map((star) => (
          <div 
            key={`star-${star.id}`} 
            className="star" 
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
            className="floating-heart" 
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
        <div className="romantic-glow purple"></div>
        <div className="romantic-glow pink"></div>
      </div>

      <div className="romantic-content">
        {children}
      </div>
    </div>
  );
};

export default ExploreBackgroundLayout;