import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  RiVipCrownFill,
  RiCheckLine,
  RiFlashlightFill,
  RiSparklingFill,
} from "react-icons/ri";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import { usePlansStore } from "../../store/plansStore";
import {
  PLANS,
  getDailyDmLimit,
  getSwipeLimit,
  getSuperLikeLimit,
  getBlindDateConfig,
  getVisibilityThreshold,
  getMatchListLimit,
  getSoulmatePermissions,
  getGoDateConfig,
} from "../../utils/subscriptionRules";
import "./UpgradePage.css";

// نگاشت کشور به ارز (کد ISO دو حرفی یا نام کشور) – هماهنگ با بک‌اند
const COUNTRY_TO_CURRENCY = {
  SE: "sek",
  SV: "sek",
  US: "usd",
  GB: "gbp",
  CA: "cad",
  AU: "aud",
  NZ: "nzd",
  DE: "eur",
  FR: "eur",
  IT: "eur",
  ES: "eur",
  NL: "eur",
  AT: "eur",
  BE: "eur",
  FI: "eur",
  IE: "eur",
  PT: "eur",
  NO: "nok",
  DK: "dkk",
  PL: "pln",
  CH: "chf",
  CZ: "czk",
  IN: "inr",
  JP: "jpy",
  CN: "cny",
  KR: "krw",
  BR: "brl",
  MX: "mxn",
  RU: "rub",
  AE: "aed",
  SA: "sar",
  EG: "egp",
  TR: "try",
  IL: "ils",
};

const CURRENCY_TO_LOCALE = {
  sek: "sv-SE",
  usd: "en-US",
  gbp: "en-GB",
  eur: "de-DE",
  nok: "nb-NO",
  dkk: "da-DK",
  pln: "pl-PL",
  chf: "de-CH",
  cad: "en-CA",
  aud: "en-AU",
  nzd: "en-NZ",
  inr: "en-IN",
  jpy: "ja-JP",
  cny: "zh-CN",
  krw: "ko-KR",
  brl: "pt-BR",
  mxn: "es-MX",
  rub: "ru-RU",
  aed: "ar-AE",
  sar: "ar-SA",
  egp: "ar-EG",
  try: "tr-TR",
  ils: "he-IL",
  czk: "cs-CZ",
};

function getCurrencyFromCountry(country) {
  if (!country || typeof country !== "string") return null;
  const code = country.trim().toUpperCase().slice(0, 2);
  return COUNTRY_TO_CURRENCY[code] || null;
}

function getCurrencyFromBrowser() {
  try {
    const lang = navigator.language || navigator.userLanguage || "";
    if (lang.startsWith("sv")) return "sek";
    if (lang.startsWith("en")) return "usd";
    if (
      lang.startsWith("de") ||
      lang.startsWith("fr") ||
      lang.startsWith("es") ||
      lang.startsWith("it")
    )
      return "eur";
    if (lang.startsWith("ja")) return "jpy";
    if (lang.startsWith("zh")) return "cny";
    if (lang.startsWith("ko")) return "krw";
    if (lang.startsWith("ar")) return "aed";
    if (lang.startsWith("pt")) return "brl";
    if (lang.startsWith("hi")) return "inr";
    if (lang.startsWith("ru")) return "rub";
  } catch { /* ignore */ }
  return "usd";
}

const PLAN_KEYS = {
  FREE: "free",
  GOLD: "gold",
  PLATINUM: "platinum",
  DIAMOND: "diamond",
};

const getPlanType = (productName) => {
  const name = (productName ?? "").toLowerCase();
  if (name.includes("diamond")) return PLAN_KEYS.DIAMOND;
  if (name.includes("platinum")) return PLAN_KEYS.PLATINUM;
  if (name.includes("gold")) return PLAN_KEYS.GOLD;
  if (name.includes("free")) return PLAN_KEYS.FREE;
  return null;
};

const getNormalizedPlan = (planType) => {
  if (planType === PLAN_KEYS.DIAMOND) return PLANS.DIAMOND;
  if (planType === PLAN_KEYS.PLATINUM) return PLANS.PLATINUM;
  if (planType === PLAN_KEYS.GOLD) return PLANS.GOLD;
  return PLANS.FREE;
};

/** Build feature list from subscriptionRules for a given plan type (free/gold/platinum/diamond). */
const getDynamicFeatures = (planType) => {
  const normalizedPlan = getNormalizedPlan(planType);
  if (!normalizedPlan) return [];

  const swipeLimit = getSwipeLimit(normalizedPlan);
  const dmLimit = getDailyDmLimit(normalizedPlan);
  const superLikeLimit = getSuperLikeLimit(normalizedPlan);
  const blindConfig = getBlindDateConfig(normalizedPlan);
  const visibility = getVisibilityThreshold(normalizedPlan);
  const seeLikes = getMatchListLimit(normalizedPlan, "incoming");
  const soulmate = getSoulmatePermissions(normalizedPlan);
  const goDate = getGoDateConfig(normalizedPlan);

  const features = [];

  features.push(
    swipeLimit === Infinity ? "Unlimited Likes" : `${swipeLimit} Likes per day`
  );

  features.push(
    dmLimit === Infinity
      ? "Unlimited Direct Messages"
      : dmLimit === 0
      ? "Direct Messages (unlock with paid plan)"
      : `${dmLimit} Direct Messages per day`
  );

  if (seeLikes === Infinity || seeLikes > 0) {
    features.push("See Who Liked You");
  }

  features.push(
    superLikeLimit === Infinity
      ? "Unlimited Super Likes"
      : `${superLikeLimit} Super Likes per day`
  );

  if (!soulmate.isLocked) {
    features.push(
      soulmate.limit === Infinity
        ? "Unlimited Soulmates (90%+ matches)"
        : `${soulmate.limit} Soulmates (90%+ matches)`
    );
  }

  if (blindConfig.limit === Infinity) {
    features.push("Unlimited Blind Dates (no cooldown)");
  } else {
    features.push(
      `${blindConfig.limit} Blind Dates (${blindConfig.cooldownHours}h cooldown)`
    );
  }

  if (visibility === 100) {
    features.push("See 100% of matches (full visibility)");
  } else if (visibility > 70) {
    features.push(`See up to ${visibility}% of matches`);
  }

  features.push(`Go Date: ${goDate.limitLabel}`);

  if (normalizedPlan === PLANS.PLATINUM) {
    features.push("Exclusive Badge on Profile");
    features.push("See Read Receipts");
    features.push("Advanced Filters (Height, Education)");
  }
  if (normalizedPlan === PLANS.DIAMOND) {
    features.push("All Platinum benefits");
    features.push("Unlimited everything");
    features.push("Priority Support");
  }
  if (normalizedPlan === PLANS.GOLD) {
    features.push("1 Free Monthly Boost");
    features.push("Turn off Ads");
  }
  if (normalizedPlan === PLANS.FREE) {
    features.push("Soulmates locked (upgrade to unlock)");
    features.push("Basic features only");
  }

  return features;
};

const FEATURES_VISIBLE_COLLAPSED = 4;

const UpgradePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [allPlansExpanded, setAllPlansExpanded] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const preferredCurrency = useMemo(() => {
    const fromCountry = getCurrencyFromCountry(currentUser?.location?.country);
    if (fromCountry) return fromCountry;
    return getCurrencyFromBrowser();
  }, [currentUser?.location?.country]);

  const cachedPlans = usePlansStore((s) => s.getCached(preferredCurrency));
  const loading = usePlansStore((s) => s.loading);
  const getCached = usePlansStore((s) => s.getCached);
  const fetchPlans = usePlansStore((s) => s.fetchPlans);
  const plans = useMemo(
    () => (Array.isArray(cachedPlans) ? cachedPlans : []).sort((a, b) => (a.amount ?? 0) - (b.amount ?? 0)),
    [cachedPlans]
  );

  const expandAll = useCallback(() => setAllPlansExpanded(true), []);
  const collapseAll = useCallback(() => setAllPlansExpanded(false), []);

  useEffect(() => {
    const cached = getCached(preferredCurrency);
    const silent = !!cached;
    fetchPlans(API_URL, preferredCurrency, silent);
  }, [API_URL, preferredCurrency, getCached, fetchPlans]);

  const formatPrice = useCallback((amount, currency) => {
    if (amount == null) return "—";
    const code = (currency ?? "usd").toLowerCase();
    const locale = CURRENCY_TO_LOCALE[code] || "en-US";
    const currencyUpper = (currency || "USD").toUpperCase();
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyUpper,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const handlePurchase = useCallback(
    async (priceId, productName) => {
      if (!currentUser) {
        toast.error("Please sign in first.");
        navigate("/login");
        return;
      }
      if (!priceId) {
        toast.error("Invalid plan.");
        return;
      }
      setProcessingId(priceId);
      try {
        const response = await fetch(`${API_URL}/api/payment/create-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ priceId, planName: productName }),
        });
        const data = await response.json();
        if (response.ok && data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.message || "Something went wrong.");
        }
      } catch (error) {
        console.error("Payment error:", error);
        toast.error("Network error. Please try again.");
      } finally {
        setProcessingId(null);
      }
    },
    [currentUser, navigate, API_URL]
  );

  const currentPlan = useMemo(() => {
    const p = (currentUser?.subscription?.plan ?? "free")
      .toString()
      .toLowerCase();
    return p === "diamond" || p === "platinum" || p === "gold" || p === "free"
      ? p
      : "free";
  }, [currentUser?.subscription?.plan]);

  const displayPlans = useMemo(() => {
    const fromApi = (Array.isArray(plans) ? plans : [])
      .filter((plan) => getPlanType(plan.productName) !== null)
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
    const hasDiamond = fromApi.some(
      (plan) => getPlanType(plan.productName) === PLAN_KEYS.DIAMOND
    );
    const freeCard = {
      id: "free",
      productName: "Free Plan",
      amount: null,
      currency: null,
      interval: "month",
      _static: true,
    };
    const diamondStaticCard = {
      id: "diamond-static",
      productName: "Diamond Plan",
      amount: null,
      currency: null,
      interval: "month",
      _static: true,
    };
    const result = [freeCard, ...fromApi];
    if (!hasDiamond) result.push(diamondStaticCard);
    return result;
  }, [plans]);

  return (
    <main className="upgrade-page" role="main">
      <div className="upgrade-page__bg-glow" aria-hidden="true" />

      <div className="upgrade-page__content">
        <header className="upgrade-page__header">
          <div className="upgrade-page__icon-box">
            <RiVipCrownFill aria-hidden="true" />
          </div>
          <h1 className="upgrade-page__title">Unlock Your Potential</h1>
          <p className="upgrade-page__subtitle">
            Get more matches, see who likes you, and find your connection
            faster.
          </p>
        </header>

        {loading ? (
          <div
            className="upgrade-page__loading"
            role="status"
            aria-live="polite"
          >
            <div className="upgrade-page__spinner" aria-hidden="true" />
            <p>Loading plans...</p>
          </div>
        ) : displayPlans.length === 0 ? (
          <div className="upgrade-page__empty" role="alert">
            <p>No plans available right now. Please try again later.</p>
          </div>
        ) : (
          <section
            className="upgrade-page__cards-grid"
            aria-label="Subscription plans"
          >
            {displayPlans.map((plan) => {
              const type =
                plan._static && plan.id === "free"
                  ? PLAN_KEYS.FREE
                  : plan._static && plan.id === "diamond-static"
                  ? PLAN_KEYS.DIAMOND
                  : getPlanType(plan.productName);
              if (!type) return null;
              const features = getDynamicFeatures(type);
              const isPlatinum = type === PLAN_KEYS.PLATINUM;
              const isDiamond = type === PLAN_KEYS.DIAMOND;
              const isFree = type === PLAN_KEYS.FREE;
              const isCurrentPlan = type === currentPlan;
              const isStaticDiamond =
                plan._static && plan.id === "diamond-static";
              const planKey = plan.id || type;
              const isGold = type === PLAN_KEYS.GOLD;
              const hasMoreFeatures =
                features.length > FEATURES_VISIBLE_COLLAPSED;
              const visibleFeatures =
                hasMoreFeatures && !allPlansExpanded
                  ? features.slice(0, FEATURES_VISIBLE_COLLAPSED)
                  : features;

              return (
                <article
                  key={planKey}
                  className={`plan-card plan-card--${type} ${
                    isCurrentPlan ? "plan-card--current" : ""
                  } ${allPlansExpanded ? "plan-card--expanded" : ""}`}
                  aria-labelledby={`plan-name-${planKey}`}
                >
                  {isCurrentPlan && (
                    <div className="plan-card__badge plan-card__badge--current">
                      Current Plan
                    </div>
                  )}
                  {!isCurrentPlan && isGold && (
                    <div className="plan-card__badge plan-card__badge--gold">
                      Great Value
                    </div>
                  )}
                  {!isCurrentPlan && isPlatinum && (
                    <div className="plan-card__badge plan-card__badge--platinum">
                      Most Popular
                    </div>
                  )}
                  {!isCurrentPlan && isDiamond && !isStaticDiamond && (
                    <div className="plan-card__badge plan-card__badge--diamond">
                      Best Value
                    </div>
                  )}
                  {!isCurrentPlan && isStaticDiamond && (
                    <div
                      className="plan-card__badge plan-card__badge--diamond"
                      title="Diamond is not in Stripe yet. Add it in Stripe to show price and purchase button."
                    >
                      Coming Soon
                    </div>
                  )}

                  <div className="plan-card__header">
                    <h2 id={`plan-name-${planKey}`} className="plan-card__name">
                      {plan.productName ??
                        type.charAt(0).toUpperCase() + type.slice(1) + " Plan"}
                    </h2>
                    <div className="plan-card__price">
                      {plan.amount != null
                        ? formatPrice(plan.amount, plan.currency)
                        : isFree
                        ? "Free"
                        : isStaticDiamond
                        ? "—"
                        : "—"}
                      {plan.amount != null && (
                        <span className="plan-card__interval">
                          /{plan.interval === "year" ? "yr" : "mo"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="plan-card__features-wrap"
                    id={`plan-features-${planKey}`}
                    role="region"
                    aria-label={`${type} plan features`}
                  >
                    <ul className="plan-card__features">
                      {visibleFeatures.map((feat, i) => (
                        <li key={i}>
                          {isDiamond ? (
                            <RiSparklingFill
                              className="plan-card__icon plan-card__icon--diamond"
                              aria-hidden="true"
                            />
                          ) : isPlatinum ? (
                            <RiFlashlightFill
                              className="plan-card__icon plan-card__icon--plat"
                              aria-hidden="true"
                            />
                          ) : (
                            <RiCheckLine
                              className="plan-card__icon"
                              aria-hidden="true"
                            />
                          )}
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    {hasMoreFeatures && (
                      <button
                        type="button"
                        className="plan-card__see-more"
                        onClick={allPlansExpanded ? collapseAll : expandAll}
                        aria-expanded={allPlansExpanded}
                        aria-controls={`plan-features-${planKey}`}
                      >
                        {allPlansExpanded ? "See less" : "See more"}
                      </button>
                    )}
                  </div>

                  {isCurrentPlan ? (
                    <div
                      className="plan-card__current-label"
                      aria-label="Your current plan"
                    >
                      Current plan
                    </div>
                  ) : isFree ? (
                    <div className="plan-card__current-label plan-card__current-label--muted">
                      Upgrade to get more
                    </div>
                  ) : isStaticDiamond ? (
                    <Link
                      to="/contact-us"
                      className={`plan-card__btn plan-card__btn--${type} plan-card__btn--link`}
                      aria-label="Contact us for Diamond"
                    >
                      Contact us
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={`plan-card__btn plan-card__btn--${type}`}
                      onClick={() => handlePurchase(plan.id, plan.productName)}
                      disabled={processingId === plan.id}
                      aria-busy={processingId === plan.id}
                      aria-label={`Get ${type}`}
                    >
                      {processingId === plan.id
                        ? "Processing..."
                        : `Get ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                    </button>
                  )}
                </article>
              );
            })}
          </section>
        )}

        <p className="upgrade-page__footer">
          Recurring billing. Cancel anytime. By continuing, you agree to our
          Terms of Service.
        </p>
      </div>
    </main>
  );
};

export default UpgradePage;
