import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/'); 
  };

  const handleReport = () => {
    navigate('/report-problem');
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-number">404</h1>
        
        <h2 className="not-found-title">Page Not Found</h2>
        
        <p className="not-found-text">
          We can't seem to find the page you're looking for.
          Maybe it was moved or renamed.
        </p>
        
        <div className="not-found-actions">
          <button className="nf-btn nf-btn-primary" onClick={handleGoHome}>
            Return Home
          </button>
          <button className="nf-btn nf-btn-secondary" onClick={handleReport}>
            Report Problem
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;