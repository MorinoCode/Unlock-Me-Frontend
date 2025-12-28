import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

const CompatibilityChart = ({ myDNA, otherDNA }) => {
  // اگر دیتای مقایسه وجود نداشت، فقط مال یوزر فعلی را نشان بده (fallback)
  const safeMyDNA = myDNA || { Logic: 50, Emotion: 50, Energy: 50, Creativity: 50, Discipline: 50 };
  
  // اگر دیتای طرف مقابل وجود نداشت، خالی بگذار
  const hasOther = otherDNA && Object.keys(otherDNA).length > 0;
  const safeOtherDNA = otherDNA || {};

  const data = [
    { subject: 'Logic', A: safeMyDNA.Logic, B: safeOtherDNA.Logic || 0, fullMark: 100 },
    { subject: 'Emotion', A: safeMyDNA.Emotion, B: safeOtherDNA.Emotion || 0, fullMark: 100 },
    { subject: 'Energy', A: safeMyDNA.Energy, B: safeOtherDNA.Energy || 0, fullMark: 100 },
    { subject: 'Creativity', A: safeMyDNA.Creativity, B: safeOtherDNA.Creativity || 0, fullMark: 100 },
    { subject: 'Discipline', A: safeMyDNA.Discipline, B: safeOtherDNA.Discipline || 0, fullMark: 100 },
  ];

  return (
    <div style={{ width: "100%", height: "260px", position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: "600" }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          {/* لایه من (بنفش) */}
          <Radar
            name="You"
            dataKey="A"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
          
          {/* لایه طرف مقابل (صورتی/قرمز) - فقط اگر دیتا باشد */}
          {hasOther && (
             <Radar
               name="Them"
               dataKey="B"
               stroke="#f43f5e"
               strokeWidth={2}
               fill="#f43f5e"
               fillOpacity={0.3}
             />
          )}

          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}/>
          <Tooltip 
             contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
             itemStyle={{ fontSize: "12px" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompatibilityChart;