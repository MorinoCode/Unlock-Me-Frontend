import { create } from "zustand";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const GEOCODE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const LOCATIONS_CACHE_TTL_MS = CACHE_TTL_MS;

const geocodeKey = (city, country) =>
  `${String(city || "").trim().toLowerCase()}_${String(country || "").trim().toLowerCase()}`;

export const useLocationsStore = create((set, get) => ({
  list: null,
  fetchedAt: null,
  loading: false,
  error: null,
  geocodeCache: {},

  getCached: () => {
    const { list, fetchedAt } = get();
    if (!list) return null;
    if (fetchedAt && Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return list;
  },

  setCached: (list) =>
    set({ list: Array.isArray(list) ? list : [], fetchedAt: Date.now() }),

  getGeocodeCached: (city, country) => {
    const key = geocodeKey(city, country);
    const entry = get().geocodeCache[key];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > GEOCODE_CACHE_TTL_MS) return null;
    return entry.result;
  },

  setGeocodeCached: (city, country, result) => {
    const key = geocodeKey(city, country);
    set((state) => ({
      geocodeCache: {
        ...state.geocodeCache,
        [key]: { result, fetchedAt: Date.now() },
      },
    }));
  },

  fetchGeocode: async (apiUrl, city, country, silent = false, signal = null) => {
    if (!city || !country) return null;
    const cached = get().getGeocodeCached(city, country);
    if (cached) return cached;
    try {
      const params = new URLSearchParams({ city, country });
      const res = await fetch(`${apiUrl}/api/locations/geocode?${params}`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) return null;
      if (data?.latitude != null && data?.longitude != null) {
        const result = { latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) };
        get().setGeocodeCached(city, country, result);
        return result;
      }
    } catch (err) {
      if (!silent && err.name !== "AbortError") console.error("Geocode error:", err);
    }
    return null;
  },

  fetchLocations: async (apiUrl, silent = false, signal = null) => {
    try {
      if (!silent) set({ loading: true, error: null });
      const res = await fetch(`${apiUrl}/api/locations`, {
        credentials: "include",
        signal: signal ?? undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch locations");
      const list = Array.isArray(data) ? data : [];
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

  reset: () => set({ list: null, fetchedAt: null, geocodeCache: {}, loading: false, error: null }),
}));
