import React from "react";
import CompatibilityChart from "../compatibilityChart/CompatibilityChart";
import "./AIInsightSection.css";

const AIInsightSection = ({ user }) => {
  const score = user.matchScore || 0;
  const dna = user.dna || { Logic: 50, Emotion: 50, Energy: 50, Creativity: 50, Discipline: 50 };

  const getMatchAnalysis = (s) => {
    if (s >= 95) return "Soulmate Paradox: Your cosmic alignment is nearly perfect. Every psychological layer suggests a profound, effortless connection.";
    if (s >= 85) return "High Resonance: Exceptional harmony detected. You both process emotions and logic on highly compatible frequencies.";
    if (s >= 70) return "Strong Synergy: Great potential for a balanced partnership where your strengths beautifully cover each other's gaps.";
    if (s >= 50) return "Curiosity Spark: A healthy mix of similarities and growth-triggering differences. A journey of discovery awaits.";
    return "Contrasting Dynamics: Your worldviews differ significantly, which could lead to a fascinating 'opposites attract' story.";
  };

  const getDnaTraitDesc = (trait, value) => {
    const labels = {
      Logic: value > 70 ? "Highly analytical and objective." : "Intuitive and pattern-oriented.",
      Emotion: value > 70 ? "Deeply empathetic and expressive." : "Stoic and emotionally contained.",
      Energy: value > 70 ? "Vibrant, active, and outgoing." : "Calm, reflective, and steady.",
      Creativity: value > 70 ? "Visionary and unconventional." : "Practical and tradition-valuing.",
      Discipline: value > 70 ? "Structured and highly organized." : "Spontaneous and adaptable."
    };
    return labels[trait];
  };

  return (
    <section className="ai-insight">
      <div className="ai-insight__header">
        <span className="ai-insight__icon">✨</span>
        <h3 className="ai-insight__title">AI Behavioral Analysis</h3>
      </div>

      <div className="ai-insight__content">
        <div className="ai-insight__chart-side">
          <CompatibilityChart dna={dna} />
        </div>
        <div className="ai-insight__text-side">
          <div className="ai-insight__verdict">
            <h4 className="ai-insight__heading">Overall Compatibility</h4>
            <p className="ai-insight__verdict-text">{getMatchAnalysis(score)}</p>
          </div>
          
          <div className="ai-insight__dna-section">
            <h4 className="ai-insight__heading">DNA Breakdown</h4>
            <div className="ai-insight__traits-list">
              {Object.entries(dna).map(([trait, value]) => (
                <div key={trait} className="ai-insight__trait-row">
                  <span className="ai-insight__trait-label">{trait}:</span>
                  <span className="ai-insight__trait-desc">{getDnaTraitDesc(trait, value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIInsightSection;