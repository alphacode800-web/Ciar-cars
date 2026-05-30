'use client';

import { useCallback, useEffect, useState } from 'react';
import { ar } from '@/lib/i18n/translations/ar';
import { en } from '@/lib/i18n/translations/en';
import type { TranslationDictionary } from '@/lib/i18n/types';

export type AdminLocale = 'ar' | 'en';

const ADMIN_LOCALE_KEY = 'ciar-admin-locale';

function getNestedValue(obj: TranslationDictionary, path: string): string {
  const keys = path.split('.');
  let current: TranslationDictionary | string = obj;
  for (const key of keys) {
    if (typeof current === 'string') return path;
    const value = current[key];
    if (value === undefined) return path;
    current = value;
  }
  return typeof current === 'string' ? current : path;
}

export function useAdminTranslation() {
  const [locale, setLocaleState] = useState<AdminLocale>('ar');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_LOCALE_KEY);
    const initial: AdminLocale = saved === 'en' ? 'en' : 'ar';
    setLocaleState(initial);
    document.documentElement.dir = initial === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = initial;
    setReady(true);
  }, []);

  const setLocale = useCallback((next: AdminLocale) => {
    setLocaleState(next);
    localStorage.setItem(ADMIN_LOCALE_KEY, next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  }, []);

  const dict = locale === 'ar' ? ar.adminPanel : en.adminPanel;

  const t = useCallback(
    (key: string) => getNestedValue(dict as TranslationDictionary, key),
    [dict]
  );

  return {
    t,
    locale,
    setLocale,
    isRTL: locale === 'ar',
    ready,
  };
}
