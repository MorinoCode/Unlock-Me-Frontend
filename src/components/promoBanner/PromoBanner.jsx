import React, { memo, useMemo } from "react";
import "./PromoBanner.css";

/** Variants aligned with subscriptionRules: getPromoBannerConfig(plan) */
export const PROMO_VARIANTS = {
  BOOST: "boost", // Answer more / profile boost
  GOLD: "gold", // Upgrade to Gold
  PLATINUM: "platinum", // Upgrade to Platinum
  DIAMOND: "diamond", // Upgrade to Diamond (top tier)
};

const PromoBanner = ({
  title,
  desc,
  btnText,
  onClick,
  gradient,
  variant: variantProp,
  onClose,
}) => {
  const variant = useMemo(() => {
    if (variantProp && Object.values(PROMO_VARIANTS).includes(variantProp))
      return variantProp;
    if (gradient?.includes("#2e1065") || gradient?.includes("#4c1d95"))
      return PROMO_VARIANTS.GOLD;
    if (gradient?.includes("#0f172a") || gradient?.includes("#334155"))
      return PROMO_VARIANTS.PLATINUM;
    if (gradient?.includes("#1e1b4b") || gradient?.includes("#312e81"))
      return PROMO_VARIANTS.BOOST;
    return PROMO_VARIANTS.BOOST;
  }, [variantProp, gradient]);

  return (
    <div
      className={`promo-banner promo-banner--${variant}`}
      role="region"
      aria-label={title || "Promotional offer"}
    >
      {onClose && (
        <button
          type="button"
          className="promo-banner__close"
          onClick={onClose}
          aria-label="Dismiss"
        />
      )}
      <div className="promo-banner__content">
        <h3 className="promo-banner__title">{title}</h3>
        <p className="promo-banner__description">{desc}</p>
      </div>
      <button
        type="button"
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
