import React from "react";
import FloatingCharacters from "../floatingCharacters/FloatingCharacters"; 
import "./BackgroundLayout.css";

const BackgroundLayout = ({ children }) => {
  return (
    <div className="background-layout">
      <div className="background-layout__effects">
        <div className="background-layout__blob background-layout__blob--purple"></div>
        <div className="background-layout__blob background-layout__blob--green"></div>
        <div className="background-layout__blob background-layout__blob--blue"></div>
        <div className="background-layout__grid-overlay"></div>
      </div>

      <FloatingCharacters />

      <div className="background-layout__content">
        {children}
      </div>
    </div>
  );
};

export default BackgroundLayout;