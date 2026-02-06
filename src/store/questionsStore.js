import { create } from "zustand";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const QUESTIONS_CACHE_TTL_MS = CACHE_TTL_MS;

const cacheKey = (categories) => categories.sort().join("_");

export const useQuestionsStore = create((set, get) => ({
  cache: {},
  loading: false,
  error: null,

  getCached: (categories) => {
    if (!Array.isArray(categories) || categories.length === 0) return null;
    const key = cacheKey(categories);
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry.questions;
  },

  setCached: (categories, questions) => {
    if (!Array.isArray(categories) || categories.length === 0) return;
    const key = cacheKey(categories);
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { questions: Array.isArray(questions) ? questions : [], fetchedAt: Date.now() },
      },
    }));
  },

  fetchQuestions: async (apiUrl, categories, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const res = await fetch(`${apiUrl}/api/user/onboarding/questions-by-category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ selectedCategories: categories }),
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch questions");
      const questions = Array.isArray(data) ? data : [];
      get().setCached(categories, questions);
      set({ loading: false, error: null });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) {
        set({ loading: false, error: err.message });
      } else if (!silent) {
        set({ loading: false });
      }
    }
  },

  reset: () => set({ cache: {}, loading: false, error: null }),
}));
