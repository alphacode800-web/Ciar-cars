import { create } from 'zustand';
import type { Locale } from '@/lib/i18n/types';
import { DEFAULT_LOCALE } from '@/lib/i18n/types';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isReady: boolean;
}

export const useI18nStore = create<I18nState>((set) => ({
  locale: DEFAULT_LOCALE,
  isReady: false,
  setLocale: (locale) => {
    set({ locale, isReady: true });
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('ciar-locale', locale);
    }
  },
}));

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('ciar-locale') as Locale | null;
  if (saved) {
    useI18nStore.getState().setLocale(saved);
  }
}
