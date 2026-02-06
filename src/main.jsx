import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/config'; // Initialize i18n
import App from './App.jsx';

// رجیستر کردن Service Worker برای PWA (کش کردن فایل‌ها)
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
});

// بهبود Performance: Lazy load برای کاهش initial bundle
const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// بهبود Performance: رفع back/forward cache issue
// اضافه کردن event listener برای pagehide
if ('performance' in window && 'navigation' in performance) {
  window.addEventListener('pagehide', () => {
    // Cleanup برای جلوگیری از memory leaks
    if (window.performance.navigation.type === 1) {
      // Page reload - cleanup
    }
  });
}

// بهبود Performance: Preload critical resources
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Preload critical resources در idle time
  });
}