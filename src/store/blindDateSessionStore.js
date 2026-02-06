import { create } from "zustand";

const CACHE_TTL_MS = 30 * 1000; // 30 sec (short because active session changes frequently)

export const BLIND_DATE_SESSION_CACHE_TTL_MS = CACHE_TTL_MS;

export const useBlindDateSessionStore = create((set, get) => ({
  session: null,
  fetchedAt: null,
  loading: false,
  error: null,

  getCached: () => {
    const { session, fetchedAt } = get();
    if (!session) return null;
    if (fetchedAt && Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return session;
  },

  setCached: (session) =>
    set({ session: session ?? null, fetchedAt: Date.now() }),

  fetchActiveSession: async (apiUrl, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const res = await fetch(`${apiUrl}/api/blind-date/active-session`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Failed to fetch session");
      get().setCached(data?.session ?? null);
      set({ loading: false, error: null });
    } catch (err) {
      if (err.name !== "AbortError" && !silent) {
        set({ loading: false, error: err.message });
      } else if (!silent) {
        set({ loading: false });
      }
    }
  },

  reset: () => set({ session: null, fetchedAt: null, loading: false, error: null }),
}));
