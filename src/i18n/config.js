import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Supported languages
export const supportedLanguages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    rtl: false,
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    rtl: false,
  },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", rtl: false },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", rtl: true },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    rtl: false,
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
    rtl: false,
  },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", rtl: false },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    rtl: false,
  },
];

// Load blind date questions (per-lang or fallback to en)
const loadBlindDateQuestions = async (lang) => {
  try {
    const module = await import(
      `./locales/blindDateQuestions${
        lang.charAt(0).toUpperCase() + lang.slice(1)
      }.json`
    );
    return module.default;
  } catch {
    try {
      const module = await import(`./locales/blindDateQuestionsEn.json`);
      return module.default;
    } catch {
      return {};
    }
  }
};

// Lazy load translations for better performance
const loadTranslation = async (lang) => {
  try {
    const module = await import(`./locales/${lang}.json`);
    const translations = module.default;
    const questions = await loadBlindDateQuestions(lang);
    if (translations.blindDate && Object.keys(questions).length > 0) {
      translations.blindDate = { ...translations.blindDate, questions };
    }
    return translations;
  } catch {
    console.warn(
      `Translation file for ${lang} not found, falling back to English`
    );
    const module = await import(`./locales/en.json`);
    const translations = module.default;
    const questions = await loadBlindDateQuestions("en");
    if (translations.blindDate && Object.keys(questions).length > 0) {
      translations.blindDate = { ...translations.blindDate, questions };
    }
    return translations;
  }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Default language
    fallbackLng: "en",

    // Supported languages
    supportedLngs: supportedLanguages.map((lang) => lang.code),

    // Namespaces
    ns: ["common"],
    defaultNS: "common",

    // Load all namespaces
    load: "languageOnly",

    // Performance optimizations
    interpolation: {
      escapeValue: false, // React already escapes
    },

    // Detection options
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },

    // React specific
    react: {
      useSuspense: false, // Better for performance
    },
  });

// Load initial language
const initTranslations = async () => {
  const detectedLang =
    localStorage.getItem("i18nextLng") ||
    navigator.language.split("-")[0] ||
    "en";
  const lang =
    supportedLanguages.find((l) => l.code === detectedLang)?.code || "en";

  try {
    const translations = await loadTranslation(lang);
    i18n.addResourceBundle(lang, "common", translations, true, true);

    // Set RTL if needed
    const langConfig = supportedLanguages.find((l) => l.code === lang);
    if (langConfig?.rtl) {
      document.documentElement.setAttribute("dir", "rtl");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
    }
    document.documentElement.setAttribute("lang", lang);

    // Change language after resources are loaded
    await i18n.changeLanguage(lang);
  } catch (err) {
    console.error("Error loading translations:", err);
    // Fallback to English
    try {
      const translations = await loadTranslation("en");
      i18n.addResourceBundle("en", "common", translations, true, true);
      await i18n.changeLanguage("en");
      document.documentElement.setAttribute("dir", "ltr");
      document.documentElement.setAttribute("lang", "en");
    } catch (fallbackError) {
      console.error("Error loading fallback translations:", fallbackError);
    }
  }
};

// Initialize translations immediately
initTranslations();

// Change language handler with RTL support
export const changeLanguage = async (langCode) => {
  const lang = supportedLanguages.find((l) => l.code === langCode);
  if (!lang) return;

  // Load translation if not already loaded (or reload to merge questions)
  try {
    const translations = await loadTranslation(langCode);
    i18n.addResourceBundle(langCode, "common", translations, true, true);
  } catch (err) {
    console.error(`Error loading translation for ${langCode}:`, err);
    return;
  }

  await i18n.changeLanguage(langCode);

  // Update document direction and language
  if (lang.rtl) {
    document.documentElement.setAttribute("dir", "rtl");
  } else {
    document.documentElement.setAttribute("dir", "ltr");
  }
  document.documentElement.setAttribute("lang", langCode);

  // Save to localStorage
  localStorage.setItem("i18nextLng", langCode);
};

export default i18n;
