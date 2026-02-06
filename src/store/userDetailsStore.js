import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export const USER_DETAILS_CACHE_TTL_MS = CACHE_TTL_MS;

const cacheKey = (currentUserId, targetUserId) =>
  `${currentUserId ?? ""}:${targetUserId ?? ""}`;

export const useUserDetailsStore = create((set, get) => ({
  cache: {},
  loading: true,
  error: null,

  getCached: (currentUserId, targetUserId) => {
    const key = cacheKey(currentUserId, targetUserId);
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry.user;
  },

  setCached: (currentUserId, targetUserId, user) => {
    const key = cacheKey(currentUserId, targetUserId);
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { user: user ?? null, fetchedAt: Date.now() },
      },
    }));
  },

  fetchUserDetails: async (apiUrl, currentUserId, targetUserId, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const res = await fetch(`${apiUrl}/api/user/details/${targetUserId}`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch user");
      get().setCached(currentUserId, targetUserId, data);
      set({ loading: false, error: null });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) {
        set({ loading: false, error: err.message });
      } else if (!silent) {
        set({ loading: false });
      }
    }
  },

  reset: () => set({ cache: {}, loading: true, error: null }),
}));
