import { create } from "zustand";

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 min - status can change after usage

export const BLIND_DATE_STATUS_CACHE_TTL_MS = CACHE_TTL_MS;

export const useBlindDateStore = create((set, get) => ({
  accessStatus: null,
  statusLoading: true,
  error: null,
  lastFetchedAt: null,
  cacheUserId: null,

  setStatusLoading: (loading) => set({ statusLoading: loading }),
  setError: (error) => set({ error }),

  isCacheValid: (userId) => {
    const { accessStatus, lastFetchedAt, cacheUserId } = get();
    return (
      accessStatus != null &&
      cacheUserId === userId &&
      lastFetchedAt != null &&
      Date.now() - lastFetchedAt < CACHE_TTL_MS
    );
  },

  fetchStatus: async (apiUrl, userId, silent = false, signal = null) => {
    try {
      if (!silent) {
        set({ statusLoading: true, error: null });
      }

      const res = await fetch(`${apiUrl}/api/blind-date/status`, {
        credentials: "include",
        signal: signal ?? undefined,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch status");
      }

      set({
        accessStatus: data,
        statusLoading: false,
        error: null,
        lastFetchedAt: Date.now(),
        cacheUserId: userId ?? null,
      });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) {
        set({ statusLoading: false, error: err.message });
      } else if (!silent) {
        set({ statusLoading: false });
      }
    }
  },

  setAccessStatus: (status) => set({ accessStatus: status }),

  reset: () =>
    set({
      accessStatus: null,
      statusLoading: true,
      error: null,
      lastFetchedAt: null,
      cacheUserId: null,
    }),
}));
