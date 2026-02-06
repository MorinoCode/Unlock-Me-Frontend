import { create } from "zustand";

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 min

export const CHAT_MESSAGES_CACHE_TTL_MS = CACHE_TTL_MS;

const EMPTY_ARR = [];

export const useChatMessagesStore = create((set, get) => ({
  cache: {},

  getCached: (receiverId) => {
    const key = receiverId ?? "";
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - (entry.fetchedAt ?? 0) > CACHE_TTL_MS) return null;
    return entry.messages ?? EMPTY_ARR;
  },

  setCached: (receiverId, messages) => {
    const key = receiverId ?? "";
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          messages: Array.isArray(messages) ? messages : [],
          fetchedAt: Date.now(),
        },
      },
    }));
  },

  appendMessage: (receiverId, message) => {
    const key = receiverId ?? "";
    set((state) => {
      const entry = state.cache[key];
      const list = entry?.messages ?? [];
      return {
        cache: {
          ...state.cache,
          [key]: {
            messages: [...list, message],
            fetchedAt: entry?.fetchedAt ?? Date.now(),
          },
        },
      };
    });
  },

  invalidate: (receiverId) => {
    const key = receiverId ?? "";
    set((state) => {
      const next = { ...state.cache };
      delete next[key];
      return { cache: next };
    });
  },

  fetchMessages: async (apiUrl, receiverId, silent, signal = null) => {
    try {
      const res = await fetch(`${apiUrl}/api/chat/${receiverId}`, {
        credentials: "include",
        cache: "no-store",
        signal: signal ?? undefined,
      });
      const list = await res.json();
      const messages = Array.isArray(list) ? list : [];
      get().setCached(receiverId, messages);
    } catch (err) {
      if (!silent && err.name !== "AbortError") throw err;
    }
  },

  reset: () => set({ cache: {} }),
}));
