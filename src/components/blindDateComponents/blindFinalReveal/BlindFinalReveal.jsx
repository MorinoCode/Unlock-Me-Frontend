import React from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import './BlindFinalReveal.css';

const BlindFinalReveal = ({ session, currentUser }) => {
  const navigate = useNavigate();

  // 1. پیدا کردن اطلاعات پارتنر از بین شرکت‌کنندگان
  const partner = session.participants.find(
    (p) => (p._id || p) !== currentUser._id
  );

  // استخراج راحت‌تر اطلاعات (با فرض اینکه پارتنر Populate شده است)
  const partnerId = partner?._id || partner;
  const partnerName = partner?.name || "Your Match";
  const partnerAvatar = partner?.avatar || "/default-avatar.png"; // مسیر عکس پیش‌فرض

  const handleViewProfile = () => {
    if (partnerId) {
      navigate(`/user-profile/${partnerId}`);
    }
  };

  const handleContinueChat = () => {
    if (partnerId) {
      navigate(`/chat/${partnerId}`);
    }
  };

  return (
    <div className="blind-final-reveal">
      <Confetti recycle={false} numberOfPieces={500} gravity={0.1} />
      
      <div className="blind-final-reveal__content">
        <h1 className="blind-final-reveal__title">It's a Match!</h1>
        <p className="blind-final-reveal__subtitle">The masks are off. Meet your connection.</p>

        <div className="blind-final-reveal__avatar-wrapper">
          <img 
            src={partnerAvatar} 
            alt={partnerName} 
            className="blind-final-reveal__avatar" 
          />
          <div className="blind-final-reveal__ring"></div>
        </div>

        <h2 className="blind-final-reveal__name">{partnerName}</h2>
        
        <div className="blind-final-reveal__badge">
          <span className="blind-final-reveal__dna-icon">🧬</span>
          {/* اگر فیلد تطابق DNA دارید اینجا نمایش دهید، در غیر این صورت یک عدد ثابت یا حذف کنید */}
          95% DNA Match
        </div>

        <div className="blind-final-reveal__actions">
          <button 
            className="blind-final-reveal__btn blind-final-reveal__btn--white"
            onClick={handleViewProfile}
          >
            View Full Profile
          </button>
          <button 
            className="blind-final-reveal__btn blind-final-reveal__btn--outline"
            onClick={handleContinueChat}
          >
            Continue in Private Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlindFinalReveal;