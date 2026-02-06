import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Calendar,
  DollarSign,
  Trash2,
  Clock,
  Check,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  ZoomIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./GoDateCard.css";

const GoDateCard = ({
  date,
  isOwner,
  onApply,
  onWithdraw,
  onAccept,
  onCancel,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const navigate = useNavigate();

  const [canCancelByTime, setCanCancelByTime] = useState(false);
  useEffect(() => {
    if (!date?.dateTime) {
      queueMicrotask(() => setCanCancelByTime(false));
      return;
    }
    const dt = new Date(date.dateTime);
    const hoursLeft = (dt.getTime() - Date.now()) / (1000 * 60 * 60);
    queueMicrotask(() => setCanCancelByTime(hoursLeft >= 24));
  }, [date?.dateTime]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "coffee":
        return "☕";
      case "food":
        return "🍽️";
      case "drink":
        return "🍷";
      case "movie":
        return "🎬";
      case "activity":
        return "🏃";
      default:
        return "📅";
    }
  };

  const handleApplyClick = async () => {
    setLoading(true);
    await onApply(date._id);
    setLoading(false);
  };

  const handleWithdrawClick = async () => {
    setLoading(true);
    await onWithdraw(date._id);
    setLoading(false);
  };

  const handleAcceptClick = (applicantId) => {
    toast(
      (toastId) => (
        <span className="godate-toast-wrap">
          {t("goDate.acceptPerson")}
          <div className="godate-toast-btns">
            <button
              type="button"
              className="godate-toast-confirm-btn"
              onClick={async () => {
                toast.dismiss(toastId.id);
                setLoading(true);
                await onAccept(date._id, applicantId);
                setLoading(false);
              }}
            >
              {t("goDate.accept")}
            </button>
            <button
              type="button"
              className="godate-toast-cancel-btn"
              onClick={() => toast.dismiss(toastId.id)}
            >
              {t("common.cancel")}
            </button>
          </div>
        </span>
      ),
      { duration: 10000 }
    );
  };

  const handleCancelClick = async () => {
    if (!onCancel) return;
    setLoading(true);
    await onCancel(date._id);
    setLoading(false);
  };

  const handleProfileClick = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  return (
    <>
      {/* Full Screen Image Modal */}
      {isImageExpanded && date.image && (
        <div
          className="godate-image-expanded-overlay"
          onClick={() => setIsImageExpanded(false)}
        >
          <button
            className="godate-close-expanded-btn"
            onClick={() => setIsImageExpanded(false)}
          >
            <X size={24} />
          </button>
          <img
            src={date.image}
            alt={date.title}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div
        className={`godate-card ${
          date.status === "closed" ? "godate-card--closed" : ""
        }`}
      >
        <div
          className={`godate-card-header ${
            !date.image ? "godate-header-gradient" : ""
          }`}
          style={date.image ? { backgroundImage: `url(${date.image})` } : {}}
          onClick={() => date.image && setIsImageExpanded(true)}
        >
          <div className="godate-badge">
            {getCategoryIcon(date.category)} {date.category}
          </div>

          {date.image && (
            <div className="godate-zoom-hint">
              <ZoomIn size={16} />
            </div>
          )}

          {isOwner && date.status !== "cancelled" && (
            <button
              className="godate-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(date._id);
              }}
              title={t("goDate.deleteDatePlanTitle")}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="godate-body">
          <h3 className="godate-title">{date.title}</h3>

          <div className="godate-meta">
            <div className="godate-meta-item">
              <Calendar size={14} className="godate-icon" />{" "}
              <span>{formatDate(date.dateTime)}</span>
            </div>
            <div className="godate-meta-item">
              <Clock size={14} className="godate-icon" />{" "}
              <span>{formatTime(date.dateTime)}</span>
            </div>
            <div className="godate-meta-item">
              <MapPin size={14} className="godate-icon" />{" "}
              <span>{date.location?.generalArea}</span>
            </div>
          </div>

          <div className="godate-payment">
            <DollarSign size={14} />
            <span>
              {date.paymentType === "me"
                ? t("goDate.iPay")
                : date.paymentType === "you"
                ? t("goDate.youPay")
                : t("goDate.split5050")}
            </span>
          </div>

          {/* Description Toggle */}
          {date.description && (
            <div className="godate-description-wrapper">
              <button
                className="godate-desc-toggle"
                onClick={() => setShowDesc(!showDesc)}
              >
                {showDesc ? t("goDate.hideDetails") : t("goDate.seeDescription")}
                {showDesc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showDesc && (
                <p className="godate-description-text">{date.description}</p>
              )}
            </div>
          )}

          {!isOwner && (
            <div
              className="godate-creator"
              onClick={() => handleProfileClick(date.creator?._id)}
            >
              <img
                src={date.creator?.avatar || "/default-avatar.png"}
                alt="creator"
              />
              <div className="godate-creator-info">
                <span className="creator-name">{date.creator?.name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="godate-footer">
          {isOwner ? (
            <div className="godate-applicants-wrapper">
              {date.status === "cancelled" ? (
                <div className="date-cancelled-badge">{t("goDate.cancelled")}</div>
              ) : date.acceptedUser ? (
                <div className="accepted-user-box">
                  <div className="accepted-label">{t("goDate.matchedWith")}</div>
                  <div className="applicant-row accepted-row">
                    <div
                      className="applicant-info"
                      onClick={() => handleProfileClick(date.acceptedUser._id)}
                    >
                      <img
                        src={date.acceptedUser.avatar || "/default-avatar.png"}
                        alt={date.acceptedUser.name}
                      />
                      <div className="applicant-details">
                        <span className="app-name">
                          {date.acceptedUser.name}
                        </span>
                      </div>
                    </div>
                    <button
                      className="chat-btn"
                      onClick={() => navigate(`/chat/${date.acceptedUser._id}`)}
                    >
                      <MessageSquare size={14} /> {t("goDate.chat")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                    <div className="applicants-header">
                    {t("goDate.requests")} ({date.applicants?.length || 0})
                  </div>
                  {date.applicants?.length > 0 ? (
                    <div className="applicants-list">
                      {date.applicants.map((app) => (
                        <div key={app._id} className="applicant-row">
                          <div
                            className="applicant-info"
                            onClick={() => handleProfileClick(app._id)}
                          >
                            <img
                              src={app.avatar || "/default-avatar.png"}
                              alt={app.name}
                            />
                            <div className="applicant-details">
                              <span className="app-name">
                                {app.name}, {app.age}
                              </span>
                            </div>
                          </div>
                          <button
                            className="accept-btn"
                            onClick={() => handleAcceptClick(app._id)}
                            disabled={loading}
                          >
                            <Check size={14} /> {t("goDate.accept")}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-applicants">{t("goDate.waitingForRequests")}</div>
                  )}
                </>
              )}
              {date.status !== "cancelled" && canCancelByTime && (
                <button
                  className="godate-cancel-date-btn"
                  onClick={handleCancelClick}
                  disabled={loading}
                  type="button"
                >
                  {t("goDate.cancelDate")}
                </button>
              )}
            </div>
          ) : (
            <div className="godate-actions">
              {date.status === "cancelled" ? (
                <div className="date-closed-badge">{t("goDate.cancelled")}</div>
              ) : date.status === "closed" ? (
                <div className="date-closed-badge">{t("goDate.dateClosed")}</div>
              ) : (
                <button
                  className={`apply-btn ${date.hasApplied ? "applied" : ""}`}
                  onClick={
                    date.hasApplied ? handleWithdrawClick : handleApplyClick
                  }
                  disabled={loading}
                >
                  {date.hasApplied ? t("goDate.withdrawRequest") : t("goDate.imInterested")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GoDateCard;
