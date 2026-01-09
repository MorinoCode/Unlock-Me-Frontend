import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import "./MyMatchesPage.css";
import { useAuth } from "../../context/useAuth.js";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";

const MyMatchesPage = () => {
  const [data, setData] = useState({
    mutualMatches: [],
    sentLikes: [],
    incomingLikes: [],
  });
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/user/matches/matches-dashboard`,
          { credentials: "include" }
        );
        const dashboardData = await res.json();
        setData(dashboardData);
        console.log(dashboardData);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const userPlan = currentUser?.subscription?.plan || "free";

  const renderSection = (title, list, type, subtitle, showUpgradeCard = false) => {
    // نمایش حداکثر ۲۰ کارت
    const displayList = list.slice(0, 20);
    
    // تعداد کارت‌های قفل شده (برای نمایش متن "+5 More")
    // این را می‌توانیم از روی تعداد isLocked ها بشماریم
    const lockedCount = list.filter(u => u.isLocked).length;

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
          {/* حالت خالی */}
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
                   // ✅ نکته: isLocked دیگر دستی پاس داده نمی‌شود
                   // چون داخل آبجکت user از سرور آمده است
                 />
               ))}

               {/* کارت تبلیغاتی اگر لیست قفل است یا ادامه دارد */}
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

  if (loading) return <HeartbeatLoader />;

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
          
          {/* 1. Mutual Matches (همیشه باز) */}
          {renderSection(
            "Mutual Matches",
            data.mutualMatches,
            "mutual",
            "People you both liked each other"
          )}

          {/* 2. Who Liked You (بسته برای رایگان) */}
          {/* پارامتر آخر true است تا بنر آپگرید نشان داده شود */}
          {renderSection(
            "Who Liked You",
            data.incomingLikes,
            "incoming",
            "They liked you! Swipe back to match.",
            true 
          )}

          {/* 3. Sent Likes */}
          {renderSection(
            "Sent Likes",
            data.sentLikes,
            "sent",
            "People you've shown interest in"
          )}

        </div>
      </div>
    </ExploreBackgroundLayout>
  );
};

export default MyMatchesPage;