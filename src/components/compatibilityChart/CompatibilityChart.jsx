import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const CompatibilityChart = ({ dna }) => {
  if (!dna) return null;

  const data = [
    { subject: 'Logic', A: dna.Logic || 50, fullMark: 100 },
    { subject: 'Emotion', A: dna.Emotion || 50, fullMark: 100 },
    { subject: 'Energy', A: dna.Energy || 50, fullMark: 100 },
    { subject: 'Creativity', A: dna.Creativity || 50, fullMark: 100 },
    { subject: 'Discipline', A: dna.Discipline || 50, fullMark: 100 },
  ];

  return (
    <div style={{ width: "100%", height: "200px", minWidth: "250px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "#cbd5e1", fontSize: 10, fontWeight: "bold" }} 
          />
          <Radar
            name="User DNA"
            dataKey="A"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="#8b5cf6"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompatibilityChart;