import React from 'react';
import './BlindRevealZone.css';

const BlindRevealZone = ({ session, currentUser, socketRef, matchPercentage }) => {
  if (!session || !currentUser) return null;

  // پیدا کردن وضعیت من
  const p1Id = session.participants[0]._id || session.participants[0];
  const isUser1 = p1Id.toString() === currentUser._id.toString();
  
  const myDecision = isUser1 ? session.u1RevealDecision : session.u2RevealDecision;
  const isWaiting = myDecision !== 'pending'; // اگر تصمیم گرفتم، یعنی منتظرم

  const handleDecision = (decision) => {
    if (socketRef.current) {
      socketRef.current.emit('submit_reveal_decision', {
        sessionId: session._id,
        decision: decision 
      });
    }
  };

  return (
    <div className="unique-reveal-zone">
      <div className="unique-reveal-zone__card">
        
        {/* هدر: نمایش درصد مچ */}
        <div className="unique-reveal-zone__header">
          <div className="unique-reveal-zone__score-circle">
            <span className="unique-reveal-zone__score-num">{matchPercentage}%</span>
            <span className="unique-reveal-zone__score-label">MATCH</span>
          </div>
          
          <h2 className="unique-reveal-zone__title">The Moment of Truth</h2>
          <p className="unique-reveal-zone__desc">
            Based on your answers, you have a <strong>{matchPercentage}% compatibility</strong> score!
          </p>
          <p className="unique-reveal-zone__question">
            Do you want to reveal your full profile and photos?
          </p>
          <p className="unique-reveal-zone__note">
            ⚠️ Both must say <strong>YES</strong> for a successful reveal.
          </p>
        </div>

        {/* محتوا: دکمه‌ها یا وضعیت انتظار */}
        <div className="unique-reveal-zone__content">
          {!isWaiting ? (
            <div className="unique-reveal-zone__actions">
              <button 
                className="unique-reveal-zone__btn unique-reveal-zone__btn--yes"
                onClick={() => handleDecision('yes')}
              >
                Yes, I'm ready! 🔓
              </button>
              <button 
                className="unique-reveal-zone__btn unique-reveal-zone__btn--no"
                onClick={() => handleDecision('no')}
              >
                No, maybe later ❌
              </button>
            </div>
          ) : (
            <div className="unique-reveal-zone__waiting">
              <div className="unique-reveal-zone__spinner"></div>
              <p className="unique-reveal-zone__waiting-text">
                You chose <strong>{myDecision?.toUpperCase()}</strong>
              </p>
              <p className="unique-reveal-zone__waiting-sub">
                Waiting for partner's decision...
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BlindRevealZone;