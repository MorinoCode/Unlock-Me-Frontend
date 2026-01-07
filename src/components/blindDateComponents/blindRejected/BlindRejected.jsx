import React from 'react';
import './BlindRejected.css';

const BlindRejected = ({ onRetry }) => {
  return (
    <div className="blind-rejected">
      <div className="blind-rejected__card">
        
        {/* آیکون متحرک */}
        <div className="blind-rejected__icon-wrapper">
          <span className="blind-rejected__icon">💔</span>
        </div>

        <h2 className="blind-rejected__title">It wasn't a match</h2>
        
        <p className="blind-rejected__desc">
          Your partner decided not to reveal their profile this time. 
          Don't worry, chemistry is mysterious!
        </p>

        <div className="blind-rejected__divider"></div>

        <p className="blind-rejected__encouragement">
          There are plenty of other people waiting to meet someone like you.
        </p>

        <button className="blind-rejected__btn" onClick={onRetry}>
          Try Again 🚀
        </button>

      </div>
    </div>
  );
};

export default BlindRejected;