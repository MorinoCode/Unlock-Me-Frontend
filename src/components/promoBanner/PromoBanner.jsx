import React, { memo, useMemo } from "react";
import "./PromoBanner.css";

const BANNER_TYPES = {
  BOOST: "boost",
  GOLD: "gold",
};

const PromoBanner = ({ title, desc, btnText, onClick, gradient }) => {
  const bannerType = useMemo(() => {
    if (gradient?.includes("#2e1065")) return BANNER_TYPES.GOLD;
    if (gradient?.includes("#1e1b4b")) return BANNER_TYPES.BOOST;
    return BANNER_TYPES.BOOST;
  }, [gradient]);

  return (
    <div 
      className={`promo-banner promo-banner--${bannerType}`}
      role="region"
      aria-label="Promotional banner"
    >
      <div className="promo-banner__content">
        <h3 className="promo-banner__title">{title}</h3>
        <p className="promo-banner__description">{desc}</p>
      </div>
      <button 
        onClick={onClick} 
        className="promo-banner__btn"
        aria-label={btnText}
      >
        {btnText}
      </button>
    </div>
  );
};

export default memo(PromoBanner);