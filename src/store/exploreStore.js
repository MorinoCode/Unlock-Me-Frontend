import { create } from "zustand";

const INITIAL_SECTIONS = {
  soulmates: [],
  freshFaces: [],
  cityMatches: [],
  interestMatches: [],
  countryMatches: [],
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const BACKGROUND_REFRESH_MS = 5 * 60 * 1000; // 5 min

export const EXPLORE_CACHE_TTL_MS = CACHE_TTL_MS;
export const EXPLORE_BACKGROUND_REFRESH_MS = BACKGROUND_REFRESH_MS;
export { INITIAL_SECTIONS };

export const useExploreStore = create((set, get) => ({
  sections: INITIAL_SECTIONS,
  loading: true,
  error: null,
  lastFetchedAt: null,
  cacheUserId: null,
  cacheCountry: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      sections: INITIAL_SECTIONS,
      loading: true,
      error: null,
      lastFetchedAt: null,
      cacheUserId: null,
      cacheCountry: null,
    }),

  isCacheValid: (userId, country) => {
    const { sections, lastFetchedAt, cacheUserId, cacheCountry } = get();
    return (
      sections &&
      Object.keys(sections).length > 0 &&
      cacheUserId === userId &&
      cacheCountry === country &&
      lastFetchedAt != null &&
      Date.now() - lastFetchedAt < CACHE_TTL_MS
    );
  },

  fetchExplore: async (apiUrl, userId, country, silent = false, signal = null) => {
    try {
      if (!silent) {
        set({ loading: true, error: null });
      }

      const res = await fetch(`${apiUrl}/api/explore/matches`, {
        credentials: "include",
        signal: signal ?? undefined,
      });

      if (!res.ok) throw new Error("Failed to fetch matches");

      const data = await res.json();
      const newSections = data.sections || INITIAL_SECTIONS;

      set({
        sections: newSections,
        error: null,
        loading: false,
        lastFetchedAt: Date.now(),
        cacheUserId: userId,
        cacheCountry: country,
      });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) {
        set({ error: "explore.errorLoad", loading: false });
      } else if (!silent) {
        set({ loading: false });
      }
    }
  },
}));
