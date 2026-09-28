import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

// Reads a dotted path ("nav.home") out of the active translation object,
// falling back to English then to the key itself so missing translations
// never render blank.
function resolve(dict, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
}

export function LanguageProvider({ children }) {
  // Every fresh page load/visit always starts in English — the language
  // choice only applies for the current session and is not remembered
  // across visits, so switching to Tamil never "sticks" on reopen.
  const [lang, setLang] = useState('en');

  const setLanguage = useCallback((next) => {
    setLang(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(lang === 'en' ? 'ta' : 'en');
  }, [lang, setLanguage]);

  const t = useCallback((path) => {
    const value = resolve(translations[lang], path) ?? resolve(translations.en, path);
    return value ?? path;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLanguage, toggleLanguage, t }), [lang, setLanguage, toggleLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
