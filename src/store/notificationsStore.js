import { create } from "zustand";

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 min

export const NOTIFICATIONS_CACHE_TTL_MS = CACHE_TTL_MS;

export const useNotificationsStore = create((set, get) => ({
  list: null,
  fetchedAt: null,
  loading: false,
  error: null,

  getCached: () => {
    const { list, fetchedAt } = get();
    if (!list) return null;
    if (fetchedAt && Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return list;
  },

  setCached: (notifications) =>
    set({
      list: Array.isArray(notifications) ? notifications : [],
      fetchedAt: Date.now(),
    }),

  invalidate: () => set({ list: null, fetchedAt: null }),

  prependNotification: (notif) =>
    set((state) => ({
      list: notif
        ? [notif, ...(state.list || [])].slice(0, 20)
        : state.list,
    })),

  fetchNotifications: async (apiUrl, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const res = await fetch(`${apiUrl}/api/notifications`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch notifications");
      const list = Array.isArray(data?.notifications) ? data.notifications : [];
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

  reset: () =>
    set({ list: null, fetchedAt: null, loading: false, error: null }),
}));
