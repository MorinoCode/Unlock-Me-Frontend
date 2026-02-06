import { create } from "zustand";

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

export const USER_INTERESTS_CACHE_TTL_MS = CACHE_TTL_MS;

export const useUserInterestsStore = create((set, get) => ({
  data: null,
  fetchedAt: null,
  loading: false,
  error: null,

  getCached: () => {
    const { data, fetchedAt } = get();
    if (!data) return null;
    if (fetchedAt && Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return data;
  },

  setCached: (payload) =>
    set({ data: payload ?? null, fetchedAt: Date.now() }),

  invalidate: () => set({ data: null, fetchedAt: null }),

  fetchUserInterests: async (apiUrl, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const res = await fetch(`${apiUrl}/api/user/onboarding/get-user-interests`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch user interests");
      const payload = data?.userInterestedCategories != null ? { userInterestedCategories: data.userInterestedCategories } : null;
      get().setCached(payload);
      set({ loading: false, error: null });
      return payload;
    } catch (err) {
      if (err.name !== "AbortError" && !silent) {
        set({ loading: false, error: err.message });
      } else if (!silent) {
        set({ loading: false });
      }
      return null;
    }
  },

  reset: () => set({ data: null, fetchedAt: null, loading: false, error: null }),
}));
