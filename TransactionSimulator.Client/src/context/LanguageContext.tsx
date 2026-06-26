import { createContext, useContext, useState, type ReactNode } from 'react';
import en, { type Translations } from '../i18n/en';
import he from '../i18n/he';

type Lang = 'en' | 'he';

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  isRtl: boolean;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const t = lang === 'he' ? he : en;
  const isRtl = lang === 'he';

  return (
    <LanguageContext.Provider value={{ lang, t, isRtl, setLang }}>
      <div dir={isRtl ? 'rtl' : 'ltr'} style={{ minHeight: '100vh' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
