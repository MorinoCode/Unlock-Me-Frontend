import React from 'react';
import './BlindInterestsModal.css';

const BlindInterestsModal = ({ session, onContinue }) => {
  const commonInterests = session.commonInterests || ['Music', 'Travel', 'Movies']; // این دیتا از بک‌اند می‌آید

  return (
    <div className="blind-interests-modal">
      <div className="blind-interests-modal__overlay"></div>
      <div className="blind-interests-modal__content">
        <div className="blind-interests-modal__icon">✨</div>
        <h2 className="blind-interests-modal__title">It's a Connection!</h2>
        <p className="blind-interests-modal__subtitle">You both have shared interests in:</p>
        
        <div className="blind-interests-modal__list">
          {commonInterests.map((interest, idx) => (
            <span key={idx} className="blind-interests-modal__item">#{interest}</span>
          ))}
        </div>

        <div className="blind-interests-modal__info-box">
          <p className="blind-interests-modal__info-text">
            Stage 1 Completed. In the next stage, you can send limited text messages!
          </p>
        </div>

        <button className="blind-interests-modal__btn" onClick={onContinue}>
          Unlock Stage 2
        </button>
      </div>
    </div>
  );
};

export default BlindInterestsModal;