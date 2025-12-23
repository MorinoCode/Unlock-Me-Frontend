import React, { useState, useEffect, useRef, useMemo } from "react";
import { Country, City } from "country-state-city";
import "./onboardingSteps.css";

/* =========================
   SearchableSelect Component
========================= */
const SearchableSelect = ({
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

  const handleInputChange = (e) => {
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
  };

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm(option.name);
    setIsOpen(false);
  };

  return (
    <div className="searchable-wrapper" ref={wrapperRef}>
      <input
        className="onboarding-input"
        type="text"
        value={searchTerm}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleInputChange}
        onFocus={() => !disabled && setIsOpen(true)}
      />

      {isOpen && !disabled && filteredOptions.length > 0 && (
        <ul className="searchable-list">
          {filteredOptions.map((opt, index) => (
            <li
              key={opt.isoCode || `${opt.name}-${index}`}
              className="searchable-option"
              onClick={() => handleSelect(opt)}
            >
              {renderOption ? renderOption(opt) : opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* =========================
      Main Component
========================= */
const OnboardingStep2 = ({
  formData,
  setFormData,
  onNext,
  onBack,
  loading,
}) => {
  const [countries] = useState(Country.getAllCountries());

  const cities = useMemo(() => {
    if (!formData.countryCode) return [];
    return City.getCitiesOfCountry(formData.countryCode) || [];
  }, [formData.countryCode]);

  const isNextDisabled = !formData.country || !formData.city;

  return (
    <div className="step-content">
      <h2>Where do you live?</h2>

      <div className="location-inputs">
        {/* Country */}
        <SearchableSelect
          options={countries}
          value={formData.country}
          placeholder="Select or Type Country"
          renderOption={(c) => (
            <span>
              {c.flag} {c.name}
            </span>
          )}
          onChange={(selected) => {
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
          }}
        />

        {/* City */}
        <SearchableSelect
          options={cities}
          value={formData.city}
          placeholder={
            formData.country ? "Select or Type City" : "Select Country First"
          }
          disabled={!formData.country}
          onChange={(selected) => {
            if (selected) {
              setFormData({ ...formData, city: selected.name });
            } else {
              setFormData({ ...formData, city: "" });
            }
          }}
        />
      </div>

      <div className="onboarding-actions">
        <button className="skip-btn" onClick={onBack}>
          Back
        </button>

        <button
          className="next-btn"
          onClick={onNext}
          disabled={isNextDisabled || loading}
        >
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep2;
