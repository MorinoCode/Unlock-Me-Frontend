import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../../styles/design-tokens.css";
import "./BlindQueue.css";

const BlindQueue = ({ socketRef, onCancel }) => {
  const { t } = useTranslation();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);

    // دسترسی ایمن به سوکت فقط داخل useEffect
    const socket = socketRef.current;

    if (socket) {
      socket.on("match_found", () => {
        // لاجیک مربوط به مچ شدن در والد مدیریت می‌شود
      });
    }

    return () => {
      clearInterval(timer);
      if (socket) {
        socket.off("match_found");
      }
    };
  }, [socketRef]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  /* Dots around radar = "profiles" being scanned (angle in deg, radius % from center) */
  const scanDots = [
    { angle: 0, r: 38 },
    { angle: 50, r: 36 },
    { angle: 110, r: 40 },
    { angle: 170, r: 35 },
    { angle: 220, r: 38 },
    { angle: 270, r: 36 },
    { angle: 310, r: 39 },
    { angle: 350, r: 37 },
  ].map(({ angle, r }) => {
    const rad = (angle * Math.PI) / 180;
    const left = 50 + r * Math.cos(rad);
    const top = 50 - r * Math.sin(rad);
    return { left: `${left}%`, top: `${top}%` };
  });

  return (
    <div className="blind-queue-screen">
      <div className="blind-queue-screen__radar-wrapper">
        <div className="blind-queue-screen__radar-circle">
          <div className="blind-queue-screen__radar-dots" aria-hidden="true">
            {scanDots.map((pos, i) => (
              <span
                key={i}
                className="blind-queue-screen__radar-dot"
                style={{
                  left: pos.left,
                  top: pos.top,
                  animationDelay: `${i * 0.35}s`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="blind-queue-screen__radar-pulse"></div>
      </div>

      <div className="blind-queue-screen__content">
        <h2 className="blind-queue-screen__status-title">
          {t("blindDate.findingMatch")}
        </h2>
        <p className="blind-queue-screen__status-subtitle">
          {t("blindDate.analyzingProfiles")}
        </p>
        <div className="blind-queue-screen__timer-box">
          <span className="blind-queue-screen__timer-label">
            {t("blindDate.waitTime")}
          </span>
          <span className="blind-queue-screen__timer-value">
            {formatTime(seconds)}
          </span>
        </div>
      </div>

      <button className="blind-queue-screen__cancel-btn" onClick={onCancel}>
        {t("blindDate.leaveQueue")}
      </button>
    </div>
  );
};

export default BlindQueue;
