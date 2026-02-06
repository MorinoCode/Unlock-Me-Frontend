import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component - Dynamic meta tags برای هر صفحه
 */
const SEO = ({ 
  title = "Unlock Me | Find Your Perfect Match",
  description = "The best platform for finding your perfect match based on DNA personality traits. Connect, chat, and find love.",
  keywords = "dating app, matchmaking, personality matching, DNA matching, blind date",
  image = "https://unlock-me.app/og-image.jpg",
  type = "website"
}) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Primary Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph Tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', `https://unlock-me.app${location.pathname}`, true);
    updateMetaTag('og:type', type, true);
    
    // Twitter Card Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://unlock-me.app${location.pathname}`);
  }, [title, description, keywords, image, type, location.pathname]);

  return null;
};

export default SEO;
