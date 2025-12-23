import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Components
import UserCard from "../../components/userCard/UserCard";
import EmptyStateCard from "../../components/emptyState/EmptyStateCard";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import PremiumLockCard from "../../components/premiumLock/PremiumLockCard";
// Utils & Rules
import { 
  getSoulmatePermissions, 
  getPromoBannerConfig, 
  getVisibilityThreshold 
} from "../../utils/subscriptionRules"; 
import "./ExplorePage.css";

const ExplorePage = () => {
  const [sections, setSections] = useState({
    soulmates: [],
    freshFaces: [],
    cityMatches: [],
    interestMatches: [],
    countryMatches: []
  });
  const [userPlan, setUserPlan] = useState("free");
  const [userLocation, setUserLocation] = useState({ country: "", city: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. دریافت لوکیشن کاربر از API
      const locationRes = await fetch(`${API_URL}/api/user/location`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!locationRes.ok) throw new Error("Location fetch failed");
      const locData = await locationRes.json();
      
      const country = locData.location?.country;
      const city = locData.location?.city;

      if (!country) {
        setError("Please update your location in profile settings.");
        setLoading(false);
        return;
      }
      setUserLocation({ country, city });

      // 2. دریافت مچ‌ها و پلن واقعی کاربر
      const matchesRes = await fetch(`${API_URL}/api/explore/matches?country=${country}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!matchesRes.ok) throw new Error("Matches fetch failed");
      
      const data = await matchesRes.json();
      
      // آپدیت استیت‌ها با دیتای بک‌اندر
      setSections(data.sections || {});
      setUserPlan(data.userPlan || "free"); 

    } catch (err) {
      console.error(err);
      setError("Could not load matches. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // دریافت تنظیمات بنرها بر اساس پلن از فایل Rules
  const banners = getPromoBannerConfig(userPlan);

  // --- Helper: Render Section Logic ---
  const RenderSection = ({ title, subtitle, users, type, emptyType = "default", link }) => {
    let displayedUsers = users || [];
    
    // دریافت سقف امتیاز مجاز برای این کاربر (80, 90 یا 100)
    const scoreThreshold = getVisibilityThreshold(userPlan);

    // 🔒 ۱. منطق بخش VIP (The Soulmates)
    if (type === "soulmates") {
      const { isLocked, limit } = getSoulmatePermissions(userPlan);

      // اگر کاربر Free باشد
      if (isLocked) {
        return (
          <div className="explore-section">
            <div className="section-header-wrapper">
               <div className="section-header-group">
                  <h2 className="section-title">{title}</h2>
                  <p className="section-subtitle">{subtitle}</p>
               </div>
            </div>
            <PremiumLockCard onUnlock={() => navigate("/upgrade")} />
          </div>
        );
      }

      // اگر کاربر Gold (محدود) یا Platinum (کامل) باشد
      const visibleUsers = displayedUsers.slice(0, limit);
      const remainingCount = Math.max(0, displayedUsers.length - limit);

      return (
        <div className="explore-section">
          <div className="section-header-wrapper">
              <div className="section-header-group">
                <h2 className="section-title">
                  {title} <span className="count">({displayedUsers.length})</span>
                </h2>
                <p className="section-subtitle">{subtitle}</p>
              </div>
              {link && <button className="see-all-btn" onClick={() => navigate(link)}>See All</button>}
          </div>

          <div className="horizontal-scroll">
            {displayedUsers.length > 0 ? (
              <>
                {visibleUsers.map((user) => (
                  <UserCard key={user._id} user={user} isLocked={false} userPlan={userPlan} />
                ))}

                {/* کارت قفل برای مچ‌های بالای 90% مخصوص کاربران Gold */}
                {userPlan === "gold" && remainingCount > 0 && (
                  <div className="locked-more-card" onClick={() => navigate("/upgrade")}>
                    <div className="lock-circle">💎</div>
                    <h3>+{remainingCount} More</h3>
                    <p>Upgrade to Platinum for 90%+ matches</p>
                  </div>
                )}
              </>
            ) : (
              <EmptyStateCard type={emptyType} />
            )}
          </div>
        </div>
      );
    }

    // 🛡️ ۲. فیلترینگ داینامیک برای بخش‌های عمومی (Near You, Fresh, etc.)
    // کاربران Free فقط تا 80%، Gold تا 90% و Platinum کل لیست را می‌بینند
    displayedUsers = displayedUsers.filter(u => (u.matchScore || 0) <= scoreThreshold);

    const hasUsers = displayedUsers.length > 0;

    return (
      <div className="explore-section">
        <div className="section-header-wrapper">
            <div className="section-header-group">
              <h2 className="section-title">
                {title} <span className="count">({displayedUsers.length})</span>
              </h2>
              <p className="section-subtitle">{subtitle}</p>
            </div>
            {link && <button className="see-all-btn" onClick={() => navigate(link)}>See All</button>}
        </div>
        
        <div className="horizontal-scroll">
          {hasUsers ? (
            displayedUsers.map((user) => (
              <UserCard 
                key={user._id} 
                user={user} 
                isLocked={false} 
                userPlan={userPlan}
              />
            ))
          ) : (
            <EmptyStateCard type={emptyType} />
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-container">Finding your matches... 🔮</div>;
  if (error) return <div className="loading-container" style={{color: '#ef4444'}}>{error}</div>;

  return (
    <div className="explore-page-container">
      
      {/* Header اصلی صفحه */}
      <div className="explore-header">
        <div className="header-text">
          <h1>Explore</h1>
          <p>Finding the best matches in {userLocation.country || "Your Area"}</p>
        </div>
        <div className="plan-badge">
          Plan: <span>{userPlan?.toUpperCase()}</span>
        </div>
      </div>

      {/* ۱. نزدیک شما (فیلتر شده بر اساس سقف پلن) */}
      <RenderSection 
        title="Near You"
        subtitle={`People in ${userLocation.city || "your city"}`}
        users={sections.cityMatches}
        type="city"
        emptyType="cityMatches"
        link="/explore/view-all/nearby"
      />

      {/* ۲. چهره‌های جدید */}
      <RenderSection 
        title="Fresh Faces"
        subtitle="New members who just joined this week"
        users={sections.freshFaces}
        type="fresh"
        emptyType="default"
        link="/explore/view-all/new"
      />

      {/* بنر مصرفی Boost */}
      {banners.showBoost && (
        <PromoBanner 
          title="Boost Your Matches! 🚀"
          desc="Get 5x more visibility by answering more questions."
          btnText="Answer More"
          onClick={() => navigate("/questions")}
          gradient="linear-gradient(90deg, #1e1b4b, #312e81)"
        />
      )}

      {/* ۳. علایق مشترک (Compatibility) */}
      <RenderSection 
        title="Compatibility Vibes"
        subtitle="People who share your hobbies and interests"
        users={sections.interestMatches}
        type="interests"
        emptyType="interestMatches"
        link="/explore/view-all/interests"
      />

      {/* ۴. سولمیت‌ها (بخش VIP با دسترسی پله‌ای) */}
      <RenderSection 
        title="The Soulmates"
        subtitle="Highest compatibility scores (80%+)"
        users={sections.soulmates}
        type="soulmates"
        emptyType="soulmates"
        link="/explore/view-all/soulmates"
      />

      {/* بنرهای ارتقا (شرطی) */}
      {banners.showGold && (
        <PromoBanner 
          title="Unlock Everything with Gold 🏆"
          desc="Unlimited city unlocks and see who liked you."
          btnText="Go Gold"
          onClick={() => navigate("/upgrade")}
          gradient="linear-gradient(90deg, #2e1065, #4c1d95)"
        />
      )}

      {banners.showPlatinum && (
        <PromoBanner 
          title="Go Platinum for Ultimate Access 💎"
          desc="Reveal all Soulmates and get priority support."
          btnText="Upgrade to Platinum"
          onClick={() => navigate("/upgrade")}
          gradient="linear-gradient(90deg, #0f172a, #334155)"
        />
      )}

      {/* ۵. سراسر کشور */}
      <RenderSection 
        title="Across the Country"
        subtitle={`More matches in ${userLocation.country}`}
        users={sections.countryMatches}
        type="country"
        emptyType="default"
        link="/explore/view-all/country"
      />

    </div>
  );
};

export default ExplorePage;