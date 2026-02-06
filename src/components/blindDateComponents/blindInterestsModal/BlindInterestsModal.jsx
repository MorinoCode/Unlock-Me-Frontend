import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./BlindInterestsModal.css";

const BlindInterestsModal = ({ session, onContinue, stage }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // محاسبه درصد مچ و سوالات مشترک
  const { matchPercentage, matchingTopics } = useMemo(() => {
    if (!session || !session.questions)
      return { matchPercentage: 0, matchingTopics: [] };

    // فیلتر کردن سوالات مربوط به همین استیج
    // نکته: در دیتابیس همه سوالات در یک آرایه هستند، باید بر اساس تعداد سوالات هر مرحله جدا کنیم
    // فرض بر این است که ۵ سوال اول برای مرحله ۱ و ۵ سوال دوم برای مرحله ۲ است
    const startIndex = stage === 1 ? 0 : 5;
    const endIndex = stage === 1 ? 5 : 10;

    // اگر سوالات مرحله ۲ هنوز لود نشده باشند (در مرحله ۱ هستیم)، فقط تا جایی که سوال هست چک میکنیم
    const stageQuestions = session.questions.slice(startIndex, endIndex);

    let matches = 0;
    const topics = [];

    stageQuestions.forEach((q) => {
      // اگر هر دو جواب داده‌اند و جواب‌ها برابر است
      if (
        q.u1Answer !== null &&
        q.u2Answer !== null &&
        q.u1Answer === q.u2Answer
      ) {
        matches++;
        // متن گزینه انتخاب شده رو پیدا میکنیم
        const answerText = q.questionId.options[q.u1Answer];
        topics.push(answerText);
      }
    });

    const percent =
      stageQuestions.length > 0 ? (matches / stageQuestions.length) * 100 : 0;
    return { matchPercentage: percent, matchingTopics: topics };
  }, [session, stage]);

  const handleClick = () => {
    setLoading(true);
    onContinue();
  };

  return (
    <div className="blind-interests-modal">
      <div className="blind-interests-modal__overlay"></div>
      <div className="blind-interests-modal__content">
        <div className="blind-interests-modal__score-ring">
          <span className="blind-interests-modal__score-value">
            {matchPercentage}%
          </span>
          <span className="blind-interests-modal__score-label">
            {t("blindDate.match")}
          </span>
        </div>

        <h2 className="blind-interests-modal__title">
          {t("blindDate.stageComplete", { stage })}
        </h2>

        {matchingTopics.length > 0 ? (
          <>
            <p className="blind-interests-modal__subtitle">
              {t("blindDate.youBothAgreed")}
            </p>
            <div className="blind-interests-modal__list">
              {matchingTopics.map((topic, idx) => (
                <span key={idx} className="blind-interests-modal__item">
                  {topic}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="blind-interests-modal__subtitle">
            {t("blindDate.oppositesAttract")}
          </p>
        )}

        <div className="blind-interests-modal__info-box">
          <p className="blind-interests-modal__info-text">
            {stage === 1
              ? t("blindDate.nextUpStage1")
              : t("blindDate.nextUpStage2")}
          </p>
        </div>

        <button
          className="blind-interests-modal__btn"
          onClick={handleClick}
          disabled={loading}
        >
          {loading
            ? t("blindDate.waitingPartner")
            : t("blindDate.unlockStage", { stage: stage + 1 })}
        </button>
      </div>
    </div>
  );
};

export default BlindInterestsModal;
