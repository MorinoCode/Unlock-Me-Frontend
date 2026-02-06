import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PromoBanner from "../../components/promoBanner/PromoBanner";
import ExploreSection from "../../components/exploreSection/ExploreSection";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import { getPromoBannerConfig } from "../../utils/subscriptionRules";
import { useAuth } from "../../context/useAuth.js";
import {
  useExploreStore,
  EXPLORE_BACKGROUND_REFRESH_MS,
} from "../../store/exploreStore";
import "./ExplorePage.css";

const REQUEST_TIMEOUT_MS = 28000;

const ExplorePage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const sections = useExploreStore((s) => s.sections);
  const loading = useExploreStore((s) => s.loading);
  const error = useExploreStore((s) => s.error);
  const isCacheValid = useExploreStore((s) => s.isCacheValid);
  const fetchExplore = useExploreStore((s) => s.fetchExplore);
  const setLoading = useExploreStore((s) => s.setLoading);
  const setError = useExploreStore((s) => s.setError);

  const abortRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const userId = currentUser?._id || currentUser?.userId;
  const country = currentUser?.location?.country;

  useEffect(() => {
    if (!country || !userId) {
      setLoading(false);
      return;
    }

    const valid = isCacheValid(userId, country);

    if (valid) {
      setLoading(false);
      setError(null);
      abortRef.current = new AbortController();
      fetchExplore(API_URL, userId, country, true, abortRef.current.signal);
    } else {
      setLoading(true);
      setError(null);
      abortRef.current = new AbortController();
      timeoutRef.current = setTimeout(() => {
        if (abortRef.current) {
          abortRef.current.abort();
          setError("explore.errorTimeout");
          setLoading(false);
        }
      }, REQUEST_TIMEOUT_MS);
      fetchExplore(
        API_URL,
        userId,
        country,
        false,
        abortRef.current.signal
      ).finally(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      });
    }

    intervalRef.current = setInterval(() => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      fetchExplore(API_URL, userId, country, true, abortRef.current.signal);
    }, EXPLORE_BACKGROUND_REFRESH_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [country, userId, API_URL, isCacheValid, fetchExplore, setLoading, setError]);

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

  const banners = useMemo(() => getPromoBannerConfig(userPlan), [userPlan]);

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
            <p>{typeof error === "string" && error.startsWith("explore.") ? t(error) : error}</p>
            <button
              onClick={() => window.location.reload()}
              className="explore-page__retry-btn"
            >
              {t("explore.retry")}
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
            <p>{t("explore.errorLocation")}</p>
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
            <h1 className="explore-page__title">{t("explore.title")}</h1>
            <p className="explore-page__subtitle">
              {t("explore.subtitle", { country: location.country })}
            </p>
          </div>
          <div className="explore-page__badge">
            {t("explore.plan")}{" "}
            <span className="explore-page__badge-value">
              {userPlan.toUpperCase()}
            </span>
          </div>
        </header>

        {banners.showBoost && (
          <PromoBanner
            title={t("explore.bannerBoostTitle")}
            desc={t("explore.bannerBoostDesc")}
            btnText={t("explore.answerMore")}
            onClick={handleNavigateQuestions}
            gradient="linear-gradient(90deg, #1e1b4b, #312e81)"
          />
        )}

        <ExploreSection
          title={t("explore.nearYou")}
          subtitle={t("explore.inCity", { city: location.city })}
          users={sections.cityMatches}
          type="city"
          link="/explore/view-all/nearby"
          userPlan={userPlan}
          navigate={navigate}
        />
        {banners.showGold && (
          <PromoBanner
            title={t("explore.bannerGoldTitle1")}
            desc={t("explore.bannerGoldDesc1")}
            btnText={t("explore.goGold")}
            onClick={handleNavigateUpgrade}
            gradient="linear-gradient(90deg, #2e1065, #4c1d95)"
          />
        )}

        <ExploreSection
          title={t("explore.freshFaces")}
          subtitle={t("explore.newMembers")}
          users={sections.freshFaces}
          type="fresh"
          link="/explore/view-all/new"
          userPlan={userPlan}
          navigate={navigate}
        />

        {banners.showBoost && (
          <PromoBanner
            title={t("explore.updateGalleryTitle")}
            desc={t("explore.updateGalleryDesc")}
            btnText={t("explore.answerMore")}
            onClick={handleNavigateQuestions}
            gradient="linear-gradient(90deg, #1e1b4b, #312e81)"
          />
        )}

        <ExploreSection
          title={t("explore.compatibilityVibes")}
          subtitle={t("explore.sharedInterests")}
          users={sections.interestMatches}
          type="interests"
          link="/explore/view-all/interests"
          userPlan={userPlan}
          navigate={navigate}
        />

        <ExploreSection
          title={t("explore.theSoulmates")}
          subtitle={t("explore.soulmatesSubtitle")}
          users={sections.soulmates}
          type="soulmates"
          link="/explore/view-all/soulmates"
          userPlan={userPlan}
          navigate={navigate}
        />

        <ExploreSection
          title={t("explore.acrossCountry")}
          subtitle={t("explore.inCountry", { country: location.country })}
          users={sections.countryMatches}
          type="country"
          link="/explore/view-all/country"
          userPlan={userPlan}
          navigate={navigate}
        />

        {banners.showGold && (
          <PromoBanner
            title={t("explore.bannerGoldTitle2")}
            desc={t("explore.bannerGoldDesc2")}
            btnText={t("explore.goGold")}
            onClick={handleNavigateUpgrade}
            gradient="linear-gradient(90deg, #2e1065, #4c1d95)"
          />
        )}
      </div>
    </ExploreBackgroundLayout>
  );
};

export default ExplorePage;
