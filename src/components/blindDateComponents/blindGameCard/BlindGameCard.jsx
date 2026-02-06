import React from "react";
import { useTranslation } from "react-i18next";
import "./BlindGameCard.css";

const BlindGameCard = ({ session, currentUser, socketRef }) => {
  const { t } = useTranslation();
  const currentQ = session.questions[session.currentQuestionIndex];
  const isUser1 =
    String(session.participants?.[0]) === String(currentUser?._id);
  const myAnswer = isUser1 ? currentQ.u1Answer : currentQ.u2Answer;
  const partnerAnswer = isUser1 ? currentQ.u2Answer : currentQ.u1Answer;

  const key = currentQ.questionId?.key;
  const questionText = key
    ? t(`blindDate.questions.${key}.text`, {
        defaultValue: currentQ.questionId?.text,
      }) || currentQ.questionId?.text
    : currentQ.questionId?.text;
  const getOptionText = (idx) => {
    if (!key) return currentQ.questionId?.options?.[idx] ?? "";
    const opt = t(`blindDate.questions.${key}.o${idx}`, {
      defaultValue: currentQ.questionId?.options?.[idx],
    });
    return (opt || currentQ.questionId?.options?.[idx]) ?? "";
  };

  const handleOptionClick = (index) => {
    if (myAnswer !== null) return;
    if (socketRef.current && session?._id) {
      socketRef.current.emit("submit_blind_answer", {
        sessionId: session._id,
        choiceIndex: index,
      });
    }
  };

  return (
    <div className="blind-game-card">
      <div className="blind-game-card__question-box">
        <h2 className="blind-game-card__text">{questionText}</h2>
      </div>

      <div className="blind-game-card__options-list">
        {(currentQ.questionId?.options || []).map((option, idx) => {
          const isSelectedByMe = myAnswer === idx;
          const isSelectedByPartner = partnerAnswer === idx;

          return (
            <button
              key={idx}
              className={`blind-game-card__option-btn 
                ${
                  isSelectedByMe ? "blind-game-card__option-btn--selected" : ""
                } 
                ${
                  isSelectedByPartner && myAnswer !== null
                    ? "blind-game-card__option-btn--partner"
                    : ""
                }`}
              onClick={() => handleOptionClick(idx)}
              disabled={myAnswer !== null}
            >
              <span className="blind-game-card__option-text">
                {getOptionText(idx)}
              </span>
              {isSelectedByPartner && myAnswer !== null && (
                <div className="blind-game-card__partner-indicator">
                  {t("blindDate.partnerChoseThis")}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {myAnswer !== null && partnerAnswer === null && (
        <div className="blind-game-card__waiting">
          <div className="blind-game-card__loader"></div>
          <p className="blind-game-card__waiting-text">
            {t("blindDate.waitingPartnerAnswer")}
          </p>
        </div>
      )}
    </div>
  );
};

export default BlindGameCard;
