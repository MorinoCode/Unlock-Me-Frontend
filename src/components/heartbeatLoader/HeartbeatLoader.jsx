import React from "react";
import "./HeartbeatLoader.css";

const HeartbeatLoader = ({ text = "Loading..." }) => {
  return (
    <div className="loader-overlay">
      <svg
        className="heartbeat-svg"
        viewBox="0 0 100 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="heartbeat-path"
          d="M0 25 L30 25 L40 10 L50 40 L60 25 L100 25"
        />
      </svg>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default HeartbeatLoader;