import React from 'react';
import './BlindProgressBar.css';

const BlindProgressBar = ({ currentStage, currentIndex }) => {
  return (
    <div className="blind-progress-bar">
      <div className="blind-progress-bar__info">
        <span className="blind-progress-bar__stage">Stage {currentStage}</span>
        <span className="blind-progress-bar__count">Question {currentIndex + 1} / 5</span>
      </div>
      <div className="blind-progress-bar__track">
        {[0, 1, 2, 3, 4].map((step) => (
          <div 
            key={step} 
            className={`blind-progress-bar__step ${step <= currentIndex ? 'blind-progress-bar__step--active' : ''}`}
          >
            <div className="blind-progress-bar__fill"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlindProgressBar;