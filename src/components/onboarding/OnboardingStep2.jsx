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
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // ۱. واکشی لیست لوکیشن‌ها از دیتابیس
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setFetchingLoc(true);
        const res = await fetch(`${API_URL}/api/locations`);
        if (!res.ok) throw new Error("Failed to fetch locations");
        const data = await res.json();
        if (Array.isArray(data)) setAvailableLocations(data);
      } catch (err) {
        setErrorMessage("Failed to load locations.");
      } finally {
        setFetchingLoc(false);
      }
    };
    fetchLocations();
  }, [API_URL]);

  // ۲. تلاش برای دریافت خودکار مختصات به محض ورود به استپ ۲
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // فقط مختصات را آپدیت می‌کنیم، کاربر خودش شهر را انتخاب می‌کند
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              type: "Point",
              coordinates: [longitude, latitude],
            },
          }));
        },
        (error) => {
          console.log("User denied or error in Geolocation:", error.message);
          // اگر اجازه نداد، اتفاقی نمی‌افتد و کاربر به صورت دستی انتخاب می‌کند
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [setFormData]);

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

      <div className="onboarding-step__input-group onboarding-step__input-group--location">
        <label className="onboarding-step__label">Country</label>
        <SearchableSelect
          options={countryOptions}
          value={formData.country}
          placeholder={fetchingLoc ? "Loading Countries..." : "Select Country"}
          disabled={fetchingLoc}
          onChange={(selected) => {
            setFormData({ ...formData, country: selected?.name || "", countryCode: selected?.isoCode || "", city: "" });
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
          disabled={!formData.country || !formData.city || loading}
        >
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep2;