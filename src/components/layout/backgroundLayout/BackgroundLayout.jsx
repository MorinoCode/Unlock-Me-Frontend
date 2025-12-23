import React from "react";
import FloatingCharacters from "../floatingCharacters/FloatingCharacters"; 
import "./BackgroundLayout.css";

const BackgroundLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <div className="background-effects">
        <div className="blob blob-purple"></div>
        <div className="blob blob-green"></div>
        <div className="blob blob-blue"></div>
        <div className="grid-overlay"></div>
      </div>

      <FloatingCharacters />

      <div className="content-wrapper">
        {children}
      </div>
    </div>
  );
};

export default BackgroundLayout;