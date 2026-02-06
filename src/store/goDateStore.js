import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export const GO_DATE_CACHE_TTL_MS = CACHE_TTL_MS;

const cacheKey = (userId, tab, city, category) =>
  `${userId ?? ""}:${tab ?? "browse"}:${(city ?? "").toLowerCase()}:${(category ?? "all").toLowerCase()}`;

export const useGoDateStore = create((set, get) => ({
  cache: {},
  loading: true,
  error: null,

  getCached: (userId, tab, city, category) => {
    const key = cacheKey(userId, tab, city, category);
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry;
  },

  isCacheValid: (userId, tab, city, category) => {
    return get().getCached(userId, tab, city, category) != null;
  },

  setCached: (userId, tab, city, category, data) => {
    const key = cacheKey(userId, tab, city, category);
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { dates: Array.isArray(data) ? data : [], fetchedAt: Date.now() },
      },
    }));
  },

  fetchDates: async (
    apiUrl,
    userId,
    tab,
    city,
    category,
    silent = false,
    signal = null
  ) => {
    try {
      if (!silent) set({ loading: true, error: null });

      const endpoint = tab === "browse" ? "/api/go-date/all" : "/api/go-date/mine";
      let url = `${apiUrl}${endpoint}`;
      if (tab === "browse") {
        const params = new URLSearchParams();
        if (city) params.append("city", city);
        if (category && category !== "all") params.append("category", category);
        const qs = params.toString();
        if (qs) url += `?${qs}`;
      }

      const res = await fetch(url, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to fetch");

      const dates = Array.isArray(data) ? data : [];
      get().setCached(userId, tab, city, category, dates);
      set({ loading: false, error: null });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) {
        set({ loading: false, error: err.message });
      } else if (!silent) {
        set({ loading: false });
      }
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  setDatesInCache: (userId, tab, city, category, updater) => {
    const key = cacheKey(userId, tab, city, category);
    const entry = get().cache[key];
    if (!entry) return;
    const nextDates = typeof updater === "function" ? updater(entry.dates) : updater;
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { ...entry, dates: nextDates },
      },
    }));
  },

  reset: () => set({ cache: {}, loading: true, error: null }),
}));
