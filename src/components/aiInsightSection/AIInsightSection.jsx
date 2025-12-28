import React from "react";
import CompatibilityChart from "../compatibilityChart/CompatibilityChart";
import { IoCheckmarkCircle, IoWarning, IoBulb, IoAnalytics } from "react-icons/io5";
import "./AIInsightSection.css";

const AIInsightSection = ({ user }) => {
  // اگر دیتای insights هنوز لود نشده یا وجود ندارد، از مقادیر دیفالت استفاده کن
  const insights = user.insights || { synergies: [], frictions: [], dnaComparison: { me: {}, other: {} } };
  const score = user.matchScore || 0;
  
  // اگر هیچ تحلیل خاصی وجود نداشت (مثلاً برای کاربر جدید)
  const hasInsights = insights.synergies.length > 0 || insights.frictions.length > 0;

  return (
    <section className="ai-insight">
      <div className="ai-insight__header">
        <div className="ai-insight__header-icon-box">
           <IoAnalytics />
        </div>
        <div className="ai-insight__header-text">
            <h3 className="ai-insight__title">AI Relationship Dynamics</h3>
            <p className="ai-insight__subtitle">Why you match (and where you clash)</p>
        </div>
        <div className="ai-insight__score-badge">
            <span className="ai-insight__score-val">{score}%</span>
        </div>
      </div>

      <div className="ai-insight__content">
        
        {/* --- 1. بخش نمودار راداری (چپ) --- */}
        <div className="ai-insight__chart-column">
          <CompatibilityChart 
             myDNA={insights.dnaComparison?.me || user.dna} 
             otherDNA={insights.dnaComparison?.other || {}} 
          />
          <p className="ai-insight__chart-caption">Comparing your personality DNA vs. theirs</p>
        </div>

        {/* --- 2. بخش کارت‌های تحلیل (راست) --- */}
        <div className="ai-insight__cards-column">
          
          {/* اگر دیتایی نبود */}
          {!hasInsights && (
             <div className="ai-insight__empty">
                <p>Not enough data yet to generate deep insights. Keep chatting to learn more!</p>
             </div>
          )}

          {/* نقاط قوت (Synergies) */}
          {insights.synergies.map((item, idx) => (
            <div key={`syn-${idx}`} className="ai-card ai-card--synergy">
              <div className="ai-card__header">
                <IoCheckmarkCircle className="ai-card__icon" />
                <h4 className="ai-card__title">{item.title}</h4>
              </div>
              <p className="ai-card__desc">{item.description}</p>
              <div className="ai-card__tip-box">
                 <IoBulb className="ai-card__tip-icon"/>
                 <span className="ai-card__tip-text">{item.tip}</span>
              </div>
            </div>
          ))}

          {/* چالش‌ها (Frictions) */}
          {insights.frictions.map((item, idx) => (
            <div key={`fric-${idx}`} className="ai-card ai-card--friction">
              <div className="ai-card__header">
                <IoWarning className="ai-card__icon" />
                <h4 className="ai-card__title">{item.title}</h4>
              </div>
              <p className="ai-card__desc">{item.description}</p>
              <div className="ai-card__tip-box">
                 <IoBulb className="ai-card__tip-icon"/>
                 <span className="ai-card__tip-text">{item.tip}</span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default AIInsightSection;