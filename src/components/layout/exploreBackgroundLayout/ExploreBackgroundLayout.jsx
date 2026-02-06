import React, { memo } from "react";
import "./ExploreBackgroundLayout.css";

/**
 * Static background layout for Explore/Swipe pages.
 * No star/heart animations for better performance; keeps gradient + soft glows only.
 */
const ExploreBackgroundLayout = ({ children }) => {
  return (
    <div className="explore-bg-layout">
      <div className="explore-bg-layout__background" aria-hidden="true">
        <div className="explore-bg-layout__glow explore-bg-layout__glow--purple" />
        <div className="explore-bg-layout__glow explore-bg-layout__glow--pink" />
      </div>
      <div className="explore-bg-layout__content">{children}</div>
    </div>
  );
};

export default memo(ExploreBackgroundLayout);
