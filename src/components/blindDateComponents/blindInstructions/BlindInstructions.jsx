import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./BlindInstructions.css";

const BlindInstructions = ({ onConfirm }) => {
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  const handleReady = () => {
    setIsReady(true);
    onConfirm();
  };

  return (
    <div className="blind-instructions">
      <div className="blind-instructions__card">
        <h1 className="blind-instructions__title">
          {t("blindDate.howItWorks")}
        </h1>

        <div className="blind-instructions__steps">
          <div className="blind-instructions__step">
            <div className="blind-instructions__step-icon">1️⃣</div>
            <div className="blind-instructions__step-content">
              <h3>{t("blindDate.step1Title")}</h3>
              <p>{t("blindDate.step1Desc")}</p>
            </div>
          </div>

          <div className="blind-instructions__step">
            <div className="blind-instructions__step-icon">2️⃣</div>
            <div className="blind-instructions__step-content">
              <h3>{t("blindDate.step2Title")}</h3>
              <p>{t("blindDate.step2Desc")}</p>
            </div>
          </div>

          <div className="blind-instructions__step">
            <div className="blind-instructions__step-icon">3️⃣</div>
            <div className="blind-instructions__step-content">
              <h3>{t("blindDate.step3Title")}</h3>
              <p>{t("blindDate.step3Desc")}</p>
            </div>
          </div>
        </div>

        <button
          className="blind-instructions__btn"
          onClick={handleReady}
          disabled={isReady}
        >
          {isReady ? t("blindDate.waitingPartner") : t("blindDate.iUnderstand")}
        </button>
      </div>
    </div>
  );
};

export default BlindInstructions;
