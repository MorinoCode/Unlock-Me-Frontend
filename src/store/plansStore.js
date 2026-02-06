import { create } from "zustand";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const PLANS_CACHE_TTL_MS = CACHE_TTL_MS;

const cacheKey = (currency) => `plans_${(currency || "").toLowerCase() || "default"}`;

export const usePlansStore = create((set, get) => ({
  cache: {},
  loading: false,
  error: null,

  getCached: (currency) => {
    const key = cacheKey(currency);
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry.plans;
  },

  setCached: (currency, plans) => {
    const key = cacheKey(currency);
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { plans: Array.isArray(plans) ? plans : [], fetchedAt: Date.now() },
      },
    }));
  },

  fetchPlans: async (apiUrl, currency = "", silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const qs = currency ? `?currency=${encodeURIComponent(currency)}` : "";
      const res = await fetch(`${apiUrl}/api/payment/plans${qs}`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Failed to fetch plans");
      const plans = Array.isArray(data) ? data : [];
      get().setCached(currency, plans);
      set({ loading: false, error: null });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) set({ loading: false, error: err.message });
      else if (!silent) set({ loading: false });
    }
  },

  reset: () => set({ cache: {}, loading: false, error: null }),
}));
