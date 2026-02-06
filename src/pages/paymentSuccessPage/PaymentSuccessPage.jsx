import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useAuth } from '../../context/useAuth.js';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [_verifying, setVerifying] = useState(true);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const { checkAuth } = useAuth(); 

  useEffect(() => {
    const verifyAndUpdateSubscription = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        // Verify payment session and update subscription
        const res = await fetch(`${API_URL}/api/payment/verify-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sessionId }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log('✅ Subscription updated:', data);
          // Refresh user data
          await checkAuth();
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Failed to verify payment:', errorData);
          // Still refresh user data in case webhook already processed it
          await checkAuth();
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        // Still refresh user data
        await checkAuth();
      } finally {
        setVerifying(false);
      }
    };

    verifyAndUpdateSubscription();

    // Redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [sessionId, navigate, checkAuth, API_URL]);

  return (
    <div className="payment-success">
      <Confetti recycle={false} numberOfPieces={600} gravity={0.15} />

      <div className="payment-success__card">
        <div className="payment-success__icon-wrapper">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        </div>

        <h1 className="payment-success__title">Payment Successful!</h1>
        <p className="payment-success__desc">
          Welcome to the VIP club! 🌟<br />
          Your account has been upgraded successfully.
        </p>
        
        <div className="payment-success__info">
          <p>Transaction ID:</p>
          <code>{sessionId ? `${sessionId.slice(0, 20)}...` : 'Unknown'}</code>
        </div>

        <button 
          className="payment-success__btn"
          onClick={() => navigate('/')}
        >
          Start Matching Now 🚀
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;