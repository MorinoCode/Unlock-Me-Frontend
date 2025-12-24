import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserCard from "../../components/userCard/UserCard";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import { 
  getVisibilityThreshold, 
  getPromoBannerConfig, 
  getSoulmatePermissions 
} from "../../utils/subscriptionRules";
import "./ViewAllMatchedUsersPage.css";

const ViewAllMatchedUsersPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [allUsers, setAllUsers] = useState([]);
  const [userPlan, setUserPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  // 1. Logic: Fetch & Filter Data
  useEffect(() => {
    const fetchAndFilterData = async () => {
      try {
        setLoading(true);
        const locRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const locData = await locRes.json();
        const country = locData.location?.country;

        if (!country) return;

        const res = await fetch(`${API_URL}/api/explore/matches?country=${country}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await res.json();
        const sections = data.sections || {};
        const plan = data.userPlan || "free";
        setUserPlan(plan);

        // Map categories to sections
        const categoryMap = {
          nearby: sections.cityMatches,
          new: sections.freshFaces,
          interests: sections.interestMatches,
          soulmates: sections.soulmates,
          country: sections.countryMatches
        };

        let selectedUsers = categoryMap[category] || [];

        // Apply Business Rules
        const threshold = getVisibilityThreshold(plan);
        if (category !== "soulmates") {
          selectedUsers = selectedUsers.filter(u => (u.matchScore || 0) <= threshold);
        } else {
          const { limit } = getSoulmatePermissions(plan);
          selectedUsers = selectedUsers.slice(0, limit);
        }

        setAllUsers(selectedUsers);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterData();
  }, [category, API_URL]);

  // 2. Pagination Calculation
  const totalPages = Math.ceil(allUsers.length / usersPerPage);
  const currentUsers = allUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const banners = getPromoBannerConfig(userPlan);

  if (loading) return <div className="view-all-loading">Loading matches... 🔮</div>;

  return (
    <ExploreBackgroundLayout>
      <div className="va-page-wrapper">
        
        {/* --- Header Section --- */}
        <header className="va-header-section">
          <button onClick={() => navigate(-1)} className="va-back-btn">← Back to Explore</button>
          <h1 className="va-main-title">{category.replace("-", " ").toUpperCase()}</h1>
        </header>

        {/* --- Top Promo --- */}
        {banners.showGold && (
          <div className="va-top-promo-box">
            <PromoBanner 
              title="Unlock More with Gold 🏆" 
              desc="See higher matches and city unlocks." 
              btnText="Upgrade" 
              onClick={() => navigate("/upgrade")}
              gradient="linear-gradient(90deg, #2e1065, #4c1d95)"
            />
          </div>
        )}

        {/* --- Results Grid --- */}
        <div className="va-results-grid">
          {currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <div key={user._id} className="va-card-item">
                <UserCard user={user} userPlan={userPlan} />
              </div>
            ))
          ) : (
            <p className="va-no-data">No more matches found in this category.</p>
          )}
        </div>

        {/* --- Reusable Pagination --- */}
        {totalPages > 1 && (
          <div className="va-pagination-nav">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
            <span className="va-page-info">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
          </div>
        )}

        {/* --- Bottom Promo --- */}
        {banners.showPlatinum && (
          <div className="va-footer-upgrade-area">
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