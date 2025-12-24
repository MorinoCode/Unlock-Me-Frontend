import React from "react";
import CompatibilityChart from "../compatibilityChart/CompatibilityChart";
import "./AIInsightSection.css"

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
    <section className="detail-card ai-insight-card">
      <div className="ai-header">
        <span className="ai-icon">✨</span>
        <h3 className="card-title">AI Behavioral Analysis</h3>
      </div>

      <div className="insight-content-wrapper">
        <div className="insight-chart-side">
          <CompatibilityChart dna={dna} />
        </div>
        <div className="insight-text-side">
          <div className="match-verdict">
            <h4>Overall Compatibility</h4>
            <p>{getMatchAnalysis(score)}</p>
          </div>
          
          <div className="dna-deep-dive">
            <h4>DNA Breakdown</h4>
            <div className="dna-traits-list">
              {Object.entries(dna).map(([trait, value]) => (
                <div key={trait} className="dna-trait-row">
                  <span className="trait-label">{trait}:</span>
                  <span className="trait-desc">{getDnaTraitDesc(trait, value)}</span>
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