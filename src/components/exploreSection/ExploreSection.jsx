import React, { useCallback, useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import UserCard from "../userCard/UserCard";
import EmptyStateCard from "../emptyState/EmptyStateCard";
import PremiumLockCard from "../premiumLock/PremiumLockCard";
import { getSoulmatePermissions } from "../../utils/subscriptionRules";
import "./ExploreSection.css";

const getEmptyStateType = (sectionType) => {
  switch (sectionType) {
    case "city":
      return "cityMatches";
    case "fresh":
      return "freshFaces";
    case "interests":
      return "interestMatches";
    case "soulmates":
      return "soulmates";
    case "country":
      return "default";
    default:
      return "default";
  }
};

const LockedMoreCard = memo(({ count, onUpgrade, t }) => (
  <div className="explore-section__locked-more-card" onClick={onUpgrade}>
    <div className="explore-section__lock-icon" aria-hidden="true">
      💎
    </div>
    <h3 className="explore-section__locked-title">
      {t("explore.moreCount", { count })}
    </h3>
    <p className="explore-section__locked-desc">
      {t("explore.upgradeToSeeAll")}
    </p>
  </div>
));

LockedMoreCard.displayName = "LockedMoreCard";

const ExploreSection = ({
  title,
  subtitle,
  users,
  type,
  link,
  userPlan,
  navigate,
}) => {
  const { t } = useTranslation();
  // ✅ FIX: Memoize displayedUsers to prevent re-renders in downstream useMemo
  const displayedUsers = useMemo(() => users || [], [users]);

  const handleUpgrade = useCallback(() => {
    navigate("/upgrade");
  }, [navigate]);

  const handleSeeMore = useCallback(() => {
    if (link) navigate(link);
  }, [link, navigate]);

  const { visibleUsers, remainingCount, isSectionLocked, emptyType } =
    useMemo(() => {
      if (type === "soulmates") {
        const { isLocked, limit } = getSoulmatePermissions(userPlan);

        if (isLocked) {
          return { visibleUsers: [], remainingCount: 0, isSectionLocked: true };
        }

        const visible =
          limit === Infinity ? displayedUsers : displayedUsers.slice(0, limit);

        const remaining =
          limit === Infinity ? 0 : Math.max(0, displayedUsers.length - limit);

        return {
          visibleUsers: visible,
          remainingCount: remaining,
          isSectionLocked: false,
        };
      }

      return {
        visibleUsers: displayedUsers,
        remainingCount: 0,
        isSectionLocked: false,
        emptyType: getEmptyStateType(type),
      };
    }, [type, displayedUsers, userPlan]);

  if (type === "soulmates" && isSectionLocked) {
    return (
      <section className="explore-section" aria-labelledby={`${type}-title`}>
        <div className="explore-section__header">
          <div className="explore-section__header-group">
            <h2 id={`${type}-title`} className="explore-section__title">
              {title}
            </h2>
            <p className="explore-section__subtitle">{subtitle}</p>
          </div>
        </div>
        <PremiumLockCard
          onUnlock={handleUpgrade}
          feature="soulmates"
          userPlan={userPlan}
        />
      </section>
    );
  }

  return (
    <section className="explore-section" aria-labelledby={`${type}-title`}>
      <div className="explore-section__header">
        <div className="explore-section__header-group">
          <h2 id={`${type}-title`} className="explore-section__title">
            {title}
          </h2>
          <p className="explore-section__subtitle">{subtitle}</p>
        </div>
        {link && (
          <button
            className="explore-section__see-more-btn"
            onClick={handleSeeMore}
            aria-label={t("explore.seeMore") + " " + title}
          >
            {t("explore.seeMore")}
          </button>
        )}
      </div>

      <div className="explore-section__scroll-container">
        {displayedUsers.length > 0 ? (
          <>
            {visibleUsers.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}

            {remainingCount > 0 && (
              <LockedMoreCard
                count={remainingCount}
                onUpgrade={handleUpgrade}
                t={t}
              />
            )}
          </>
        ) : (
          <EmptyStateCard type={emptyType} userPlan={userPlan} />
        )}
      </div>
    </section>
  );
};

export default memo(ExploreSection);
