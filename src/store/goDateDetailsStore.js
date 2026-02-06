import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export const GO_DATE_DETAILS_CACHE_TTL_MS = CACHE_TTL_MS;

export const useGoDateDetailsStore = create((set, get) => ({
  cache: {},

  getCached: (dateId) => {
    const entry = get().cache[dateId ?? ""];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry.date;
  },

  setCached: (dateId, date) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [dateId ?? ""]: { date: date ?? null, fetchedAt: Date.now() },
      },
    }));
  },

  invalidate: (dateId) => {
    set((state) => {
      const next = { ...state.cache };
      delete next[dateId ?? ""];
      return { cache: next };
    });
  },

  fetchGoDateDetails: async (apiUrl, dateId, silent = false, signal = null) => {
    try {
      const res = await fetch(`${apiUrl}/api/go-date/${dateId}`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Failed to fetch date details");
      get().setCached(dateId, data);
    } catch (err) {
      if (!silent && err.name !== "AbortError") throw err;
    }
  },

  reset: () => set({ cache: {} }),
}));
