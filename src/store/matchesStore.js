import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export const MATCHES_CACHE_TTL_MS = CACHE_TTL_MS;

const dashboardKey = (userId) => `${userId ?? ""}:dashboard`;
const viewAllKey = (userId, type, page) => `${userId ?? ""}:${type ?? ""}:${page ?? 1}`;

export const useMatchesStore = create((set, get) => ({
  cache: {},
  loading: true,
  error: null,

  getDashboardCached: (userId) => {
    const key = dashboardKey(userId);
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry;
  },

  getViewAllCached: (userId, type, page) => {
    const key = viewAllKey(userId, type, page);
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry;
  },

  setDashboardCached: (userId, data) => {
    const key = dashboardKey(userId);
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          mutualMatches: data?.mutualMatches ?? [],
          sentLikes: data?.sentLikes ?? [],
          incomingLikes: data?.incomingLikes ?? [],
          superLikes: data?.superLikes ?? [],
          fetchedAt: Date.now(),
        },
      },
    }));
  },

  setViewAllCached: (userId, type, page, data) => {
    const key = viewAllKey(userId, type, page);
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          users: data?.users ?? [],
          pagination: data?.pagination ?? null,
          fetchedAt: Date.now(),
        },
      },
    }));
  },

  invalidateDashboard: (userId) => {
    const key = dashboardKey(userId);
    set((state) => {
      const next = { ...state.cache };
      delete next[key];
      return { cache: next };
    });
  },

  invalidateViewAll: (userId, type, page) => {
    const key = viewAllKey(userId, type, page);
    set((state) => {
      const next = { ...state.cache };
      delete next[key];
      return { cache: next };
    });
  },

  fetchDashboard: async (apiUrl, userId, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const res = await fetch(`${apiUrl}/api/user/matches/matches-dashboard`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to fetch");
      get().setDashboardCached(userId, data);
      set({ loading: false, error: null });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) {
        set({ loading: false, error: err.message });
      } else if (!silent) {
        set({ loading: false });
      }
    }
  },

  fetchViewAll: async (apiUrl, userId, type, page, limit = 20, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const qs = new URLSearchParams({ type, page, limit }).toString();
      const res = await fetch(`${apiUrl}/api/user/matches/matches-dashboard?${qs}`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to fetch");
      get().setViewAllCached(userId, type, page, data);
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

  reset: () => set({ cache: {}, loading: true, error: null }),
}));
