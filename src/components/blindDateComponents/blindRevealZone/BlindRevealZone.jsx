import React from 'react';
import './BlindRevealZone.css';

const BlindRevealZone = ({ session, currentUser, socketRef }) => {
  const isUser1 = session.participants[0] === currentUser._id;
  const myDecision = isUser1 ? session.revealDecision.u1Reveal : session.revealDecision.u2Reveal;
  const partnerDecision = isUser1 ? session.revealDecision.u2Reveal : session.revealDecision.u1Reveal;

  const handleDecision = (choice) => {
    socketRef.current.emit('handle_reveal_decision', {
      sessionId: session._id,
      decision: choice
    });
  };

  return (
    <div className="blind-reveal-zone">
      <div className="blind-reveal-zone__header">
        <h2 className="blind-reveal-zone__title">The Moment of Truth</h2>
        <p className="blind-reveal-zone__subtitle">Do you both want to take off the masks?</p>
      </div>

      <div className="blind-reveal-zone__display">
        <div className={`blind-reveal-zone__avatar-box ${myDecision ? 'blind-reveal-zone__avatar-box--ready' : ''}`}>
          <div className="blind-reveal-zone__mask">🎭</div>
          <span className="blind-reveal-zone__label">You</span>
        </div>
        
        <div className="blind-reveal-zone__vs">VS</div>

        <div className={`blind-reveal-zone__avatar-box ${partnerDecision ? 'blind-reveal-zone__avatar-box--ready' : ''}`}>
          <div className="blind-reveal-zone__mask">🎭</div>
          <span className="blind-reveal-zone__label">Partner</span>
        </div>
      </div>

      <div className="blind-reveal-zone__actions">
        {myDecision === false && (
          <>
            <button 
              className="blind-reveal-zone__btn blind-reveal-zone__btn--yes"
              onClick={() => handleDecision(true)}
            >
              Reveal Myself
            </button>
            <button 
              className="blind-reveal-zone__btn blind-reveal-zone__btn--no"
              onClick={() => handleDecision(false)}
            >
              Leave Secretly
            </button>
          </>
        )}
        {myDecision === true && !partnerDecision && (
          <p className="blind-reveal-zone__waiting-text">Waiting for partner's decision...</p>
        )}
      </div>
    </div>
  );
};

export default BlindRevealZone;