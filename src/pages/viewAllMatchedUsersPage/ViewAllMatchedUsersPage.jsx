import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Components
import UserCard from "../../components/userCard/UserCard";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import { Pagination } from "../../components/pagination/Pagination"; 

// Utils
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

  useEffect(() => {
    const fetchAndFilterData = async () => {
      try {
        setLoading(true);
        const locRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const locData = await locRes.json();
        const country = locData.location?.country;
        if (!country) return;

        const res = await fetch(`${API_URL}/api/explore/matches?country=${country}`, { credentials: "include" });
        const data = await res.json();
        
        const sections = data.sections || {};
        const plan = data.userPlan || "free";
        setUserPlan(plan);

        const categoryMap = {
          nearby: sections.cityMatches,
          new: sections.freshFaces,
          interests: sections.interestMatches,
          soulmates: sections.soulmates,
          country: sections.countryMatches
        };

        let selectedUsers = categoryMap[category] || [];
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

  const totalPages = Math.ceil(allUsers.length / usersPerPage);
  const currentUsers = allUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const banners = getPromoBannerConfig(userPlan);

  if (loading) return <div className="view-all-loading">Loading matches... 🔮</div>;

  return (
    <ExploreBackgroundLayout>
      <div className="va-page-wrapper">
        <header className="va-header-section">
          <button onClick={() => navigate(-1)} className="va-back-btn">← Back to Explore</button>
          <h1 className="va-main-title">{category.replace("-", " ").toUpperCase()}</h1>
        </header>

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

        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={(page) => setCurrentPage(page)} 
        />

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