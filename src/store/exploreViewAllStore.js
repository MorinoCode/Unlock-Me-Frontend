import { create } from "zustand";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export const EXPLORE_VIEW_ALL_CACHE_TTL_MS = CACHE_TTL_MS;

const cacheKey = (userId, category, page) =>
  `${userId ?? ""}:${category ?? ""}:${page ?? 1}`;

export const useExploreViewAllStore = create((set, get) => ({
  // key -> { users, userPlan, totalPages, fetchedAt }
  cache: {},
  loading: true,
  error: null,

  getCached: (userId, category, page) => {
    const key = cacheKey(userId, category, page);
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry;
  },

  isCacheValid: (userId, category, page) => {
    return get().getCached(userId, category, page) != null;
  },

  setCached: (userId, category, page, data) => {
    const key = cacheKey(userId, category, page);
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          users: data.users ?? [],
          userPlan: data.userPlan ?? "free",
          totalPages: data.pagination?.totalPages ?? 1,
          fetchedAt: Date.now(),
        },
      },
    }));
  },

  fetchViewAll: async (
    apiUrl,
    userId,
    country,
    category,
    page,
    limit = 20,
    silent = false,
    signal = null
  ) => {
    try {
      if (!silent) set({ loading: true, error: null });

      const queryParams = new URLSearchParams({
        country: country || "",
        category: category || "",
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`${apiUrl}/api/explore/matches?${queryParams}`, {
        credentials: "include",
        signal: signal ?? undefined,
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const data = await res.json();
      const users = Array.isArray(data.users) ? data.users : [];
      const totalPages =
        data.pagination && typeof data.pagination.totalPages === "number"
          ? data.pagination.totalPages
          : 1;
      const userPlan = data.userPlan || "free";

      get().setCached(userId, category, page, {
        users,
        userPlan,
        pagination: { totalPages },
      });
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
