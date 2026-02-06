import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export const INBOX_CACHE_TTL_MS = CACHE_TTL_MS;

const cacheKey = (userId, type) => `${userId ?? ""}:${type ?? "active"}`;

export const useInboxStore = create((set, get) => ({
  cache: {},
  loading: true,
  error: null,

  getCached: (userId, type) => {
    const key = cacheKey(userId, type);
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry;
  },

  setCached: (userId, type, list) => {
    const key = cacheKey(userId, type);
    const conversations = Array.isArray(list) ? list : [];
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { conversations, fetchedAt: Date.now() },
      },
    }));
  },

  invalidate: (userId, type) => {
    const key = cacheKey(userId, type);
    set((state) => {
      const next = { ...state.cache };
      delete next[key];
      return { cache: next };
    });
  },

  invalidateAll: (userId) => {
    if (!userId) return;
    set((state) => {
      const next = { ...state.cache };
      delete next[cacheKey(userId, "active")];
      delete next[cacheKey(userId, "requests")];
      return { cache: next };
    });
  },

  removeConversation: (userId, type, conversationId) => {
    const key = cacheKey(userId, type);
    set((state) => {
      const entry = state.cache[key];
      if (!entry) return state;
      const conversations = entry.conversations.filter((c) => c._id !== conversationId);
      return {
        cache: {
          ...state.cache,
          [key]: { ...entry, conversations },
        },
      };
    });
  },

  fetchConversations: async (apiUrl, userId, type, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const res = await fetch(`${apiUrl}/api/chat/conversations?type=${type}`, {
        credentials: "include",
        cache: "no-store",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to fetch");
      const list = Array.isArray(data) ? data : [];
      get().setCached(userId, type, list);
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
