import React from "react";
import "./BackgroundLayout.css";

const BackgroundLayout = ({ children }) => {
  return (
    <div className="background-layout">
      <div className="background-layout__content">
        {children}
      </div>
    </div>
  );
};

export default BackgroundLayout;