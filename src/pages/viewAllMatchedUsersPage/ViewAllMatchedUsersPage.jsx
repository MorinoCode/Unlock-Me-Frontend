import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

// Components
import UserCard from "../../components/userCard/UserCard";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import { Pagination } from "../../components/pagination/Pagination"; 

// Utils
import { getPromoBannerConfig } from "../../utils/subscriptionRules";

import "./ViewAllMatchedUsersPage.css";

const ViewAllMatchedUsersPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { currentUser } = useAuth();
  
  // State های جدید برای Pagination سمت سرور
  const [users, setUsers] = useState([]);
  const [userPlan, setUserPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const usersPerPage = 20;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const country = currentUser?.country;
        if (!country) return;

        // 1. ساخت کوئری پارامترها برای ارسال به بک‌اند جدید
        const queryParams = new URLSearchParams({
            country: country,
            category: category, // مثلا: 'soulmates', 'nearby'
            page: currentPage,
            limit: usersPerPage
        });

        // 2. درخواست به اندپوینت (بک‌اند الان فقط لیست همین صفحه را برمی‌گرداند)
        const res = await fetch(`${API_URL}/api/explore/matches?${queryParams}`, { 
            credentials: "include" 
        });
        
        if (!res.ok) throw new Error("Failed to fetch matches");

        const data = await res.json();
        
        // 3. دریافت داده‌ها از ساختار جدید بک‌اند
        setUserPlan(data.userPlan || "free");
        setUsers(data.users || []); // آرایه کاربران صفحه جاری
        
        // تنظیم تعداد کل صفحات برای کامپوننت Pagination
        if (data.pagination) {
            setTotalPages(data.pagination.totalPages);
        }

      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [category, currentPage, API_URL, currentUser]); // با تغییر Page ریکوئست جدید زده می‌شود

  // تنظیمات بنر تبلیغاتی
  const banners = getPromoBannerConfig(userPlan);

  // هندلر تغییر صفحه
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="matches-view-loading">
        <span className="matches-view-loading__text">Loading matches... 🔮</span>
    </div>
  );

  return (
    <ExploreBackgroundLayout>
      <div className="matches-view">
        <header className="matches-view__header">
          <button onClick={() => navigate(-1)} className="matches-view__back-button">
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
            users.map((user) => (
              <div key={user._id} className="matches-view__grid-item">
                {/* کاربرانی که از بک‌اند می‌آیند already filtered هستند */}
                <UserCard user={user} userPlan={userPlan} />
              </div>
            ))
          ) : (
            <p className="matches-view__empty-message">No matches found in this category.</p>
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