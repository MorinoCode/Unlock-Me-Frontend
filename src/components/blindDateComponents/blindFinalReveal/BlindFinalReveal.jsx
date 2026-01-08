import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlindFinalReveal.css';
import Confetti from 'react-confetti'; // پیشنهاد: نصب کنید برای افکت جشن (npm i react-confetti)

const BlindFinalReveal = ({ session, currentUser }) => {
  const navigate = useNavigate();

  // پیدا کردن پارتنر از بین شرکت‌کنندگان
  const partner = useMemo(() => {
    if (!session || !session.participants) return null;
    return session.participants.find(p => p._id.toString() !== currentUser._id.toString());
  }, [session, currentUser]);

  if (!partner) return null;

  const handleGoToChat = () => {
    navigate(`/chat/${partner._id}`); 
  };

  const handleViewProfile = () => {
    navigate(`/user-profile/${partner._id}`);
  };

  return (
    <div className="blind-final-reveal">
      {/* افکت کاغذ رنگی برای جشن (اختیاری) */}
      <Confetti recycle={false} numberOfPieces={500} gravity={0.1} />

      <div className="blind-final-reveal__container">
        
        <header className="blind-final-reveal__header">
          <span className="blind-final-reveal__icon">✨</span>
          <h1 className="blind-final-reveal__title">It's a Match!</h1>
          <p className="blind-final-reveal__subtitle">You both said YES. It's time to meet.</p>
        </header>

        <div className="blind-final-reveal__profiles">
          
          {/* کارت من (سمت چپ/بالا) */}
          <div className="reveal-card reveal-card--me">
            <div className="reveal-card__image-box">
              <img 
                src={currentUser.avatar || "/default-avatar.png"} 
                alt={currentUser.name} 
                className="reveal-card__img" 
              />
            </div>
            <h3 className="reveal-card__name">{currentUser.name} (You)</h3>
          </div>

          {/* آیکون اتصال وسط */}
          <div className="blind-final-reveal__connector">
            <div className="connector-line"></div>
            <div className="connector-heart">💖</div>
            <div className="connector-line"></div>
          </div>

          {/* کارت پارتنر (سمت راست/پایین) */}
          <div className="reveal-card reveal-card--partner">
            <div className="reveal-card__image-box">
              <img 
                src={partner.avatar || "/default-avatar.png"} 
                alt={partner.name} 
                className="reveal-card__img reveal-card__img--animate" 
              />
            </div>
            <h3 className="reveal-card__name">{partner.name}</h3>
          </div>

        </div>

        <div className="blind-final-reveal__actions">
          <button className="reveal-btn reveal-btn--chat" onClick={handleGoToChat}>
            <span className="btn-icon">💬</span>
            Start Chatting & Break the Ice
          </button>
          
          <button className="reveal-btn reveal-btn--profile" onClick={handleViewProfile}>
            View Full Profile
          </button>
        </div>

      </div>
    </div>
  );
};

export default BlindFinalReveal;