import { create } from "zustand";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const INTERESTS_OPTIONS_CACHE_TTL_MS = CACHE_TTL_MS;

export const useInterestsOptionsStore = create((set, get) => ({
  options: null,
  list: null,
  fetchedAt: null,
  loading: false,
  error: null,

  getCached: () => {
    const { options, list, fetchedAt } = get();
    const data = options ?? list;
    if (!data) return null;
    if (fetchedAt && Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return data;
  },

  setCached: (list) => {
    const arr = Array.isArray(list) ? list : [];
    set({ options: arr, list: arr, fetchedAt: Date.now() });
  },

  fetchInterestsOptions: async (apiUrl, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const res = await fetch(`${apiUrl}/api/user/onboarding/interests-options`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch interests options");
      const list = Array.isArray(data) ? data : [];
      get().setCached(list);
      set({ loading: false, error: null });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) {
        set({ loading: false, error: err.message });
      } else if (!silent) {
        set({ loading: false });
      }
    }
  },

  fetchOptions: async (apiUrl, silent = false, signal = null) => {
    return get().fetchInterestsOptions(apiUrl, silent, signal);
  },

  reset: () => set({ options: null, list: null, fetchedAt: null, loading: false, error: null }),
}));
