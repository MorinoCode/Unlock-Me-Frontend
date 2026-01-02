import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import "./onboardingSteps.css";

const SearchableSelect = memo(({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  renderOption,
}) => {
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleInputChange = useCallback((e) => {
    const text = e.target.value;
    setSearchTerm(text);
    setIsOpen(true);

    const exactMatch = options.find(
      (opt) => opt.name.toLowerCase() === text.toLowerCase()
    );

    if (exactMatch) {
      onChange(exactMatch);
    } else if (text === "") {
      onChange(null);
    }
  }, [options, onChange]);

  const handleSelect = useCallback((option) => {
    onChange(option);
    setSearchTerm(option.name);
    setIsOpen(false);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    if (!disabled) setIsOpen(true);
  }, [disabled]);

  return (
    <div className="searchable-select" ref={wrapperRef}>
      <input
        className="searchable-select__input"
        type="text"
        value={searchTerm}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleInputChange}
        onFocus={handleFocus}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        role="combobox"
      />

      {isOpen && !disabled && filteredOptions.length > 0 && (
        <ul className="searchable-select__list" role="listbox">
          {filteredOptions.map((opt, index) => (
            <li
              key={opt.isoCode || `${opt.name}-${index}`}
              className="searchable-select__option"
              onClick={() => handleSelect(opt)}
              role="option"
              aria-selected={opt.name === value}
            >
              {renderOption ? renderOption(opt) : opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

SearchableSelect.displayName = "SearchableSelect";

const OnboardingStep2 = ({
  formData,
  setFormData,
  onNext,
  onBack,
  loading,
}) => {
  const [availableLocations, setAvailableLocations] = useState([]);
  const [fetchingLoc, setFetchingLoc] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const abortControllerRef = useRef(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setErrorMessage("Request timeout. Please try again.");
        setFetchingLoc(false);
      }
    }, 15000);

    const fetchLocations = async () => {
      try {
        setFetchingLoc(true);
        const res = await fetch(`${API_URL}/api/locations`, {
          signal: abortControllerRef.current.signal,
        }); 
        
        if (!res.ok) throw new Error("Failed to fetch locations");
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setAvailableLocations(data);
          setErrorMessage("");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to load locations:", err);
          setErrorMessage("Failed to load locations. Please refresh.");
        }
      } finally {
        clearTimeout(timeoutId);
        setFetchingLoc(false);
      }
    };

    fetchLocations();

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [API_URL]);

  const countryOptions = useMemo(() => {
    return availableLocations.map((loc) => ({
      name: loc.country,
      isoCode: loc.countryCode,
      flag: loc.countryCode === "SE" ? "🇸🇪" : "🏳️" 
    }));
  }, [availableLocations]);

  const cityOptions = useMemo(() => {
    if (!formData.countryCode) return [];

    const selectedLocation = availableLocations.find(
      (loc) => loc.countryCode === formData.countryCode
    );

    if (!selectedLocation || !selectedLocation.cities) return [];

    return selectedLocation.cities.map((cityName) => ({
      name: cityName,
    }));
  }, [formData.countryCode, availableLocations]);

  const handleCountryChange = useCallback((selected) => {
    if (selected) {
      setFormData({
        ...formData,
        country: selected.name,
        countryCode: selected.isoCode,
        city: "",
      });
    } else {
      setFormData({
        ...formData,
        country: "",
        countryCode: "",
        city: "",
      });
    }
  }, [formData, setFormData]);

  const handleCityChange = useCallback((selected) => {
    if (selected) {
      setFormData({ ...formData, city: selected.name });
    } else {
      setFormData({ ...formData, city: "" });
    }
  }, [formData, setFormData]);

  const isNextDisabled = !formData.country || !formData.city;

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">Where do you live?</h2>

      {errorMessage && (
        <div className="onboarding-step__error-message" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="onboarding-step__input-group onboarding-step__input-group--location">
        <SearchableSelect
          options={countryOptions}
          value={formData.country}
          placeholder={fetchingLoc ? "Loading Countries..." : "Select Country"}
          disabled={fetchingLoc}
          renderOption={(c) => (
            <span className="searchable-select__option-content">
              {c.flag} {c.name}
            </span>
          )}
          onChange={handleCountryChange}
        />

        <SearchableSelect
          options={cityOptions}
          value={formData.city}
          placeholder={
            !formData.country 
              ? "Select Country First" 
              : (cityOptions.length === 0 ? "No cities found" : "Select or Type City")
          }
          disabled={!formData.country || cityOptions.length === 0}
          onChange={handleCityChange}
        />
      </div>

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
          disabled={isNextDisabled || loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="onboarding-step__spinner" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep2;