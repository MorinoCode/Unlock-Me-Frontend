import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import "./onboardingSteps.css";

// کامپوننت SearchableSelect (بدون تغییر)
const SearchableSelect = memo(({ options, value, onChange, placeholder, disabled, renderOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const wrapperRef = useRef(null);

  React.useLayoutEffect(() => { setSearchTerm(value || ""); }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(value || "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  const handleInputChange = useCallback((e) => {
    const text = e.target.value;
    setSearchTerm(text);
    setIsOpen(true);
    const exactMatch = options.find((opt) => opt.name.toLowerCase() === text.toLowerCase());
    if (exactMatch) onChange(exactMatch);
    else if (text === "") onChange(null);
  }, [options, onChange]);

  const handleSelect = useCallback((option) => {
    onChange(option);
    setSearchTerm(option.name);
    setIsOpen(false);
  }, [onChange]);

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
            <li key={opt.isoCode || `${opt.name}-${index}`} className="searchable-select__option" onClick={() => handleSelect(opt)}>
              {renderOption ? renderOption(opt) : opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

const OnboardingStep2 = ({ formData, setFormData, onNext, onBack, loading }) => {
  const [availableLocations, setAvailableLocations] = useState([]);
  const [fetchingLoc, setFetchingLoc] = useState(true);
  const [locationStatus, setLocationStatus] = useState(""); // برای نمایش وضعیت GPS به کاربر
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // 1. Fetch Locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setFetchingLoc(true);
        const res = await fetch(`${API_URL}/api/locations`);
        if (!res.ok) throw new Error("Failed to fetch locations");
        const data = await res.json();
        if (Array.isArray(data)) setAvailableLocations(data);
      } catch (err) {
        console.log(err);
        setErrorMessage("Failed to load locations.");
      } finally {
        setFetchingLoc(false);
      }
    };
    fetchLocations();
  }, [API_URL]);

  // 2. Get GPS Coordinates (Improved)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("Geolocation not supported by this browser.");
      return;
    }

    setLocationStatus("Locating...");

    const successHandler = (position) => {
      const { latitude, longitude } = position.coords;
      console.log("GPS success:", latitude, longitude);
      
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          type: "Point",
          // Mongo expects [longitude, latitude]
          coordinates: [longitude, latitude], 
        },
      }));
      setLocationStatus("Location acquired ✓");
    };

    const errorHandler = (error) => {
      console.warn("GPS Error:", error.message);
      let msg = "Could not get precise location.";
      if (error.code === 1) msg = "Location permission denied.";
      else if (error.code === 2) msg = "Location unavailable.";
      else if (error.code === 3) msg = "Location request timed out.";
      
      setLocationStatus(msg + " defaulting to city center.");
      
      // Fallback: Default to [0,0] or handle in backend if coordinates are empty
      // We keep existing coordinates if they were set, otherwise 0,0
      setFormData((prev) => {
          if(prev.location?.coordinates && prev.location.coordinates[0] !== 0) return prev;
          return {
            ...prev,
            location: { ...prev.location, type: "Point", coordinates: [0, 0] }
          };
      });
    };

    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [setFormData]);

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
    const selectedLocation = availableLocations.find((loc) => loc.countryCode === formData.countryCode);
    if (!selectedLocation || !selectedLocation.cities) return [];
    return selectedLocation.cities.map((cityName) => ({ name: cityName }));
  }, [formData.countryCode, availableLocations]);

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">Where do you live?</h2>
      
      {errorMessage && <div className="onboarding-step__error-message">{errorMessage}</div>}
      
      {/* نمایش وضعیت GPS برای اطمینان کاربر */}
      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px', textAlign: 'center' }}>
        GPS Status: {locationStatus}
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
                city: "" 
            });
          }}
        />

        <label className="onboarding-step__label">City</label>
        <SearchableSelect
          options={cityOptions}
          value={formData.city}
          placeholder={!formData.country ? "Select Country First" : "Select or Type City"}
          disabled={!formData.country}
          onChange={(selected) => setFormData({ ...formData, city: selected?.name || "" })}
        />
      </div>

      <div className="onboarding-step__actions">
        <button className="onboarding-step__btn onboarding-step__btn--secondary" onClick={onBack}>Back</button>
        <button 
          className="onboarding-step__btn onboarding-step__btn--primary" 
          onClick={onNext} 
          // دکمه فقط زمانی فعال می‌شود که کشور و شهر پر شده باشند
          disabled={!formData.country || !formData.city || loading}
        >
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
};



export default OnboardingStep2;