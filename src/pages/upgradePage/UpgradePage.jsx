import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiVipCrownFill, RiCheckLine, RiFlashlightFill } from "react-icons/ri";
import toast from "react-hot-toast";
import { useAuth } from '../../context/useAuth';
import './UpgradePage.css';

// Import rules for dynamic features
import { 
  PLANS, 
  getDailyDmLimit, 
  getSwipeLimit, 
  getSuperLikeLimit, 
  getBlindDateConfig, 
  getVisibilityThreshold,
  getMatchListLimit
} from "../../utils/subscriptionRules.js";

const UpgradePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Track which button is loading

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // --- Dynamic Features Logic (Shared with Modal) ---
  const getDynamicFeatures = (planName) => {
    const normalizedPlan = planName.toLowerCase().includes('platinum') ? PLANS.PLATINUM : PLANS.GOLD;

    const swipeLimit = getSwipeLimit(normalizedPlan);
    const dmLimit = getDailyDmLimit(normalizedPlan);
    const superLikeLimit = getSuperLikeLimit(normalizedPlan);
    const blindConfig = getBlindDateConfig(normalizedPlan);
    const visibility = getVisibilityThreshold(normalizedPlan);
    const seeLikes = getMatchListLimit(normalizedPlan, 'incoming');

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
      features.push(`${blindConfig.limit} Blind Dates (${blindConfig.cooldownHours}h cooldown)`);
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
    const locale = currency.toLowerCase() === 'sek' ? 'sv-SE' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePurchase = async (priceId, productName) => {
    if (!currentUser) {
      toast.error("Please login first!");
      navigate('/login');
      return;
    }
    
    setProcessingId(priceId);

    try {
      const response = await fetch(`${API_URL}/api/payment/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ priceId, planName: productName }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error("Payment Error:", data);
        toast.error(`Error: ${data.message || "Something went wrong"}`);
      }

    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const getPlanType = (productName) => {
    const name = productName?.toLowerCase() || "";
    if (name.includes("platinum")) return "platinum";
    if (name.includes("gold")) return "gold";
    return "unknown";
  };

  return (
    <div className="upgrade-page">
      <div className="upgrade-page__bg-glow"></div>
      
      <div className="upgrade-page__content">
        <header className="upgrade-page__header">
          <div className="upgrade-page__icon-box">
             <RiVipCrownFill />
          </div>
          <h1 className="upgrade-page__title">Unlock Your Potential 🚀</h1>
          <p className="upgrade-page__subtitle">
            Get more matches, see who likes you, and find your connection faster.
          </p>
        </header>

        {loading ? (
           <div className="upgrade-page__loading">
             <div className="upgrade-page__spinner"></div>
             <p>Loading plans...</p>
           </div>
        ) : (
          <div className="upgrade-page__cards-grid">
            {plans.map((plan) => {
              const type = getPlanType(plan.productName);
              const isPlatinum = type === "platinum";
              
              if (type === "unknown") return null;

              const features = getDynamicFeatures(plan.productName);

              return (
                <div key={plan.id} className={`plan-card plan-card--${type}`}>
                  {isPlatinum && <div className="plan-card__badge">MOST POPULAR</div>}
                  
                  <div className="plan-card__header">
                    <h2 className="plan-card__name">{plan.productName}</h2>
                    <div className="plan-card__price">
                      {formatPrice(plan.amount, plan.currency)}
                      <span className="plan-card__interval">/{plan.interval === 'month' ? 'mån' : 'år'}</span>
                    </div>
                  </div>
                  
                  <ul className="plan-card__features">
                    {features.map((feat, i) => (
                      <li key={i}>
                        {isPlatinum ? 
                          <RiFlashlightFill className="plan-card__icon plan-card__icon--plat" /> : 
                          <RiCheckLine className="plan-card__icon" />
                        } 
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`plan-card__btn plan-card__btn--${type}`}
                    onClick={() => handlePurchase(plan.id, plan.productName)}
                    disabled={processingId === plan.id}
                  >
                    {processingId === plan.id ? "Processing..." : `Get ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="upgrade-page__footer">
          Recurring billing, cancel anytime. By continuing, you agree to our Terms.
        </p>
      </div>
    </div>
  );
};

export default UpgradePage;