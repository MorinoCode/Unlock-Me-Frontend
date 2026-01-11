// Frontend/src/utils/subscriptionRules.js

export const PLANS = {
  FREE: "free",
  GOLD: "gold",
  PLATINUM: "platinum",
};

// ---------------------------------------------
// 1. Soulmate Permissions (مورد نیاز ExploreSection)
// ---------------------------------------------
export const getSoulmatePermissions = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;

  switch (normalizedPlan) {
    case PLANS.PLATINUM:
      return { isLocked: false, limit: Infinity };
    case PLANS.GOLD:
      return { isLocked: false, limit: 5 }; 
    case PLANS.FREE:
    default:
      return { isLocked: true, limit: 0 };
  }
};

// ---------------------------------------------
// 2. Visibility Threshold (مورد نیاز ExploreSection)
// ---------------------------------------------
export const getVisibilityThreshold = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;

  switch (normalizedPlan) {
    case PLANS.PLATINUM:
      return 100; // مشاهده تا ۱۰۰٪
    case PLANS.GOLD:
      return 90;
    case PLANS.FREE:
    default:
      return 80;
  }
};

// ---------------------------------------------
// 3. Direct Message (DM) Limits (مورد نیاز Chat)
// ---------------------------------------------
export const getDailyDmLimit = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;

  switch (normalizedPlan) {
    case PLANS.PLATINUM:
      return 10;
    case PLANS.GOLD:
      return 5;
    case PLANS.FREE:
    default:
      return 0;
  }
};

// ---------------------------------------------
// 4. Swipe Limits
// ---------------------------------------------
export const getSwipeLimit = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;
  switch (normalizedPlan) {
    case PLANS.PLATINUM: return Infinity;
    case PLANS.GOLD: return 80;
    case PLANS.FREE: default: return 30;
  }
};

// ---------------------------------------------
// 5. Super Like Limits
// ---------------------------------------------
export const getSuperLikeLimit = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;
  switch (normalizedPlan) {
    case PLANS.PLATINUM: return Infinity;
    case PLANS.GOLD: return 5;
    case PLANS.FREE: default: return 1;
  }
};

// ---------------------------------------------
// 6. Blind Date Configuration
// ---------------------------------------------
export const getBlindDateConfig = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;
  switch (normalizedPlan) {
    case PLANS.PLATINUM: return { limit: Infinity, cooldownHours: 0 };
    case PLANS.GOLD: return { limit: 4, cooldownHours: 1 };
    case PLANS.FREE: default: return { limit: 2, cooldownHours: 4 };
  }
};

// ---------------------------------------------
// 7. Promo Banner Configuration
// ---------------------------------------------
export const getPromoBannerConfig = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;
  switch (normalizedPlan) {
    case PLANS.PLATINUM: return { showGold: false, showPlatinum: false, showBoost: true };
    case PLANS.GOLD: return { showGold: false, showPlatinum: true, showBoost: true };
    case PLANS.FREE: default: return { showGold: true, showPlatinum: true, showBoost: true };
  }
};

// ---------------------------------------------
// 8. Match List Limits (مورد نیاز MyMatches)
// ---------------------------------------------
export const getMatchListLimit = (plan, type) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;
  
  if (type === 'mutual') return Infinity; 

  if (type === 'incoming') { // Who liked you
    switch (normalizedPlan) {
      case PLANS.PLATINUM:
      case PLANS.GOLD:
        return Infinity; 
      case PLANS.FREE:
      default:
        return 0; // Locked for free
    }
  }

  if (type === 'sent') {
    switch (normalizedPlan) {
      case PLANS.PLATINUM: return Infinity;
      case PLANS.GOLD: return 50; 
      case PLANS.FREE: default: return 10;
    }
  }
  
  return 0;
};

// ---------------------------------------------
// 9. Go Date (Date Invite) Configuration ✅ NEW
// ---------------------------------------------
export const getGoDateConfig = (plan) => {
  const normalizedPlan = plan?.toLowerCase() || PLANS.FREE;
  
  switch (normalizedPlan) {
    case PLANS.PLATINUM: 
      return { 
        limitLabel: 'Unlimited', 
        canCreate: true,
        period: 'always'
      };
    case PLANS.GOLD: 
      return { 
        limitLabel: '1 per Week', 
        canCreate: true,
        period: 'week'
      };
    case PLANS.FREE: 
    default: 
      return { 
        limitLabel: '1 per Month', 
        canCreate: true,
        period: 'month'
      };
  }
};