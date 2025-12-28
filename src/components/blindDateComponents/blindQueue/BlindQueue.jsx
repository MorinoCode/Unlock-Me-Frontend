import React, { useState, useEffect } from 'react';
import './BlindQueue.css';

const BlindQueue = ({ socketRef, onCancel }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    
    // دسترسی ایمن به سوکت فقط داخل useEffect
    const socket = socketRef.current;
    
    if (socket) {
      socket.on('match_found', () => {
        // لاجیک مربوط به مچ شدن در والد مدیریت می‌شود
      });
    }

    return () => {
      clearInterval(timer);
      if (socket) {
        socket.off('match_found');
      }
    };
  }, [socketRef]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="blind-queue-screen">
      <div className="blind-queue-screen__radar-wrapper">
        <div className="blind-queue-screen__radar-circle"></div>
        <div className="blind-queue-screen__radar-pulse"></div>
      </div>
      
      <div className="blind-queue-screen__content">
        <h2 className="blind-queue-screen__status-title">Finding Your Match</h2>
        <p className="blind-queue-screen__status-subtitle">Analyzing DNA profiles and personality traits...</p>
        <div className="blind-queue-screen__timer-box">
          <span className="blind-queue-screen__timer-label">Wait time:</span>
          <span className="blind-queue-screen__timer-value">{formatTime(seconds)}</span>
        </div>
      </div>

      <button className="blind-queue-screen__cancel-btn" onClick={onCancel}>
        Leave Queue
      </button>
    </div>
  );
};

export default BlindQueue;