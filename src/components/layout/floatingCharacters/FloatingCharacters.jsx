import React from "react";
import "./FloatingCharacters.css";

const FloatingCharacters = () => {
  return (
    <div className="silhouette-container">
      
      <div className="figure-wrapper left-figure">
        <svg viewBox="0 0 300 500" className="human-silhouette" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradPurpleSil" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#312e81", stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: "#6366f1", stopOpacity: 0.95 }} />
            </linearGradient>
            
            <linearGradient id="gradSymbolPurple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#a5b4fc", stopOpacity: 0.9 }} />
            </linearGradient>

            <filter id="glowPurple">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            
            <filter id="symbolGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          
          <path 
            d="M135,40 
               C155,40 165,50 165,70 C165,90 155,100 135,100 C115,100 105,90 105,70 C105,50 115,40 135,40 Z 
               M135,105 
               C160,110 180,115 190,125 
               L260,145 C275,150 275,160 260,165 
               L190,155 C180,160 175,170 170,180 
               L180,450 L155,450 L145,280 L125,280 L115,450 L90,450 L100,180 
               C95,170 85,150 80,135 
               L50,130 C40,125 40,115 50,110 
               L80,115 C100,110 115,105 135,105 Z"
            fill="url(#gradPurpleSil)"
            filter="url(#glowPurple)"
          />

          <g transform="translate(135, 70) scale(0.9)" filter="url(#symbolGlow)">
             <path d="M0,-10 C-6,-16 -15,-14 -18,-5 C-20,2 -15,8 0,20 C15,8 20,2 18,-5 C15,-14 6,-16 0,-10 Z" 
             fill="url(#gradSymbolPurple)" />
          </g>
        </svg>
      </div>

      <div className="connect-light"></div>

      <div className="figure-wrapper right-figure">
        <svg viewBox="0 0 300 500" className="human-silhouette" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradGreenSil" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#10b981", stopOpacity: 0.95 }} />
              <stop offset="100%" style={{ stopColor: "#064e3b", stopOpacity: 0.5 }} />
            </linearGradient>

            <linearGradient id="gradSymbolGreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#86efac", stopOpacity: 0.9 }} />
            </linearGradient>
            
            <filter id="glowGreen">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          
          <path 
             d="M135,40 
               C155,40 165,50 165,70 C165,90 155,100 135,100 C115,100 105,90 105,70 C105,50 115,40 135,40 Z 
               M135,105 
               C160,110 180,115 190,125 
               L260,145 C275,150 275,160 260,165 
               L190,155 C180,160 175,170 170,180 
               L180,450 L155,450 L145,280 L125,280 L115,450 L90,450 L100,180 
               C95,170 85,150 80,135 
               L50,130 C40,125 40,115 50,110 
               L80,115 C100,110 115,105 135,105 Z"
            fill="url(#gradGreenSil)"
            filter="url(#glowGreen)"
          />

          <g transform="translate(135, 140) scale(1.3)" filter="url(#symbolGlow)">
            <path d="M0,-10 C-6,-16 -15,-14 -18,-5 C-20,2 -15,8 0,20 C15,8 20,2 18,-5 C15,-14 6,-16 0,-10 Z" 
            fill="url(#gradSymbolGreen)" />
          </g>
        </svg>
      </div>

    </div>
  );
};

export default FloatingCharacters;