import React from "react";
import { useTranslation } from "react-i18next";
import "./BlindRejected.css";

const BlindRejected = ({ onRetry }) => {
  const { t } = useTranslation();
  return (
    <div className="blind-rejected">
      <div className="blind-rejected__card">
        <div className="blind-rejected__icon-wrapper">
          <span className="blind-rejected__icon">💔</span>
        </div>

        <h2 className="blind-rejected__title">{t("blindDate.notAMatch")}</h2>

        <p className="blind-rejected__desc">{t("blindDate.partnerNoReveal")}</p>

        <div className="blind-rejected__divider"></div>

        <p className="blind-rejected__encouragement">
          {t("blindDate.plentyOthers")}
        </p>

        <button className="blind-rejected__btn" onClick={onRetry}>
          {t("blindDate.tryAgainBtn")}
        </button>
      </div>
    </div>
  );
};

export default BlindRejected;
