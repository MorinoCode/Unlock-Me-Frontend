import React from "react";
import "./PromoBanner.css" 

const PromoBanner = ({ title, desc, btnText, onClick, gradient }) => {
  return (
    <div className="promo-banner" style={{ background: gradient }}>
      <div className="promo-content">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      <button onClick={onClick} className="promo-btn">
        {btnText}
      </button>
    </div>
  );
};

export default PromoBanner;