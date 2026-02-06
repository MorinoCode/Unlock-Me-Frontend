import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import { Pagination } from "../../components/pagination/Pagination";
import "./ViewAllMatchesPage.css";
import { useAuth } from "../../context/useAuth.js";
import { useMatchesStore } from "../../store/matchesStore";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";

const EMPTY_USERS = [];
const usersPerPage = 20;

const ViewAllMatchesPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { currentUser } = useAuth();
  const userId = currentUser?._id;

  const [currentPage, setCurrentPage] = useState(1);

  const title = useMemo(() => {
    if (type === "mutual") return "Mutual Matches";
    if (type === "sent") return "People You Liked";
    if (type === "incoming") return "People Who Liked You";
    if (type === "superlikes") return "Super Likes ⭐";
    return "";
  }, [type]);

  const cacheKey = `${userId ?? ""}:${type ?? ""}:${currentPage}`;
  const entry = useMatchesStore((state) => state.cache[cacheKey]);
  const users = entry?.users ?? EMPTY_USERS;
  const pagination = entry?.pagination ?? null;
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.totalUsers ?? 0;

  const loading = useMatchesStore((state) => state.loading);
  const getViewAllCached = useMatchesStore((state) => state.getViewAllCached);
  const fetchViewAll = useMatchesStore((state) => state.fetchViewAll);

  const loadViewAll = useCallback(
    async (forceRefresh = false) => {
      if (!userId || !type) return;
      const cached = getViewAllCached(userId, type, currentPage);
      const silent = cached && !forceRefresh;
      await fetchViewAll(API_URL, userId, type, currentPage, usersPerPage, silent);
    },
    [API_URL, userId, type, currentPage, getViewAllCached, fetchViewAll]
  );

  useEffect(() => {
    if (!userId || !type) return;
    loadViewAll();
  }, [userId, type, currentPage, loadViewAll]);

  const userPlan = currentUser?.subscription?.plan || "free";

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoadingFirst = loading && users.length === 0;

  if (isLoadingFirst) {
    return (
      <div className="matches-loader">
        <div className="matches-loader__spinner"></div>
        <p className="matches-loader__text">Loading {type} connections...</p>
      </div>
    );
  }

  return (
    <ExploreBackgroundLayout>
      <div className="matches-page">
        <header className="matches-page__header">
          <div className="matches-page__header-content">
            <h1 className="matches-page__title">{title}</h1>
            <p className="matches-page__count">
              Showing {totalCount} connections
            </p>
          </div>
          <div className="matches-page__header-top">
            <button
              className="matches-page__back-btn"
              onClick={() => navigate(-1)}
            >
              <span className="matches-page__back-icon">←</span> Back
            </button>
            <div className="matches-page__plan-badge">
              PLAN:{" "}
              <span className="matches-page__plan-name">
                {userPlan.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <div className="matches-page__grid">
          {users.map((user, index) => {
            return (
              <div
                className="matches-page__card-wrapper"
                key={user._id}
                style={{ "--delay": `${index * 0.05}s` }}
              >
                <UserCard user={user} userPlan={userPlan} />
              </div>
            );
          })}

          {users.length === 0 && (
            <div className="matches-page__empty-state">
              <span className="matches-page__empty-icon">🔍</span>
              <p className="matches-page__empty-text">
                No connections found in this category.
              </p>
              <button
                className="matches-page__explore-btn"
                onClick={() => navigate("/explore")}
              >
                Explore People
              </button>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div
            className="matches-view__pagination-wrapper"
            style={{ marginTop: "2rem" }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {userPlan === "free" && type === "incoming" && (
          <div
            className="matches-page__upsell-banner"
            onClick={() => navigate("/upgrade")}
          >
            <div className="matches-page__upsell-info">
              <h2 className="matches-page__upsell-title">
                Reveal who liked you!
              </h2>
              <p className="matches-page__upsell-desc">
                Someone special is waiting in this list. Upgrade to Gold to
                unlock them instantly.
              </p>
            </div>
            <button className="matches-page__upsell-btn">Go Gold</button>
          </div>
        )}
      </div>
    </ExploreBackgroundLayout>
  );
};

export default ViewAllMatchesPage;
