import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import ExploreSection from "../../components/ExploreSection/ExploreSection";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import { getPromoBannerConfig } from "../../utils/subscriptionRules"; 
import "./ExplorePage.css";

const ExplorePage = () => {
  const [sections, setSections] = useState({ soulmates: [], freshFaces: [], cityMatches: [], interestMatches: [], countryMatches: [] });
  const [userPlan, setUserPlan] = useState("free");
  const [userLocation, setUserLocation] = useState({ country: "", city: "" });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const locRes = await fetch(`${API_URL}/api/user/location`, { credentials: "include" });
        const locData = await locRes.json();
        if (!locData.location?.country) return setLoading(false);
        
        setUserLocation({ country: locData.location.country, city: locData.location.city });

        const matchesRes = await fetch(`${API_URL}/api/explore/matches?country=${locData.location.country}`, { credentials: "include" });
        const data = await matchesRes.json();
        
        setSections(data.sections || {});
        setUserPlan(data.userPlan || "free"); 
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [API_URL]);

  const banners = getPromoBannerConfig(userPlan);

  if (loading) return <div className="loading-container">Finding your matches... 🔮</div>;

  return (
    <ExploreBackgroundLayout>
      <div className="explore-page-container">
        
        <header className="explore-header">
          <div className="header-text">
            <h1>Explore</h1>
            <p>Matches in {userLocation.country}</p>
          </div>
          <div className="plan-badge">Plan: <span>{userPlan?.toUpperCase()}</span></div>
        </header>

        <ExploreSection title="Near You" subtitle={`In ${userLocation.city}`} users={sections.cityMatches} type="city" link="/explore/view-all/nearby" userPlan={userPlan} navigate={navigate} />

        <ExploreSection title="Fresh Faces" subtitle="New members" users={sections.freshFaces} type="fresh" link="/explore/view-all/new" userPlan={userPlan} navigate={navigate} />

        {banners.showBoost && (
          <PromoBanner title="Boost Your Matches! 🚀" desc="Get 5x more visibility." btnText="Answer More" onClick={() => navigate("/questions")} gradient="linear-gradient(90deg, #1e1b4b, #312e81)" />
        )}

        <ExploreSection title="Compatibility Vibes" subtitle="Shared interests" users={sections.interestMatches} type="interests" link="/explore/view-all/interests" userPlan={userPlan} navigate={navigate} />

        <ExploreSection title="The Soulmates" subtitle="80%+ matches" users={sections.soulmates} type="soulmates" link="/explore/view-all/soulmates" userPlan={userPlan} navigate={navigate} />

        {banners.showGold && (
          <PromoBanner title="Unlock Everything with Gold 🏆" desc="Unlimited city unlocks." btnText="Go Gold" onClick={() => navigate("/upgrade")} gradient="linear-gradient(90deg, #2e1065, #4c1d95)" />
        )}

        <ExploreSection title="Across the Country" subtitle={`In ${userLocation.country}`} users={sections.countryMatches} type="country" link="/explore/view-all/country" userPlan={userPlan} navigate={navigate} />

      </div>
    </ExploreBackgroundLayout>
  );
};

export default ExplorePage;