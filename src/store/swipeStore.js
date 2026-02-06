import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const BACKGROUND_REFRESH_MS = 5 * 60 * 1000; // 5 min

export const SWIPE_CACHE_TTL_MS = CACHE_TTL_MS;
export const SWIPE_BACKGROUND_REFRESH_MS = BACKGROUND_REFRESH_MS;

export const useSwipeStore = create((set, get) => ({
  cards: [],
  loading: true,
  error: null,
  lastFetchedAt: null,
  cacheUserId: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  setCards: (cards) =>
    set({
      cards: Array.isArray(cards) ? cards : [],
      lastFetchedAt: Date.now(),
    }),

  removeCard: (index) =>
    set((state) => ({
      cards: state.cards.filter((_, i) => i !== index),
    })),

  isCacheValid: (userId) => {
    const { cards, lastFetchedAt, cacheUserId } = get();
    return (
      Array.isArray(cards) &&
      cards.length > 0 &&
      cacheUserId === userId &&
      lastFetchedAt != null &&
      Date.now() - lastFetchedAt < CACHE_TTL_MS
    );
  },

  fetchCards: async (apiUrl, userId, silent = false, signal = null) => {
    try {
      if (!silent) {
        set({ loading: true, error: null });
      }

      const res = await fetch(`${apiUrl}/api/swipe/cards`, {
        credentials: "include",
        signal: signal ?? undefined,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch cards");
      }

      const list = Array.isArray(data) ? data : [];
      set({
        cards: list,
        loading: false,
        error: null,
        lastFetchedAt: Date.now(),
        cacheUserId: userId ?? null,
      });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) {
        set({ error: err.message || "swipe.errorLoad", loading: false });
      } else if (!silent) {
        set({ loading: false });
      }
    }
  },

  reset: () =>
    set({
      cards: [],
      loading: true,
      error: null,
      lastFetchedAt: null,
      cacheUserId: null,
    }),
}));
