import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import ExploreSection from "../../components/exploreSection/ExploreSection";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import { getPromoBannerConfig } from "../../utils/subscriptionRules";
import { useAuth } from "../../context/useAuth.js";
import "./ExplorePage.css";

const INITIAL_SECTIONS = {
  soulmates: [],
  freshFaces: [],
  cityMatches: [],
  interestMatches: [],
  countryMatches: [],
};

const ExplorePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.location?.country) {
      setLoading(false);
      return;
    }

    abortControllerRef.current = new AbortController();

    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setError("Request timeout. Please refresh the page.");
        setLoading(false);
      }
    }, 15000);

    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const matchesRes = await fetch(
          `${API_URL}/api/explore/matches`,
          {
            credentials: "include",
            signal: abortControllerRef.current.signal,
          }
        );

        if (!matchesRes.ok) {
          throw new Error("Failed to fetch matches");
        }

        const data = await matchesRes.json();
        setSections(data.sections || INITIAL_SECTIONS);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Failed to load matches. Please try again.");
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchMatches();

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentUser?.location?.country, API_URL]);

  const handleNavigateQuestions = useCallback(() => {
    navigate("/myprofile");
  }, [navigate]);

  const handleNavigateUpgrade = useCallback(() => {
    navigate("/upgrade");
  }, [navigate]);

  const userPlan = useMemo(
    () => currentUser?.subscription?.plan || "free",
    [currentUser?.subscription?.plan]
  );

  const banners = useMemo(
    () => getPromoBannerConfig(userPlan),
    [userPlan]
  );

  const location = useMemo(
    () => currentUser?.location,
    [currentUser?.location]
  );

  if (loading || !currentUser) {
    return <HeartbeatLoader />;
  }

  if (error) {
    return (
      <ExploreBackgroundLayout>
        <div className="explore-page">
          <div className="explore-page__error" role="alert">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="explore-page__retry-btn"
            >
              Retry
            </button>
          </div>
        </div>
      </ExploreBackgroundLayout>
    );
  }

  if (!location?.country) {
    return (
      <ExploreBackgroundLayout>
        <div className="explore-page">
          <div className="explore-page__error" role="alert">
            <p>Location information is missing. Please update your profile.</p>
          </div>
        </div>
      </ExploreBackgroundLayout>
    );
  }

  return (
    <ExploreBackgroundLayout>
      <div className="explore-page">
        <header className="explore-page__header">
          <div className="explore-page__text-container">
            <h1 className="explore-page__title">Explore</h1>
            <p className="explore-page__subtitle">
              Matches in {location.country}
            </p>
          </div>
          <div className="explore-page__badge">
            Plan:{" "}
            <span className="explore-page__badge-value">
              {userPlan.toUpperCase()}
            </span>
          </div>
        </header>

        {banners.showBoost && (
          <PromoBanner
            title="Boost Your Matches! 🚀"
            desc="Get 5x more visibility."
            btnText="Answer More"
            onClick={handleNavigateQuestions}
            gradient="linear-gradient(90deg, #1e1b4b, #312e81)"
          />
        )}

        <ExploreSection
          title="Near You"
          subtitle={`In ${location.city}`}
          users={sections.cityMatches}
          type="city"
          link="/explore/view-all/nearby"
          userPlan={userPlan}
          navigate={navigate}
        />
        {banners.showGold && (
          <PromoBanner
            title="See matches up to 90% with Gold and Up to 100% with platinum"
            desc="Better matches."
            btnText="Go Gold"
            onClick={handleNavigateUpgrade}
            gradient="linear-gradient(90deg, #2e1065, #4c1d95)"
          />
        )}

        <ExploreSection
          title="Fresh Faces"
          subtitle="New members"
          users={sections.freshFaces}
          type="fresh"
          link="/explore/view-all/new"
          userPlan={userPlan}
          navigate={navigate}
        />

        {banners.showBoost && (
          <PromoBanner
            title="Update your gallery and voice intro"
            desc="Get more visibility."
            btnText="Answer More"
            onClick={handleNavigateQuestions}
            gradient="linear-gradient(90deg, #1e1b4b, #312e81)"
          />
        )}

        <ExploreSection
          title="Compatibility Vibes"
          subtitle="Shared interests"
          users={sections.interestMatches}
          type="interests"
          link="/explore/view-all/interests"
          userPlan={userPlan}
          navigate={navigate}
        />

        <ExploreSection
          title="The Soulmates"
          subtitle="90%+ matches"
          users={sections.soulmates}
          type="soulmates"
          link="/explore/view-all/soulmates"
          userPlan={userPlan}
          navigate={navigate}
        />

        

        <ExploreSection
          title="Across the Country"
          subtitle={`In ${location.country}`}
          users={sections.countryMatches}
          type="country"
          link="/explore/view-all/country"
          userPlan={userPlan}
          navigate={navigate}
        />

        {banners.showGold && (
          <PromoBanner
            title="Unlock Everything with Gold 🏆"
            desc="Unlimited city unlocks."
            btnText="Go Gold"
            onClick={handleNavigateUpgrade}
            gradient="linear-gradient(90deg, #2e1065, #4c1d95)"
          />
        )}

      </div>
    </ExploreBackgroundLayout>
  );
};

export default ExplorePage;