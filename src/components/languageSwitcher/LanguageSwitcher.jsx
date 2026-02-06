import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { supportedLanguages, changeLanguage } from "../../i18n/config";
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentLang =
    supportedLanguages.find((lang) => lang.code === i18n.language) ||
    supportedLanguages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = async (langCode) => {
    await changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-switcher__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Change language (Current: ${currentLang.name})`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe size={16} />
        <span className="language-switcher__code">
          {currentLang.code.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div className="language-switcher__dropdown">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              className={`language-switcher__option ${
                i18n.language === lang.code
                  ? "language-switcher__option--active"
                  : ""
              }`}
              onClick={() => handleLanguageChange(lang.code)}
              aria-label={`Change language to ${lang.name}`}
            >
              <span className="language-switcher__flag">{lang.flag}</span>
              <span className="language-switcher__name">{lang.nativeName}</span>
              <span className="language-switcher__english">{lang.name}</span>
              {i18n.language === lang.code && (
                <Check size={16} className="language-switcher__check" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
