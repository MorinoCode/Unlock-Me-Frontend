import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export const COMMENTS_CACHE_TTL_MS = CACHE_TTL_MS;

const EMPTY_ARR = [];

export const useCommentsStore = create((set, get) => ({
  cache: {},

  getCached: (postId) => {
    const entry = get().cache[postId ?? ""];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry.comments;
  },

  setCached: (postId, comments) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [postId ?? ""]: {
          comments: Array.isArray(comments) ? comments : [],
          fetchedAt: Date.now(),
        },
      },
    }));
  },

  invalidate: (postId) => {
    set((state) => {
      const next = { ...state.cache };
      delete next[postId ?? ""];
      return { cache: next };
    });
  },

  appendComment: (postId, comment) => {
    set((state) => {
      const entry = state.cache[postId ?? ""];
      if (!entry) return state;
      return {
        cache: {
          ...state.cache,
          [postId]: {
            ...entry,
            comments: [...entry.comments, comment],
          },
        },
      };
    });
  },

  removeComment: (postId, commentId) => {
    set((state) => {
      const entry = state.cache[postId ?? ""];
      if (!entry) return state;
      return {
        cache: {
          ...state.cache,
          [postId]: {
            ...entry,
            comments: entry.comments.filter((c) => c._id !== commentId),
          },
        },
      };
    });
  },

  fetchComments: async (apiUrl, postId, silent = false, signal = null) => {
    try {
      const res = await fetch(`${apiUrl}/api/posts/${postId}/comments`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch comments");
      const comments = Array.isArray(data) ? data : [];
      get().setCached(postId, comments);
    } catch (err) {
      if (!silent && err.name !== "AbortError") throw err;
    }
  },

  reset: () => set({ cache: {} }),
}));
