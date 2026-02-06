import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./BlindFinalReveal.css";
import Confetti from "react-confetti";

const BlindFinalReveal = ({ session, currentUser }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // پارتنر = کاربر دیگر (participants ممکن است string یا object با _id, name, avatar باشد)
  const { partnerId, partner } = useMemo(() => {
    if (!session?.participants?.length || !currentUser?._id)
      return { partnerId: null, partner: null };
    const myId = String(currentUser._id);
    const other = session.participants.find(
      (p) => String(p?._id ?? p) !== myId
    );
    const id = other != null ? String(other?._id ?? other) : null;
    return { partnerId: id, partner: typeof other === "object" ? other : null };
  }, [session, currentUser]);

  if (!partnerId) return null;

  const handleGoToChat = () => {
    navigate(`/chat/${partnerId}`);
  };

  const handleViewProfile = () => {
    navigate(`/user-profile/${partnerId}`);
  };

  return (
    <div className="blind-final-reveal">
      {/* افکت کاغذ رنگی برای جشن (اختیاری) */}
      <Confetti recycle={false} numberOfPieces={500} gravity={0.1} />

      <div className="blind-final-reveal__container">
        <header className="blind-final-reveal__header">
          <span className="blind-final-reveal__icon">✨</span>
          <h1 className="blind-final-reveal__title">
            {t("blindDate.itsAMatch")}
          </h1>
          <p className="blind-final-reveal__subtitle">
            {t("blindDate.bothSaidYes")}
          </p>
        </header>

        <div className="blind-final-reveal__profiles">
          {/* کارت من (سمت چپ/بالا) */}
          <div className="reveal-card reveal-card--me">
            <div className="reveal-card__image-box">
              <img
                src={currentUser.avatar || "/default-avatar.png"}
                alt={currentUser.name}
                className="reveal-card__img"
              />
            </div>
            <h3 className="reveal-card__name">
              {currentUser.name} {t("blindDate.you")}
            </h3>
          </div>

          {/* آیکون اتصال وسط */}
          <div className="blind-final-reveal__connector">
            <div className="connector-line"></div>
            <div className="connector-heart">💖</div>
            <div className="connector-line"></div>
          </div>

          {/* کارت پارتنر (سمت راست/پایین) */}
          <div className="reveal-card reveal-card--partner">
            <div className="reveal-card__image-box">
              <img
                src={partner?.avatar || "/default-avatar.png"}
                alt={partner?.name ?? ""}
                className="reveal-card__img reveal-card__img--animate"
              />
            </div>
            <h3 className="reveal-card__name">{partner?.name ?? "Partner"}</h3>
          </div>
        </div>

        <div className="blind-final-reveal__actions">
          <button
            className="reveal-btn reveal-btn--chat"
            onClick={handleGoToChat}
          >
            <span className="btn-icon">💬</span>
            {t("blindDate.startChatting")}
          </button>

          <button
            className="reveal-btn reveal-btn--profile"
            onClick={handleViewProfile}
          >
            {t("blindDate.viewFullProfile")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlindFinalReveal;
