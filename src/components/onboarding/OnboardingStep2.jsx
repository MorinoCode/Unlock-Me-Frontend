import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import { useLocationsStore } from "../../store/locationsStore";
import "./onboardingSteps.css";

// کامپوننت SearchableSelect (بدون تغییر)
const SearchableSelect = memo(
  ({ options, value, onChange, placeholder, disabled, renderOption }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value || "");
    const wrapperRef = useRef(null);

    React.useLayoutEffect(() => {
      setSearchTerm(value || "");
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setIsOpen(false);
          setSearchTerm(value || "");
        }
      };
      // ✅ Mobile Support: Support both mouse and touch events
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }, [value]);

    const filteredOptions = useMemo(() => {
      return options.filter((opt) =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [options, searchTerm]);

    const handleInputChange = useCallback(
      (e) => {
        const text = e.target.value;
        setSearchTerm(text);
        setIsOpen(true);
        const exactMatch = options.find(
          (opt) => opt.name.toLowerCase() === text.toLowerCase()
        );
        if (exactMatch) onChange(exactMatch);
        else if (text === "") onChange(null);
      },
      [options, onChange]
    );

    const handleSelect = useCallback(
      (option) => {
        onChange(option);
        setSearchTerm(option.name);
        setIsOpen(false);
      },
      [onChange]
    );

    return (
      <div className="searchable-select" ref={wrapperRef}>
        <input
          className="searchable-select__input"
          type="text"
          value={searchTerm}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          autoComplete="off"
        />
        {isOpen && !disabled && filteredOptions.length > 0 && (
          <ul className="searchable-select__list">
            {filteredOptions.map((opt, index) => (
              <li
                key={opt.isoCode || `${opt.name}-${index}`}
                className="searchable-select__option"
                onClick={() => handleSelect(opt)}
              >
                {renderOption ? renderOption(opt) : opt.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

const OnboardingStep2 = ({
  formData,
  setFormData,
  onNext,
  onBack,
  loading,
}) => {
  const locationsList = useLocationsStore((s) => s.list);
  const availableLocations = Array.isArray(locationsList) ? locationsList : [];
  const fetchingLoc = useLocationsStore((s) => s.loading);
  const locError = useLocationsStore((s) => s.error);
  const getLocationsCached = useLocationsStore((s) => s.getCached);
  const fetchLocations = useLocationsStore((s) => s.fetchLocations);
  const [locationStatus, setLocationStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const cached = getLocationsCached();
    if (cached) return;
    fetchLocations(API_URL, false);
  }, [API_URL, getLocationsCached, fetchLocations]);
  useEffect(() => {
    if (locError) setErrorMessage("Failed to load locations.");
  }, [locError]);

  // ✅ Mobile Optimization: Detect if running on mobile device
  const isMobile = useMemo(() => {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }, []);

  // Function to request location (reusable) - Optimized for Mobile (Android/iOS)
  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("Geolocation not supported by this browser.");
      setHasLocationPermission(false);
      return;
    }

    // ✅ Mobile: Check HTTPS requirement
    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setLocationStatus(
        "⚠️ HTTPS is required for location access. Please use a secure connection."
      );
      setHasLocationPermission(false);
      return;
    }

    setIsRequestingLocation(true);
    setLocationStatus(
      isMobile
        ? "Requesting location permission... (Please allow in browser settings)"
        : "Requesting location permission..."
    );

    const successHandler = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      console.log("GPS success:", { latitude, longitude, accuracy, isMobile });

      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          type: "Point",
          // Mongo expects [longitude, latitude]
          coordinates: [longitude, latitude],
        },
      }));
      setLocationStatus(
        `Location acquired ✓ (Accuracy: ${Math.round(accuracy)}m)`
      );
      setHasLocationPermission(true);
      setIsRequestingLocation(false);
    };

    const errorHandler = (error) => {
      console.warn("GPS Error:", error);
      let msg = "Could not get precise location.";

      if (error.code === 1) {
        // ✅ Mobile-specific error messages
        if (isMobile) {
          msg =
            "Location permission denied. Please:\n1. Go to browser settings\n2. Allow location access\n3. Refresh the page";
        } else {
          msg =
            "Location permission denied. Please allow location access in browser settings.";
        }
        setHasLocationPermission(false);
      } else if (error.code === 2) {
        msg = isMobile
          ? "Location unavailable. Please check your device's location settings and ensure GPS is enabled."
          : "Location unavailable. Please check your device's location settings.";
        setHasLocationPermission(false);
      } else if (error.code === 3) {
        msg = isMobile
          ? "Location request timed out. Please ensure GPS is enabled and try again."
          : "Location request timed out. Please try again.";
        setHasLocationPermission(false);
      }

      setLocationStatus(msg);
      setIsRequestingLocation(false);

      // ❌ Don't set default [0,0] - user must grant permission
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          type: "Point",
          coordinates: prev.location?.coordinates || [0, 0],
        },
      }));
    };

    // ✅ Mobile Optimization: Adjust options for mobile devices
    const geolocationOptions = {
      // In mobile, enableHighAccuracy uses GPS which is more accurate but slower
      enableHighAccuracy: isMobile ? true : true,
      // Mobile devices may need more time, especially if GPS is cold start
      timeout: isMobile ? 15000 : 10000,
      // Don't use cached location on mobile - always get fresh
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      geolocationOptions
    );
  }, [setFormData, isMobile]);

  // 2. Auto-request GPS Coordinates on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // ... (options logic remains the same) ...
  const countryOptions = useMemo(() => {
    return availableLocations.map((loc) => ({
      name: loc.country,
      isoCode: loc.countryCode,
      flag: loc.countryCode === "SE" ? "🇸🇪" : "🏳️",
    }));
  }, [availableLocations]);

  const cityOptions = useMemo(() => {
    if (!formData.countryCode) return [];
    const selectedLocation = availableLocations.find(
      (loc) => loc.countryCode === formData.countryCode
    );
    if (!selectedLocation || !selectedLocation.cities) return [];
    return selectedLocation.cities.map((cityName) => ({ name: cityName }));
  }, [formData.countryCode, availableLocations]);

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">Where do you live?</h2>

      {errorMessage && (
        <div className="onboarding-step__error-message">{errorMessage}</div>
      )}

      {/* نمایش وضعیت GPS برای اطمینان کاربر - Mobile Optimized */}
      <div
        style={{
          fontSize: isMobile ? "0.75rem" : "0.8rem",
          color: "#94a3b8",
          marginBottom: "1rem",
          textAlign: "center",
          padding: isMobile ? "0.75rem" : "0.5rem",
          backgroundColor: "rgba(99, 102, 241, 0.05)",
          borderRadius: "8px",
          whiteSpace: "pre-line", // ✅ Mobile: Allow line breaks in error messages
          lineHeight: "1.4",
        }}
      >
        📍 GPS Status: {locationStatus}
      </div>

      <div className="onboarding-step__input-group onboarding-step__input-group--location">
        <label className="onboarding-step__label">Country</label>
        <SearchableSelect
          options={countryOptions}
          value={formData.country}
          placeholder={fetchingLoc ? "Loading Countries..." : "Select Country"}
          disabled={fetchingLoc}
          onChange={(selected) => {
            setFormData({
              ...formData,
              country: selected?.name || "",
              countryCode: selected?.isoCode || "",
              city: "",
            });
          }}
        />

        <label className="onboarding-step__label">City</label>
        <SearchableSelect
          options={cityOptions}
          value={formData.city}
          placeholder={
            !formData.country ? "Select Country First" : "Select or Type City"
          }
          disabled={!formData.country}
          onChange={(selected) =>
            setFormData({ ...formData, city: selected?.name || "" })
          }
        />
      </div>

      {/* Location Permission Warning - Mobile Optimized */}
      {(!hasLocationPermission ||
        !formData.location?.coordinates ||
        formData.location.coordinates[0] === 0 ||
        formData.location.coordinates[1] === 0) && (
        <div
          className="onboarding-step__warning"
          style={{
            padding: isMobile ? "1rem 0.75rem" : "1rem",
            marginBottom: "1rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            color: "#f87171",
            fontSize: isMobile ? "0.85rem" : "0.9rem",
            lineHeight: "1.5",
            whiteSpace: "pre-line", // ✅ Mobile: Allow line breaks
          }}
        >
          ⚠️ Location access is required to find nearby matches.
          {isMobile && "\n\nOn mobile:"}
          {isMobile && "\n• Go to browser settings"}
          {isMobile && "\n• Allow location access"}
          {isMobile && "\n• Refresh if needed"}
        </div>
      )}

      {/* Manual Location Request Button - Mobile Optimized */}
      {!hasLocationPermission && (
        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={requestLocation}
            disabled={isRequestingLocation}
            className="onboarding-step__btn onboarding-step__btn--secondary"
            style={{
              width: "100%",
              marginBottom: "0.5rem",
              minHeight: isMobile ? "48px" : "44px", // ✅ Mobile: Larger touch target
              fontSize: isMobile ? "0.95rem" : "1rem",
              padding: isMobile ? "0.875rem 1rem" : "0.75rem 1rem",
            }}
          >
            {isRequestingLocation
              ? isMobile
                ? "⏳ Requesting..."
                : "Requesting..."
              : isMobile
              ? "📍 Allow Location Access"
              : "📍 Allow Location Access"}
          </button>
        </div>
      )}

      <div className="onboarding-step__actions">
        <button
          className="onboarding-step__btn onboarding-step__btn--secondary"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="onboarding-step__btn onboarding-step__btn--primary"
          onClick={onNext}
          // ✅ Validation: باید country, city و location permission داشته باشد
          disabled={
            !formData.country ||
            !formData.city ||
            !hasLocationPermission ||
            !formData.location?.coordinates ||
            formData.location.coordinates[0] === 0 ||
            formData.location.coordinates[1] === 0 ||
            loading
          }
        >
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep2;
