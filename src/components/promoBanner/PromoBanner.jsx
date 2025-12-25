import React from "react";
import "./PromoBanner.css";

const PromoBanner = ({ title, desc, btnText, onClick, gradient }) => {
  return (
    <div className="promo-banner" style={{ background: gradient }}>
      <div className="promo-banner__content">
        <h3 className="promo-banner__title">{title}</h3>
        <p className="promo-banner__description">{desc}</p>
      </div>
      <button onClick={onClick} className="promo-banner__btn">
        {btnText}
      </button>
    </div>
  );
};

export default PromoBanner;