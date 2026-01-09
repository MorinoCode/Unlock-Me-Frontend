import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth'; // مسیر را چک کنید
import './UpgradePage.css';

const UpgradePage = () => {
  const navigate = useNavigate();
  const { currentUser, token } = useAuth(); // دریافت توکن برای احراز هویت
  const [loading, setLoading] = useState(false); // جلوگیری از کلیک تکراری

  const handlePurchase = async (plan) => {
    // چون توکن در کوکی است، ممکن است currentUser را داشته باشیم اما token در متغیر جاوااسکریپت نباشد
    // پس شرط !token را برمیداریم و فقط چک میکنیم کاربر لاگین باشد
    if (!currentUser) {
      alert("Please login first!");
      return;
    }
    
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${baseUrl}/api/payment/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ❌ خط Authorization را حذف کردیم (چون کوکی داریم)
        },
        // ✅ این خط حیاتی است: به مرورگر می‌گوید کوکی‌ها را بفرست
        credentials: 'include', 
        
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error("Payment Error:", data);
        alert(`Error: ${data.message || data.error || "Something went wrong"}`);
      }

    } catch (error) {
      console.error("Network Error:", error);
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upgrade-page">
      <div className="upgrade-page__bg-glow"></div>
      
      <div className="upgrade-page__content">
        <header className="upgrade-page__header">
          <h1 className="upgrade-page__title">Unlock Your Potential 🚀</h1>
          <p className="upgrade-page__subtitle">
            Get more matches, see who likes you, and find your connection faster.
          </p>
        </header>

        <div className="upgrade-page__cards">
          
          {/* --- GOLD CARD --- */}
          <div className="plan-card plan-card--gold">
            <div className="plan-card__header">
              <h2 className="plan-card__name">Gold</h2>
              <div className="plan-card__price">
                <span className="currency">$</span>9.99<span className="period">/mo</span>
              </div>
            </div>
            
            <ul className="plan-card__features">
              <li><span>✅</span> Unlimited Likes</li>
              <li><span>✅</span> See Who Likes You</li>
              <li><span>✅</span> 5 Super Likes / Day</li>
              <li><span>✅</span> No Ads</li>
            </ul>

            <button 
              className="plan-card__btn plan-card__btn--gold"
              onClick={() => handlePurchase('gold')}
              disabled={loading}
            >
              {loading ? "Processing..." : "Get Gold ✨"}
            </button>
          </div>

          {/* --- PLATINUM CARD --- */}
          <div className="plan-card plan-card--platinum">
            <div className="plan-card__badge">MOST POPULAR</div>
            <div className="plan-card__header">
              <h2 className="plan-card__name">Platinum</h2>
              <div className="plan-card__price">
                <span className="currency">$</span>19.99<span className="period">/mo</span>
              </div>
            </div>
            
            <ul className="plan-card__features">
              <li><span>💎</span> <strong>Everything in Gold</strong></li>
              <li><span>🚀</span> <strong>Priority Likes</strong> (Be seen first)</li>
              <li><span>✈️</span> <strong>Travel Mode</strong> (Change location)</li>
              <li><span>💌</span> <strong>Message Before Match</strong></li>
              <li><span>🎭</span> <strong>Unlimited Blind Dates</strong></li>
            </ul>

            <button 
              className="plan-card__btn plan-card__btn--platinum"
              onClick={() => handlePurchase('platinum')}
              disabled={loading}
            >
              {loading ? "Processing..." : "Get Platinum 🚀"}
            </button>
          </div>

        </div>

        <p className="upgrade-page__footer">
          Recurring billing, cancel anytime. By continuing, you agree to our Terms.
        </p>
      </div>
    </div>
  );
};

export default UpgradePage;