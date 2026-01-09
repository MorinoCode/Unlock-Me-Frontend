import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Confetti from 'react-confetti'; 
import { useAuth } from '../../context/useAuth.js'; // ⚠️ مسیر ایمپورت را چک کنید
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // ✅ اصلاح ۱: هوک باید اینجا (بالای تابع) باشد، نه داخل useEffect
  const { refreshUser } = useAuth(); 

  useEffect(() => {
    // ✅ اصلاح ۲: تابع را باید اجرا کنیم (پرانتز بگذاریم)
    if (refreshUser) {
      console.log("🔄 Refreshing user data...");
      refreshUser(); 
    }

    // ریدایرکت بعد از ۱۰ ثانیه
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate, refreshUser]); // وابستگی‌ها را اضافه کردیم

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