import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation function with parameter substitution
const translate = (translations: Record<string, any>, key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key if translation not found
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string for key: ${key}`);
    return key;
  }
  
  // Replace parameters in the translation
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return value;
};

const loadTranslations = async (lang: string) => {
  try {
    let translations;
    switch (lang) {
      case 'en':
        translations = await import('../translations/en');
        break;
      case 'es':
        translations = await import('../translations/es');
        break;
      default:
        translations = await import('../translations/en');
    }
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
    // Fallback to English translations if loading fails
    try {
      const fallback = await import('../translations/en');
      return fallback.default;
    } catch (fallbackError) {
      console.error('Failed to load fallback translations:', fallbackError);
      // Return minimal translations to prevent app crash
      return {
        common: { loading: 'Loading...' },
        nav: { dashboard: 'Dashboard' },
        auth: { login: 'Login' },
        dashboard: { title: 'Dashboard' }
      };
    }
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Load translations
  useEffect(() => {
    const loadTranslationsForLanguage = async () => {
      const translationData = await loadTranslations(language);
      setTranslations(translationData);
    };

    loadTranslationsForLanguage();
  }, [language]);

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && ['en', 'es', 'fr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (['en', 'es', 'fr'].includes(browserLang)) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-language', lang);
    console.log(`Language changed to: ${lang}`);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    return translate(translations, key, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};