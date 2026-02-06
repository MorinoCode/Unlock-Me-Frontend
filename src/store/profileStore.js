import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export const PROFILE_CACHE_TTL_MS = CACHE_TTL_MS;

const cacheKey = (userId) => `profile:${userId ?? ""}`;

export const useProfileStore = create((set, get) => ({
  cache: {},
  loading: true,
  error: null,

  getCached: (userId) => {
    const key = cacheKey(userId);
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry;
  },

  setCached: (userId, profile) => {
    const key = cacheKey(userId);
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { profile: profile ?? null, fetchedAt: Date.now() },
      },
    }));
  },

  invalidate: (userId) => {
    const key = cacheKey(userId);
    set((state) => {
      const next = { ...state.cache };
      delete next[key];
      return { cache: next };
    });
  },

  fetchProfile: async (apiUrl, userId, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const res = await fetch(`${apiUrl}/api/user/user/${userId}`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to fetch profile");
      get().setCached(userId, data);
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
