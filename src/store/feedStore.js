import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export const FEED_CACHE_TTL_MS = CACHE_TTL_MS;

const cacheKey = (userId, tab) => `${userId ?? ""}:${tab ?? "global"}`;

export const useFeedStore = create((set, get) => ({
  cache: {},
  loading: true,
  error: null,

  getCached: (userId, tab) => {
    const key = cacheKey(userId, tab);
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry;
  },

  isCacheValid: (userId, tab) => get().getCached(userId, tab) != null,

  setCached: (userId, tab, data) => {
    const key = cacheKey(userId, tab);
    const posts = Array.isArray(data) ? data : (data?.posts ?? []);
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          posts,
          hasMore: data?.hasMore ?? false,
          nextPage: data?.nextPage ?? null,
          fetchedAt: Date.now(),
        },
      },
    }));
  },

  invalidate: (userId, tab) => {
    const key = cacheKey(userId, tab);
    set((state) => {
      const next = { ...state.cache };
      delete next[key];
      return { cache: next };
    });
  },

  updatePostInCache: (userId, tab, postId, patch) => {
    const key = cacheKey(userId, tab);
    set((state) => {
      const entry = state.cache[key];
      if (!entry) return state;
      const posts = entry.posts.map((p) =>
        p._id === postId ? { ...p, ...patch } : p
      );
      return {
        cache: {
          ...state.cache,
          [key]: { ...entry, posts },
        },
      };
    });
  },

  removePostFromCache: (userId, tab, postId) => {
    const key = cacheKey(userId, tab);
    set((state) => {
      const entry = state.cache[key];
      if (!entry) return state;
      const posts = entry.posts.filter((p) => p._id !== postId);
      return {
        cache: {
          ...state.cache,
          [key]: { ...entry, posts },
        },
      };
    });
  },

  fetchFeed: async (apiUrl, userId, tab, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });

      const endpoint =
        tab === "global" ? "/api/posts/feed" : "/api/posts/my-posts";
      const res = await fetch(`${apiUrl}${endpoint}`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data?.message || data?.error || "Failed to fetch");

      if (tab === "global") {
        get().setCached(userId, tab, {
          posts: data.posts ?? [],
          hasMore: data.hasMore ?? false,
          nextPage: data.nextPage ?? null,
        });
      } else {
        get().setCached(userId, tab, Array.isArray(data) ? data : []);
      }
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

  reset: () =>
    set({ cache: {}, loading: true, error: null }),
}));
