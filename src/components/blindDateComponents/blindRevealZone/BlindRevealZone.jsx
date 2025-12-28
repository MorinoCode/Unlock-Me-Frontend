import React from 'react';
import './BlindRevealZone.css';

const BlindRevealZone = ({ session, currentUser, socketRef }) => {
  if (!session || !currentUser) return null;

  // پیدا کردن اینکه کاربر فعلی نفر اول است یا دوم
  const isUser1 = session.participants[0]?._id === currentUser._id || session.participants[0] === currentUser._id;
  
  // گرفتن وضعیت تصمیمات با مقدار پیش‌فرض pending برای جلوگیری از خطا
  const myDecision = (isUser1 ? session.u1RevealDecision : session.u2RevealDecision) || 'pending';
  const partnerDecision = (isUser1 ? session.u2RevealDecision : session.u1RevealDecision) || 'pending';

  const handleDecision = (decision) => {
    if (socketRef.current) {
      socketRef.current.emit('submit_reveal_decision', {
        sessionId: session._id,
        decision: decision // 'yes' یا 'no'
      });
    }
  };

  return (
    <div className="blind-reveal-zone">
      <div className="blind-reveal-zone__card">
        <div className="blind-reveal-zone__header">
          <div className="blind-reveal-zone__icon-wrapper">
            <span className="blind-reveal-zone__icon">🔍</span>
          </div>
          <h2 className="blind-reveal-zone__title">The Moment of Truth</h2>
          <p className="blind-reveal-zone__description">
            You've completed all stages! Do you want to reveal your full profile and photos to each other?
          </p>
          <p className="blind-reveal-zone__note">
            Note: Both must say <strong>YES</strong> for a successful reveal.
          </p>
        </div>

        <div className="blind-reveal-zone__content">
          {myDecision === 'pending' ? (
            <div className="blind-reveal-zone__options">
              <button 
                className="blind-reveal-zone__btn blind-reveal-zone__btn--yes"
                onClick={() => handleDecision('yes')}
              >
                Yes, I'm ready!
              </button>
              <button 
                className="blind-reveal-zone__btn blind-reveal-zone__btn--no"
                onClick={() => handleDecision('no')}
              >
                No, maybe later
              </button>
            </div>
          ) : (
            <div className="blind-reveal-zone__status-box">
              <div className="blind-reveal-zone__loader-ring"></div>
              <p className="blind-reveal-zone__status-text">
                You chose <strong>{myDecision?.toUpperCase()}</strong>
              </p>
              <p className="blind-reveal-zone__status-sub">
                Waiting for your partner to decide...
              </p>
            </div>
          )}
        </div>

        {partnerDecision !== 'pending' && (
          <div className="blind-reveal-zone__partner-alert">
            Partner has made a choice!
          </div>
        )}
      </div>
    </div>
  );
};

export default BlindRevealZone;