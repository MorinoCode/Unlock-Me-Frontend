import React, { useEffect, useState } from "react";
import {
  RiVipCrownFill,
  RiCloseLine,
  RiCheckLine,
  RiFlashlightFill,
} from "react-icons/ri";
import toast from "react-hot-toast";
import "./SubscriptionModal.css";

// Import rules
import {
  PLANS,
  getDailyDmLimit,
  getSwipeLimit,
  getSuperLikeLimit,
  getBlindDateConfig,
  getVisibilityThreshold,
  getMatchListLimit,
} from "../../../utils/subscriptionRules.js";

const SubscriptionModal = ({ onClose, message }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // --- Dynamic Features Logic ---
  const getDynamicFeatures = (planName) => {
    const normalizedPlan = planName.toLowerCase().includes("platinum")
      ? PLANS.PLATINUM
      : PLANS.GOLD;

    const swipeLimit = getSwipeLimit(normalizedPlan);
    const dmLimit = getDailyDmLimit(normalizedPlan);
    const superLikeLimit = getSuperLikeLimit(normalizedPlan);
    const blindConfig = getBlindDateConfig(normalizedPlan);
    const visibility = getVisibilityThreshold(normalizedPlan);
    const seeLikes = getMatchListLimit(normalizedPlan, "incoming");

    const features = [];

    // LIKES
    features.push(
      swipeLimit === Infinity
        ? "Unlimited Likes"
        : `${swipeLimit} Likes per day`
    );

    // DIRECT MESSAGES
    features.push(
      dmLimit === Infinity
        ? "Unlimited Direct Messages"
        : `${dmLimit} Direct Messages per day`
    );

    // SEE WHO LIKED YOU
    if (seeLikes === Infinity || seeLikes > 0) {
      features.push("See Who Liked You");
    }

    // SUPER LIKES
    features.push(
      superLikeLimit === Infinity
        ? "Unlimited Super Likes"
        : `${superLikeLimit} Super Likes per day`
    );

    // BLIND DATES
    if (blindConfig.limit === Infinity) {
      features.push("Unlimited Blind Dates (No Cooldown)");
    } else {
      features.push(
        `${blindConfig.limit} Blind Dates (${blindConfig.cooldownHours}h cooldown)`
      );
    }

    // VISIBILITY
    if (visibility === 100) {
      features.push("Priority Visibility (See 100% of Matches)");
    } else if (visibility > 80) {
      features.push(`Extended Visibility (See up to ${visibility}% Matches)`);
    }

    // EXTRAS
    if (normalizedPlan === PLANS.PLATINUM) {
      features.push("Exclusive Badge on Profile");
      features.push("See Read Receipts");
      features.push("Advanced Filters (Height, Education)");
    } else {
      features.push("1 Free Monthly Boost");
      features.push("Turn off Ads");
    }

    return features;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/api/payment/plans`);
        if (!res.ok) throw new Error("Failed to fetch plans");

        const data = await res.json();
        const sortedPlans = data.sort((a, b) => a.amount - b.amount);
        setPlans(sortedPlans);
      } catch (err) {
        console.error("Error fetching plans:", err);
        toast.error("Could not load subscription plans.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [API_URL]);

  const formatPrice = (amount, currency) => {
    const locale = currency.toLowerCase() === "sek" ? "sv-SE" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubscribe = async (priceId, productName) => {
    // ✅ اضافه شدن پارامتر دوم
    if (!priceId) return;
    try {
      toast.loading("Redirecting to checkout...");
      const res = await fetch(`${API_URL}/api/payment/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // ✅ ارسال planName همراه با priceId
        body: JSON.stringify({ priceId, planName: productName }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.dismiss();
        toast.error("Failed to initialize payment.");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Something went wrong.");
    }
  };

  const getPlanType = (productName) => {
    const name = productName?.toLowerCase() || "";
    if (name.includes("platinum")) return "platinum";
    if (name.includes("gold")) return "gold";
    return "unknown";
  };

  return (
    <div className="sub-modal" onClick={onClose}>
      <div className="sub-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="sub-modal__close-btn" onClick={onClose}>
          <RiCloseLine />
        </button>

        <div className="sub-modal__header">
          <div className="sub-modal__icon-wrapper">
            <RiVipCrownFill />
          </div>
          <h2 className="sub-modal__title">Unlock Full Access</h2>
          <p className="sub-modal__subtitle">
            {message || "Upgrade to match faster and chat freely!"}
          </p>
        </div>

        {loading ? (
          <div className="sub-modal__loading">
            <div className="sub-modal__spinner"></div>
            <p>Loading plans...</p>
          </div>
        ) : (
          <div className="sub-modal__plans-grid">
            {plans.map((plan) => {
              const type = getPlanType(plan.productName);
              const isPlatinum = type === "platinum";

              if (type === "unknown") return null;

              const features = getDynamicFeatures(plan.productName);

              return (
                <div
                  key={plan.id}
                  className={`sub-modal__card sub-modal__card--${type}`}
                >
                  {isPlatinum && (
                    <div className="sub-modal__badge">BEST VALUE</div>
                  )}

                  <div className="sub-modal__card-header">
                    <h3 className="sub-modal__plan-name">{plan.productName}</h3>
                    <div className="sub-modal__price">
                      {formatPrice(plan.amount, plan.currency)}
                      <span className="sub-modal__interval">
                        /{plan.interval === "month" ? "mån" : "år"}
                      </span>
                    </div>
                  </div>

                  <ul className="sub-modal__features-list">
                    {features.map((feat, i) => (
                      <li key={i} className="sub-modal__feature-item">
                        {isPlatinum ? (
                          <RiFlashlightFill className="sub-modal__icon sub-modal__icon--plat" />
                        ) : (
                          <RiCheckLine className="sub-modal__icon" />
                        )}
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`sub-modal__subscribe-btn sub-modal__subscribe-btn--${type}`}
                    // ✅ ارسال اسم محصول (مثلاً "Gold Plan") به تابع
                    onClick={() => handleSubscribe(plan.id, plan.productName)}
                  >
                    Get {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="sub-modal__footer-text">
          Recurring billing. Cancel anytime. Secure payment via Stripe.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;
