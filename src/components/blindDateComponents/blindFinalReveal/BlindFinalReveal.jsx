import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import './BlindFinalReveal.css';

const BlindFinalReveal = ({ session, currentUser }) => {
  const navigate = useNavigate();
  const [isRevealed, setIsRevealed] = useState(false);
  
  const partner = session.participants.find(p => p._id !== currentUser._id);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="blind-final-reveal">
      {isRevealed && <Confetti numberOfPieces={200} recycle={false} colors={['#8b5cf6', '#d946ef', '#10b981']} />}
      
      <div className="blind-final-reveal__content">
        <h1 className="blind-final-reveal__title">It's a Match!</h1>
        <p className="blind-final-reveal__subtitle">The masks are off. Meet your connection.</p>

        <div className="blind-final-reveal__display">
          <div className="blind-final-reveal__photo-wrapper">
            <img 
              src={partner.avatar} 
              alt="Partner" 
              className={`blind-final-reveal__photo ${isRevealed ? 'blind-final-reveal__photo--clear' : ''}`} 
            />
            <div className="blind-final-reveal__glow"></div>
          </div>
          
          <div className="blind-final-reveal__info">
            <h2 className="blind-final-reveal__name">{partner.name}, {partner.age}</h2>
            <div className="blind-final-reveal__dna-tag">{session.matchPercentage}% DNA Match</div>
          </div>
        </div>

        <div className="blind-final-reveal__actions">
          <button 
            className="blind-final-reveal__btn blind-final-reveal__btn--profile"
            onClick={() => navigate(`/profile/${partner._id}`)}
          >
            View Full Profile
          </button>
          <button 
            className="blind-final-reveal__btn blind-final-reveal__btn--chat"
            onClick={() => navigate(`/chat/${partner._id}`)}
          >
            Continue in Private Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlindFinalReveal;