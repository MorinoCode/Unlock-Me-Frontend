import React, { useState } from 'react';
import './BlindInstructions.css';

const BlindInstructions = ({ onConfirm }) => {
  const [isReady, setIsReady] = useState(false);

  const handleReady = () => {
    setIsReady(true);
    onConfirm();
  };

  return (
    <div className="blind-instructions">
      <div className="blind-instructions__card">
        <h1 className="blind-instructions__title">How it Works 🎭</h1>
        
        <div className="blind-instructions__steps">
          <div className="blind-instructions__step">
            <div className="blind-instructions__step-icon">1️⃣</div>
            <div className="blind-instructions__step-content">
              <h3>Fun & General Questions</h3>
              <p>Answer 5 fun questions. We'll show you your match % after this round based on similar answers!</p>
            </div>
          </div>

          <div className="blind-instructions__step">
            <div className="blind-instructions__step-icon">2️⃣</div>
            <div className="blind-instructions__step-content">
              <h3>Psychology & Values</h3>
              <p>5 deeper questions to understand compatibility.</p>
            </div>
          </div>

          <div className="blind-instructions__step">
            <div className="blind-instructions__step-icon">3️⃣</div>
            <div className="blind-instructions__step-content">
              <h3>Final Connection</h3>
              <p>5 messages to chat freely. Then, decide if you want to REVEAL your profile or stay anonymous.</p>
            </div>
          </div>
        </div>

        <button 
          className="blind-instructions__btn" 
          onClick={handleReady}
          disabled={isReady}
        >
          {isReady ? "Waiting for partner..." : "I Understand, Let's Go!"}
        </button>
      </div>
    </div>
  );
};

export default BlindInstructions;