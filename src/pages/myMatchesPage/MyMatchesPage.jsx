import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import "./MyMatchesPage.css";
import { useAuth } from "../../context/useAuth.js";
import { useMatchesStore } from "../../store/matchesStore";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";

const EMPTY_ARR = [];

const MyMatchesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const userId = currentUser?._id;

  const entry = useMatchesStore((state) => state.cache[`${userId ?? ""}:dashboard`]);
  const mutualMatches = entry?.mutualMatches ?? EMPTY_ARR;
  const sentLikes = entry?.sentLikes ?? EMPTY_ARR;
  const incomingLikes = entry?.incomingLikes ?? EMPTY_ARR;
  const superLikes = entry?.superLikes ?? EMPTY_ARR;
  const loading = useMatchesStore((state) => state.loading);
  const getDashboardCached = useMatchesStore((state) => state.getDashboardCached);
  const fetchDashboard = useMatchesStore((state) => state.fetchDashboard);

  const loadDashboard = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return;
      const cached = getDashboardCached(userId);
      const silent = cached && !forceRefresh;
      await fetchDashboard(API_URL, userId, silent);
    },
    [API_URL, userId, getDashboardCached, fetchDashboard]
  );

  useEffect(() => {
    if (!userId) return;
    loadDashboard();
  }, [userId, loadDashboard]);

  const userPlan = currentUser?.subscription?.plan || "free";

  const renderSection = (title, list, type, subtitle, showUpgradeCard = false) => {
    const displayList = list.slice(0, 20);

    return (
      <section className="matches-section">
        <div className="matches-section__header">
          <div className="matches-section__title-group">
            <h2 className="matches-section__title">{title}</h2>
            <p className="matches-section__subtitle">{subtitle}</p>
          </div>
          {list.length > 0 && (
             <button
                className="matches-section__see-all-btn"
                onClick={() => navigate(`/mymatches/view-all/${type}`)}
             >
                See All ({list.length})
             </button>
          )}
        </div>

        <div className="matches-section__list">
          {list.length === 0 ? (
             <div className="matches-section__empty">
                <p>No users found in this section.</p>
             </div>
          ) : (
             <>
               {displayList.map((user) => (
                 <UserCard
                   key={user._id}
                   user={user}
                 />
               ))}

               {showUpgradeCard && userPlan === 'free' && (
                  <div className="locked-card" onClick={() => navigate("/upgrade")}>
                    <div className="locked-card__icon">🔒</div>
                    <h3 className="locked-card__title">See Who Liked You</h3>
                    <p className="locked-card__text">
                      Upgrade to <span className="locked-card__highlight">GOLD</span> to reveal all photos instantly!
                    </p>
                  </div>
               )}
             </>
          )}
        </div>
      </section>
    );
  };

  if (loading && mutualMatches.length === 0 && sentLikes.length === 0 && incomingLikes.length === 0 && superLikes.length === 0) {
    return <HeartbeatLoader />;
  }

  return (
    <ExploreBackgroundLayout>
      <div className="matches-page">
        <header className="matches-page__header">
          <div className="matches-page__header-content">
            <h1 className="matches-page__title">My Connections</h1>
            <p className="matches-page__subtitle">Managing your matches and likes</p>
          </div>
          <div className="matches-page__badge">
            Plan: <span className="matches-page__badge-val">{userPlan.toUpperCase()}</span>
          </div>
        </header>

        <div className="matches-page__content">
          {renderSection(
            "Mutual Matches",
            mutualMatches,
            "mutual",
            "People you both liked each other"
          )}
          {renderSection(
            "Who Liked You",
            incomingLikes,
            "incoming",
            "They liked you! Swipe back to match.",
            true
          )}
          {renderSection(
            "Sent Likes",
            sentLikes,
            "sent",
            "People you've shown interest in"
          )}
          {renderSection(
            "Super Likes",
            superLikes,
            "superlikes",
            "People who Super Liked you ⭐"
          )}
        </div>
      </div>
    </ExploreBackgroundLayout>
  );
};

export default MyMatchesPage;
