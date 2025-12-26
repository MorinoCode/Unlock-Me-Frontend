import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import { Pagination } from "../../components/pagination/Pagination"; 
import "./ViewAllMatchesPage.css";

const ViewAllMatchesPage = () => {
  const { type } = useParams(); // type: 'mutual', 'sent', 'incoming'
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // State
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const usersPerPage = 20;

  // 1. تنظیم تایتل صفحه
  useEffect(() => {
    if (type === "mutual") setTitle("Mutual Matches");
    else if (type === "sent") setTitle("People You Liked");
    else if (type === "incoming") setTitle("People Who Liked You");
  }, [type]);

  // 2. فچ کردن دیتا با Pagination
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        // دریافت اطلاعات کاربر (برای چک کردن پلن)
        const userRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const userData = await userRes.json();
        setCurrentUser(userData);

        // آماده‌سازی پارامترها
        const queryParams = new URLSearchParams({
            type: type, 
            page: currentPage,
            limit: usersPerPage
        });

        // درخواست به اندپوینت جدید (matches-dashboard)
        const res = await fetch(`${API_URL}/api/explore/matches-dashboard?${queryParams}`, { 
            credentials: "include" 
        });
        
        if (!res.ok) throw new Error("Failed to fetch dashboard matches");
        
        const data = await res.json();

        setUsers(data.users || []);
        if (data.pagination) {
            setTotalPages(data.pagination.totalPages);
            setTotalCount(data.pagination.totalUsers);
        }

      } catch (err) {
        console.error("Error fetching all matches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [type, currentPage, API_URL]);

  // 3. هندل کردن محدودیت‌های پلن (Visual Locking)
  const userPlan = currentUser?.subscription?.plan || "free";
  
  const limits = {
    free: { mutual: 20, sent: 10, incoming: 0 },
    premium: { mutual: 100, sent: 50, incoming: 10 },
    gold: { mutual: 999, sent: 999, incoming: 999 }
  };
  
  // محاسبه ایندکس کلی کاربر در دیتابیس برای اعمال قفل
  // (چون صفحه صفحه می‌گیریم، باید ایندکس واقعی رو حساب کنیم)
  const baseIndex = (currentPage - 1) * usersPerPage;
  const currentLimit = limits[userPlan]?.[type] || 0;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="matches-loader">
      <div className="matches-loader__spinner"></div>
      <p className="matches-loader__text">Loading {type} connections...</p>
    </div>
  );

  return (
    <ExploreBackgroundLayout>
      <div className="matches-page">
        <header className="matches-page__header">
          <div className="matches-page__header-top">
            <button className="matches-page__back-btn" onClick={() => navigate(-1)}>
              <span className="matches-page__back-icon">←</span> Back
            </button>
            <div className="matches-page__plan-badge">
               PLAN: <span className="matches-page__plan-name">{userPlan.toUpperCase()}</span>
            </div>
          </div>
          <div className="matches-page__header-content">
            <h1 className="matches-page__title">{title}</h1>
            <p className="matches-page__count">Showing {totalCount} connections</p>
          </div>
        </header>

        <div className="matches-page__grid">
          {users.map((user, index) => {
            // محاسبه دقیق قفل بودن بر اساس ایندکس کلی
            const globalIndex = baseIndex + index;
            const isLocked = globalIndex >= currentLimit;

            return (
                <div 
                  className="matches-page__card-wrapper" 
                  key={user._id} 
                  style={{ "--delay": `${index * 0.05}s` }}
                >
                  <UserCard 
                    user={user} 
                    isLocked={isLocked} 
                    userPlan={userPlan} 
                  />
                </div>
            );
          })}
          
          {users.length === 0 && (
            <div className="matches-page__empty-state">
              <span className="matches-page__empty-icon">🔍</span>
              <p className="matches-page__empty-text">No connections found in this category.</p>
              <button className="matches-page__explore-btn" onClick={() => navigate("/explore")}>
                Explore People
              </button>
            </div>
          )}
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
           <div className="matches-view__pagination-wrapper" style={{marginTop: '2rem'}}>
              <Pagination 
                 currentPage={currentPage} 
                 totalPages={totalPages} 
                 onPageChange={handlePageChange} 
              />
           </div>
        )}

        {/* بنر ارتقا برای کاربران فری در لیست لایک‌های دریافتی */}
        {userPlan === "free" && type === "incoming" && (
          <div className="matches-page__upsell-banner" onClick={() => navigate("/upgrade")}>
            <div className="matches-page__upsell-info">
              <h2 className="matches-page__upsell-title">Reveal who liked you!</h2>
              <p className="matches-page__upsell-desc">Someone special is waiting in this list. Upgrade to Gold to unlock them instantly.</p>
            </div>
            <button className="matches-page__upsell-btn">Go Gold</button>
          </div>
        )}
      </div>
    </ExploreBackgroundLayout>
  );
};

export default ViewAllMatchesPage;