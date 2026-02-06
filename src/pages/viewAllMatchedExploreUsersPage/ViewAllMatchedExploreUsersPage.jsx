import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";

// Components
import UserCard from "../../components/userCard/UserCard";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import { Pagination } from "../../components/pagination/Pagination";

// Utils
import { getPromoBannerConfig } from "../../utils/subscriptionRules";
import { useExploreViewAllStore } from "../../store/exploreViewAllStore";

import "./ViewAllMatchedExploreUsersPage.css";

const usersPerPage = 20;

const ViewAllMatchedUsersPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { currentUser } = useAuth();
  const userId = currentUser?._id || currentUser?.userId;
  const country = currentUser?.location?.country;

  const getCached = useExploreViewAllStore((s) => s.getCached);
  const fetchViewAll = useExploreViewAllStore((s) => s.fetchViewAll);

  const [users, setUsers] = useState([]);
  const [userPlan, setUserPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!country || !userId) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    const ac = new AbortController();
    const cat = category || "";
    const page = currentPage;

    const applyCached = (c) => {
      if (!c || !mountedRef.current) return;
      setUsers(c.users ?? []);
      setUserPlan(c.userPlan ?? "free");
      setTotalPages(c.totalPages ?? 1);
    };

    const cached = getCached(userId, cat, page);

    if (cached) {
      applyCached(cached);
      queueMicrotask(() => setLoading(false));
      fetchViewAll(
        API_URL,
        userId,
        country,
        cat,
        page,
        usersPerPage,
        true,
        ac.signal
      ).then(() => {
        if (mountedRef.current) applyCached(getCached(userId, cat, page));
      });
    } else {
      queueMicrotask(() => setLoading(true));
      fetchViewAll(
        API_URL,
        userId,
        country,
        cat,
        page,
        usersPerPage,
        false,
        ac.signal
      )
        .then(() => {
          if (mountedRef.current) {
            applyCached(getCached(userId, cat, page));
            setLoading(false);
          }
        })
        .catch(() => {
          if (mountedRef.current) setLoading(false);
        });
    }

    return () => ac.abort();
  }, [
    category,
    currentPage,
    API_URL,
    country,
    userId,
    getCached,
    fetchViewAll,
  ]);

  // تنظیمات بنر تبلیغاتی
  const banners = getPromoBannerConfig(userPlan);

  // هندلر تغییر صفحه
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="matches-view-loading">
        <span className="matches-view-loading__text">
          Loading matches... 🔮
        </span>
      </div>
    );

  return (
    <ExploreBackgroundLayout>
      <div className="matches-view">
        <header className="matches-view__header">
          <button
            onClick={() => navigate(-1)}
            className="matches-view__back-button"
          >
            ← Back to Explore
          </button>
          <h1 className="matches-view__title">
            {category ? category.replace("-", " ").toUpperCase() : "MATCHES"}
          </h1>
        </header>

        {banners.showGold && (
          <div className="matches-view__promo-container matches-view__promo-container--top">
            <PromoBanner
              title="Unlock More with Gold 🏆"
              desc="See higher matches and city unlocks."
              btnText="Upgrade"
              onClick={() => navigate("/upgrade")}
              gradient="linear-gradient(90deg, #2e1065, #4c1d95)"
            />
          </div>
        )}

        <div className="matches-view__grid">
          {users.length > 0 ? (
            users.map((user, index) => (
              <div 
                key={user._id || `user-${index}`} 
                className="matches-view__grid-item"
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  willChange: 'transform, opacity'
                }}
              >
                {/* کاربرانی که از بک‌اند می‌آیند already filtered هستند */}
                <UserCard user={user} userPlan={userPlan} />
              </div>
            ))
          ) : (
            <p className="matches-view__empty-message">
              No matches found in this category.
            </p>
          )}
        </div>

        {/* فقط اگر صفحاتی وجود داشت پجینیشن را نشان بده */}
        {totalPages > 1 && (
          <div className="matches-view__pagination-wrapper">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {banners.showPlatinum && (
          <div className="matches-view__promo-container matches-view__promo-container--bottom">
            <PromoBanner
              title="Go Platinum 💎"
              desc="Reveal 100% matches instantly!"
              btnText="Get Platinum"
              onClick={() => navigate("/upgrade")}
              gradient="linear-gradient(90deg, #0f172a, #334155)"
            />
          </div>
        )}
      </div>
    </ExploreBackgroundLayout>
  );
};

export default ViewAllMatchedUsersPage;
