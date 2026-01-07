import React from 'react';
import './BlindProgressBar.css';

const BlindProgressBar = ({ currentStage, currentIndex }) => {
  const isStage3 = currentStage === 3;
  const maxSteps = isStage3 ? 10 : 5;
  const label = isStage3 ? "Messages" : "Question";

  // محاسبه ایندکس نمایش (برای سوالات ۵ تایی و برای پیام ۱۰ تایی)
  // برای سوالات: باقی‌مانده بر ۵ (چون ایندکس کلی بالا می‌رود)
  // برای پیام‌ها: خود عدد (چون تعداد پیام است)
  const displayValue = isStage3 ? currentIndex : (currentIndex % 5);

  // متن نمایش: برای سوالات از ۱ شروع می‌شود (سوال ۱ از ۵)، برای پیام از تعداد (۳ از ۱۰)
  const countText = isStage3 ? displayValue : displayValue + 1;

  return (
    <div className="blind-progress-bar">
      <div className="blind-progress-bar__info">
        <span className="blind-progress-bar__stage">Stage {currentStage}</span>
        <span className="blind-progress-bar__count">
          {label} {Math.min(countText, maxSteps)} / {maxSteps}
        </span>
      </div>

      <div className="blind-progress-bar__track">
        {/* ساخت آرایه داینامیک بر اساس maxSteps */}
        {Array.from({ length: maxSteps }).map((_, step) => {
          
          // منطق پر شدن:
          // برای سوالات (Question): خانه فعلی هم پر نشان داده شود (چون در حال پاسخ به آن هستیم) -> step <= displayValue
          // برای پیام‌ها (Messages): فقط پیام‌های فرستاده شده پر شوند -> step < displayValue
          const isActive = isStage3 
            ? step < displayValue 
            : step <= displayValue;

          return (
            <div 
              key={step} 
              className={`blind-progress-bar__step ${isActive ? 'blind-progress-bar__step--active' : ''}`}
            >
              <div className="blind-progress-bar__fill"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlindProgressBar;