import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  RiVipCrownFill,
  RiCloseLine,
  RiCheckLine,
  RiFlashlightFill,
  RiSparklingFill,
} from "react-icons/ri";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/useAuth";
import { usePlansStore } from "../../../store/plansStore";
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
} from "../../../utils/subscriptionRules.js";
import "./SubscriptionModal.css";

// نگاشت کشور به ارز (همان UpgradePage)
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

/** Build feature list from subscriptionRules (same as UpgradePage) */
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

  return features;
};

const SubscriptionModal = ({ onClose, message }) => {
  const { currentUser } = useAuth();
  const [processingId, setProcessingId] = useState(null);
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

  const currentPlan = useMemo(() => {
    const p = (currentUser?.subscription?.plan ?? "free")
      .toString()
      .toLowerCase();
    return p === "diamond" || p === "platinum" || p === "gold" || p === "free"
      ? p
      : "free";
  }, [currentUser?.subscription?.plan]);

  useEffect(() => {
    const cached = getCached(preferredCurrency);
    fetchPlans(API_URL, preferredCurrency, !!cached);
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

  const handleSubscribe = useCallback(
    async (priceId, productName) => {
      if (!priceId) return;
      setProcessingId(priceId);
      try {
        toast.loading("Redirecting to checkout...");
        const res = await fetch(`${API_URL}/api/payment/create-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ priceId, planName: productName }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          window.location.href = data.url;
        } else {
          toast.dismiss();
          toast.error(data.message || "Failed to initialize payment.");
        }
      } catch (err) {
        console.error(err);
        toast.dismiss();
        toast.error("Network error. Please try again.");
      } finally {
        setProcessingId(null);
      }
    },
    [API_URL]
  );

  const displayPlans = useMemo(() => {
    return (Array.isArray(plans) ? plans : [])
      .filter((plan) => getPlanType(plan.productName) !== null)
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  }, [plans]);

  return (
    <div className="sub-modal" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="sub-modal-title">
      <div className="sub-modal__content" onClick={(e) => e.stopPropagation()}>
        <button
          className="sub-modal__close-btn"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          <RiCloseLine />
        </button>

        <div className="sub-modal__header">
          <div className="sub-modal__icon-wrapper">
            <RiVipCrownFill aria-hidden="true" />
          </div>
          <h2 id="sub-modal-title" className="sub-modal__title">
            Unlock Full Access
          </h2>
          <p className="sub-modal__subtitle">
            {message || "Upgrade to match faster and chat freely!"}
          </p>
        </div>

        {loading ? (
          <div className="sub-modal__loading" role="status" aria-live="polite">
            <div className="sub-modal__spinner" aria-hidden="true" />
            <p>Loading plans...</p>
          </div>
        ) : displayPlans.length === 0 ? (
          <div className="sub-modal__empty" role="alert">
            <p>No plans available right now. Please try again later.</p>
          </div>
        ) : (
          <div
            className="sub-modal__plans-grid"
            aria-label="Subscription plans"
          >
            {displayPlans.map((plan) => {
              const type = getPlanType(plan.productName);
              if (!type) return null;
              const features = getDynamicFeatures(type);
              const isPlatinum = type === PLAN_KEYS.PLATINUM;
              const isDiamond = type === PLAN_KEYS.DIAMOND;
              const isGold = type === PLAN_KEYS.GOLD;
              const isCurrentPlan = type === currentPlan;
              const planKey = plan.id || type;

              return (
                <article
                  key={planKey}
                  className={`sub-modal__card sub-modal__card--${type} ${
                    isCurrentPlan ? "sub-modal__card--current" : ""
                  }`}
                  aria-labelledby={`sub-modal-plan-name-${planKey}`}
                >
                  {isCurrentPlan && (
                    <div className="sub-modal__badge sub-modal__badge--current">
                      Current Plan
                    </div>
                  )}
                  {!isCurrentPlan && isGold && (
                    <div className="sub-modal__badge sub-modal__badge--gold">
                      Great Value
                    </div>
                  )}
                  {!isCurrentPlan && isPlatinum && (
                    <div className="sub-modal__badge sub-modal__badge--platinum">
                      Most Popular
                    </div>
                  )}
                  {!isCurrentPlan && isDiamond && (
                    <div className="sub-modal__badge sub-modal__badge--diamond">
                      Best Value
                    </div>
                  )}

                  <div className="sub-modal__card-header">
                    <h3
                      id={`sub-modal-plan-name-${planKey}`}
                      className="sub-modal__plan-name"
                    >
                      {plan.productName ??
                        type.charAt(0).toUpperCase() + type.slice(1) + " Plan"}
                    </h3>
                    <div className="sub-modal__price">
                      {plan.amount != null
                        ? formatPrice(plan.amount, plan.currency)
                        : "—"}
                      {plan.amount != null && (
                        <span className="sub-modal__interval">
                          /{plan.interval === "year" ? "yr" : "mo"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="sub-modal__features-wrap"
                    id={`sub-modal-plan-features-${planKey}`}
                    role="region"
                    aria-label={`${type} plan features`}
                  >
                    <ul className="sub-modal__features-list">
                      {features.map((feat, i) => (
                        <li key={i}>
                          {isDiamond ? (
                            <RiSparklingFill
                              className="sub-modal__icon sub-modal__icon--diamond"
                              aria-hidden="true"
                            />
                          ) : isPlatinum ? (
                            <RiFlashlightFill
                              className="sub-modal__icon sub-modal__icon--plat"
                              aria-hidden="true"
                            />
                          ) : (
                            <RiCheckLine
                              className="sub-modal__icon"
                              aria-hidden="true"
                            />
                          )}
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isCurrentPlan ? (
                    <div
                      className="sub-modal__current-label"
                      aria-label="Your current plan"
                    >
                      Current plan
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`sub-modal__subscribe-btn sub-modal__subscribe-btn--${type}`}
                      onClick={() => handleSubscribe(plan.id, plan.productName)}
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
          </div>
        )}

        <p className="sub-modal__footer-text">
          Recurring billing. Cancel anytime. Secure payment via Stripe.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;
