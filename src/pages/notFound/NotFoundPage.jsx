import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleReport = () => {
    navigate("/report-problem");
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-number">404</h1>
        <h2 className="not-found-title">{t("notFound.pageTitle")}</h2>
        <p className="not-found-text">{t("notFound.message")}</p>
        <div className="not-found-actions">
          <button className="nf-btn nf-btn-primary" onClick={handleGoHome}>
            {t("notFound.returnHome")}
          </button>
          <button className="nf-btn nf-btn-secondary" onClick={handleReport}>
            {t("notFound.reportProblem")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;