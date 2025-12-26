import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import ExploreSection from "../../components/exploreSection/ExploreSection";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import { getPromoBannerConfig } from "../../utils/subscriptionRules"; 
import { useAuth } from "../../context/useAuth";
import "./ExplorePage.css";

const ExplorePage = () => {
  const { currentUser } = useAuth();
  
  const [sections, setSections] = useState({ soulmates: [], freshFaces: [], cityMatches: [], interestMatches: [], countryMatches: [] });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!currentUser?.location?.country) return;

    const fetchMatches = async () => {
      try {
        setLoading(true);
        const matchesRes = await fetch(`${API_URL}/api/explore/matches?country=${currentUser.location.country}`, { credentials: "include" });
        const data = await matchesRes.json();
        console.log(data);
        
        setSections(data.sections || {});
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };

    fetchMatches();
  }, [currentUser, API_URL]);

  if (loading || !currentUser) return <HeartbeatLoader />;

  const userPlan = currentUser.subscription?.plan || "free";
  const banners = getPromoBannerConfig(userPlan);
  const location = currentUser.location;

  return (
    <ExploreBackgroundLayout>
      <div className="explore-page">
        
        <header className="explore-page__header">
          <div className="explore-page__text-container">
            <h1 className="explore-page__title">Explore</h1>
            <p className="explore-page__subtitle">Matches in {location.country}</p>
          </div>
          <div className="explore-page__badge">
            Plan: <span className="explore-page__badge-value">{userPlan.toUpperCase()}</span>
          </div>
        </header>

        <ExploreSection title="Near You" subtitle={`In ${location.city}`} users={sections.cityMatches} type="city" link="/explore/view-all/nearby" userPlan={userPlan} navigate={navigate} />

        <ExploreSection title="Fresh Faces" subtitle="New members" users={sections.freshFaces} type="fresh" link="/explore/view-all/new" userPlan={userPlan} navigate={navigate} />

        {banners.showBoost && (
          <PromoBanner title="Boost Your Matches! 🚀" desc="Get 5x more visibility." btnText="Answer More" onClick={() => navigate("/questions")} gradient="linear-gradient(90deg, #1e1b4b, #312e81)" />
        )}

        <ExploreSection title="Compatibility Vibes" subtitle="Shared interests" users={sections.interestMatches} type="interests" link="/explore/view-all/interests" userPlan={userPlan} navigate={navigate} />

        <ExploreSection title="The Soulmates" subtitle="80%+ matches" users={sections.soulmates} type="soulmates" link="/explore/view-all/soulmates" userPlan={userPlan} navigate={navigate} />

        {banners.showGold && (
          <PromoBanner title="Unlock Everything with Gold 🏆" desc="Unlimited city unlocks." btnText="Go Gold" onClick={() => navigate("/upgrade")} gradient="linear-gradient(90deg, #2e1065, #4c1d95)" />
        )}

        <ExploreSection title="Across the Country" subtitle={`In ${location.country}`} users={sections.countryMatches} type="country" link="/explore/view-all/country" userPlan={userPlan} navigate={navigate} />

      </div>
    </ExploreBackgroundLayout>
  );
};

export default ExplorePage;