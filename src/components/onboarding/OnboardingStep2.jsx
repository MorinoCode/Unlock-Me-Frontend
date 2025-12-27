import React, { useState, useEffect, useRef, useMemo } from "react";
import "./onboardingSteps.css";

/* =========================
   SearchableSelect Component
   (بدون تغییر باقی می‌ماند چون منطق UI سالم است)
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
    <div className="searchable-select" ref={wrapperRef}>
      <input
        className="searchable-select__input"
        type="text"
        value={searchTerm}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleInputChange}
        onFocus={() => !disabled && setIsOpen(true)}
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
  // استیت برای ذخیره دیتای خام که از بک‌اند می‌آید
  const [availableLocations, setAvailableLocations] = useState([]);
  const [fetchingLoc, setFetchingLoc] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // 1. دریافت لیست کشورها و شهرها از بک‌اند
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setFetchingLoc(true);
        // فرض بر این است که بک‌اند روی این آدرس لیست را برمی‌گرداند
        const res = await fetch(`${API_URL}/api/locations`); 
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setAvailableLocations(data);
        }
      } catch (err) {
        console.error("Failed to load locations:", err);
      } finally {
        setFetchingLoc(false);
      }
    };

    fetchLocations();
  }, [API_URL]);

  // 2. آماده‌سازی لیست کشورها برای کامپوننت Select
  const countryOptions = useMemo(() => {
    return availableLocations.map((loc) => ({
      name: loc.country,       // نام برای نمایش
      isoCode: loc.countryCode, // کد برای ذخیره و فیلتر
      // اگر بک‌اند پرچم ندارد، می‌توانیم دستی اضافه کنیم یا حذف کنیم
      flag: loc.countryCode === "SE" ? "🇸🇪" : "🏳️" 
    }));
  }, [availableLocations]);

  // 3. فیلتر کردن شهرها بر اساس کشور انتخاب شده
  const cityOptions = useMemo(() => {
    if (!formData.countryCode) return [];

    // پیدا کردن آبجکت کشور انتخاب شده در دیتای بک‌اند
    const selectedLocation = availableLocations.find(
      (loc) => loc.countryCode === formData.countryCode
    );

    if (!selectedLocation || !selectedLocation.cities) return [];

    // تبدیل آرایه رشته‌ای ["Stockholm", ...] به آرایه آبجکت [{name: "Stockholm"}, ...]
    // چون SearchableSelect انتظار آبجکت دارد
    return selectedLocation.cities.map((cityName) => ({
      name: cityName,
    }));
  }, [formData.countryCode, availableLocations]);

  const isNextDisabled = !formData.country || !formData.city;

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">Where do you live?</h2>

      <div className="onboarding-step__input-group onboarding-step__input-group--location">
        {/* Country */}
        <SearchableSelect
          options={countryOptions}
          value={formData.country}
          placeholder={fetchingLoc ? "Loading Countries..." : "Select Country"}
          disabled={fetchingLoc} // تا وقتی لود نشده غیرفعال باشد
          renderOption={(c) => (
            <span className="searchable-select__option-content">
              {c.flag} {c.name}
            </span>
          )}
          onChange={(selected) => {
            if (selected) {
              setFormData({
                ...formData,
                country: selected.name,
                countryCode: selected.isoCode,
                city: "", // ریست کردن شهر وقتی کشور عوض می‌شود
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
          options={cityOptions}
          value={formData.city}
          placeholder={
            !formData.country 
              ? "Select Country First" 
              : (cityOptions.length === 0 ? "No cities found" : "Select or Type City")
          }
          disabled={!formData.country || cityOptions.length === 0}
          onChange={(selected) => {
            if (selected) {
              setFormData({ ...formData, city: selected.name });
            } else {
              setFormData({ ...formData, city: "" });
            }
          }}
        />
      </div>

      <div className="onboarding-step__actions">
        <button className="onboarding-step__btn onboarding-step__btn--secondary" onClick={onBack}>
          Back
        </button>

        <button
          className="onboarding-step__btn onboarding-step__btn--primary"
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