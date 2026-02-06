import { create } from "zustand";

const CACHE_TTL_MS = 25 * 1000; // 25 sec (slightly less than backend 30s)

export const UNREAD_COUNT_CACHE_TTL_MS = CACHE_TTL_MS;

export const useUnreadCountStore = create((set, get) => ({
  count: null,
  fetchedAt: null,
  loading: false,

  getCached: () => {
    const { count, fetchedAt } = get();
    if (count === null || count === undefined) return null;
    if (fetchedAt && Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return count;
  },

  setCached: (count) =>
    set({ count: typeof count === "number" ? count : 0, fetchedAt: Date.now() }),

  increment: () => set((s) => ({ count: Math.min(99, (s.count ?? 0) + 1) })),

  fetchUnreadCount: async (apiUrl, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true });
      const res = await fetch(`${apiUrl}/api/chat/unread-count`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      const count = res.ok ? (data?.count ?? 0) : 0;
      get().setCached(count);
      set({ loading: false });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) set({ loading: false });
      else if (!silent) set({ loading: false });
    }
  },

  reset: () => set({ count: null, fetchedAt: null, loading: false }),
}));
