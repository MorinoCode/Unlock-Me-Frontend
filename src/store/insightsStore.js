import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export const INSIGHTS_CACHE_TTL_MS = CACHE_TTL_MS;

export const useInsightsStore = create((set, get) => ({
  cache: {},

  getCached: (targetUserId) => {
    const entry = get().cache[targetUserId ?? ""];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry.data;
  },

  setCached: (targetUserId, data) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [targetUserId ?? ""]: { data: data ?? null, fetchedAt: Date.now() },
      },
    }));
  },

  fetchInsights: async (apiUrl, targetUserId, silent = false, signal = null) => {
    try {
      const res = await fetch(`${apiUrl}/api/user/matches/insights/${targetUserId}`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to fetch insights");
      get().setCached(targetUserId, data);
      return data;
    } catch (err) {
      if (!silent && err.name !== "AbortError") throw err;
      return null;
    }
  },

  reset: () => set({ cache: {} }),
}));
