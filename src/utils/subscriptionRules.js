export const PLANS = {
  FREE: "free",
  GOLD: "gold",
  PREMIUM: "premium", // همان Platinum در منطق شما
};

/**
 * تعیین سقف امتیاز قابل مشاهده در بخش‌های عمومی (Near You, etc.)
 */
export const getVisibilityThreshold = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;

  switch (normalizedPlan) {
    case PLANS.PREMIUM:
    case "platinum":
      return 100; // مشاهده تا ۱۰۰٪ مچ
    case PLANS.GOLD:
      return 90;  // مشاهده تا ۹۰٪ مچ
    case PLANS.FREE:
    default:
      return 80;  // مشاهده تا ۸۰٪ مچ
  }
};

export const getSoulmatePermissions = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;
  switch (normalizedPlan) {
    case PLANS.PREMIUM:
    case "platinum":
      return { isLocked: false, limit: Infinity };
    case PLANS.GOLD:
      return { isLocked: false, limit: 5 }; // نمایش ۵ نفر برتر برای ترغیب به پلاتینیوم
    default:
      return { isLocked: true, limit: 0 };
  }
};

export const getPromoBannerConfig = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;
  switch (normalizedPlan) {
    case PLANS.PREMIUM:
    case "platinum":
      return { showGold: false, showPlatinum: false, showBoost: true };
    case PLANS.GOLD:
      return { showGold: false, showPlatinum: true, showBoost: true };
    default:
      return { showGold: true, showPlatinum: true, showBoost: true };
  }
};