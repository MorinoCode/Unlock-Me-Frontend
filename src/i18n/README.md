# Internationalization (i18n) Guide

This project uses `react-i18next` for internationalization with support for 8 languages:
- English (en)
- Spanish (es)
- Chinese (zh)
- Arabic (ar) - RTL support
- French (fr)
- Portuguese (pt)
- Hindi (hi)
- Russian (ru)

## How to Use Translations

### 1. Import useTranslation hook

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('home.title')}</p>
    </div>
  );
};
```

### 2. Translation Keys Structure

All translations are organized in namespaces:
- `common.*` - Common UI elements (buttons, labels, etc.)
- `nav.*` - Navigation items
- `home.*` - Home page content
- `auth.*` - Authentication forms
- `footer.*` - Footer content
- `pages.*` - Page titles and content
- `errors.*` - Error messages

### 3. Adding New Translations

1. Add the English translation to `src/i18n/locales/en.json`
2. Add translations for all other languages in their respective files
3. Use the translation key in your component

### 4. Language Switcher

The Language Switcher component is already integrated in the Navbar. Users can change languages from there.

### 5. RTL Support

Arabic automatically switches to RTL mode. The `rtl.css` file handles all RTL styling.

## Performance Notes

- Translations are lazy-loaded (only loaded when needed)
- Translations are cached in localStorage
- No performance impact on initial page load
