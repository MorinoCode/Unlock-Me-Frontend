import React from 'react';
import './BlindGameCard.css';

const BlindGameCard = ({ session, currentUser, socketRef }) => {
  const currentQ = session.questions[session.currentQuestionIndex];
  const isUser1 = session.participants[0] === currentUser._id;
  const myAnswer = isUser1 ? currentQ.u1Answer : currentQ.u2Answer;
  const partnerAnswer = isUser1 ? currentQ.u2Answer : currentQ.u1Answer;

  const handleOptionClick = (index) => {
    if (myAnswer !== null) return;
    
    if (socketRef.current) {
      socketRef.current.emit('submit_blind_answer', { 
        sessionId: session._id, 
        choiceIndex: index 
      });
    }
  };

  return (
    <div className="blind-game-card">
      <div className="blind-game-card__question-box">
        <h2 className="blind-game-card__text">{currentQ.questionId.text}</h2>
      </div>
      
      <div className="blind-game-card__options-list">
        {currentQ.questionId.options.map((option, idx) => {
          const isSelectedByMe = myAnswer === idx;
          const isSelectedByPartner = partnerAnswer === idx;

          return (
            <button 
              key={idx}
              className={`blind-game-card__option-btn 
                ${isSelectedByMe ? 'blind-game-card__option-btn--selected' : ''} 
                ${isSelectedByPartner && myAnswer !== null ? 'blind-game-card__option-btn--partner' : ''}`}
              onClick={() => handleOptionClick(idx)}
              disabled={myAnswer !== null}
            >
              <span className="blind-game-card__option-text">{option}</span>
              {isSelectedByPartner && myAnswer !== null && (
                <div className="blind-game-card__partner-indicator">Partner chose this</div>
              )}
            </button>
          );
        })}
      </div>

      {myAnswer !== null && partnerAnswer === null && (
        <div className="blind-game-card__waiting">
          <div className="blind-game-card__loader"></div>
          <p className="blind-game-card__waiting-text">Waiting for partner to answer...</p>
        </div>
      )}
    </div>
  );
};

export default BlindGameCard;