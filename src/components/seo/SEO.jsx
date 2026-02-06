import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'https://unlock-me.app';

// Supported languages for hreflang (EN & AR priority for SEO)
const HREFLANG_LOCALES = [
  { code: 'en', ogLocale: 'en_US' },
  { code: 'ar', ogLocale: 'ar_SA' },
  { code: 'es', ogLocale: 'es_ES' },
  { code: 'zh', ogLocale: 'zh_CN' },
  { code: 'fr', ogLocale: 'fr_FR' },
  { code: 'pt', ogLocale: 'pt_BR' },
  { code: 'hi', ogLocale: 'hi_IN' },
  { code: 'ru', ogLocale: 'ru_RU' },
];

/**
 * SEO Component - Dynamic meta tags + hreflang for all supported languages
 */
const SEO = ({
  title = 'Unlock Me | Find Your Perfect Match',
  description = 'The best platform for finding your perfect match based on DNA personality traits. Connect, chat, and find love.',
  keywords = 'dating app, matchmaking, personality matching, DNA matching, blind date',
  image = `${BASE_URL}/og-image.jpg`,
  type = 'website',
}) => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'en';

  useEffect(() => {
    const url = `${BASE_URL}${location.pathname}`;

    document.title = title;

    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:locale', HREFLANG_LOCALES.find((l) => l.code === currentLang)?.ogLocale || 'en_US', true);
    document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((el) => el.remove());
    HREFLANG_LOCALES.filter((l) => l.code !== currentLang).forEach(({ ogLocale }) => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:locale:alternate');
      meta.setAttribute('content', ogLocale);
      document.head.appendChild(meta);
    });

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // hreflang: same URL for all (SPA language is client-side)
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach((el) => el.remove());

    HREFLANG_LOCALES.forEach(({ code }) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', code);
      link.setAttribute('href', url);
      document.head.appendChild(link);
    });
    const xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', url);
    document.head.appendChild(xDefault);
  }, [title, description, keywords, image, type, location.pathname, currentLang]);

  return null;
};

export default SEO;
