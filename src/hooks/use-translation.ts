'use client';

import { useCallback, useMemo } from 'react';
import { useI18nStore } from '@/store/i18n-store';
import type { Locale, TranslationDictionary } from '@/lib/i18n/types';
import { en } from '@/lib/i18n/translations/en';
import { ar } from '@/lib/i18n/translations/ar';
import { fr } from '@/lib/i18n/translations/fr';
import { de } from '@/lib/i18n/translations/de';
import { es } from '@/lib/i18n/translations/es';

const translations: Record<Locale, TranslationDictionary> = {
  en,
  ar,
  fr,
  de,
  es,
};

function getNestedValue(obj: TranslationDictionary, path: string): string {
  const keys = path.split('.');
  let current: TranslationDictionary | string = obj;

  for (const key of keys) {
    if (typeof current === 'string') return path;
    if (current === null || current === undefined) return path;
    const value = current[key];
    if (value === undefined) return path;
    current = value;
  }

  return typeof current === 'string' ? current : path;
}

export function useTranslation() {
  const { locale } = useI18nStore();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = getNestedValue(translations[locale], key);

      // Fallback to English
      if (value === key && locale !== 'en') {
        value = getNestedValue(translations.en, key);
      }

      // Interpolation
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(`{${paramKey}}`, String(paramValue));
        });
      }

      return value;
    },
    [locale]
  );

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const isRTL = locale === 'ar';

  const formatNumber = useCallback(
    (num: number, options?: Intl.NumberFormatOptions): string => {
      return new Intl.NumberFormat(locale, {
        ...options,
        maximumFractionDigits: options?.maximumFractionDigits ?? 0,
      }).format(num);
    },
    [locale]
  );

  const formatCurrency = useCallback(
    (amount: number, currency: string = 'USD'): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    },
    [locale]
  );

  const formatDate = useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      }).format(d);
    },
    [locale]
  );

  const dirClasses = useMemo(
    () => ({
      textStart: isRTL ? 'text-right' : 'text-left',
      textEnd: isRTL ? 'text-left' : 'text-right',
      mr: isRTL ? 'ml' : 'mr',
      ml: isRTL ? 'mr' : 'ml',
      pr: isRTL ? 'pl' : 'pr',
      pl: isRTL ? 'pr' : 'pl',
      ms: isRTL ? 'me' : 'ms',
      me: isRTL ? 'ms' : 'me',
      rotate: isRTL ? 'rtl:rotate-180' : '',
    }),
    [isRTL]
  );

  return { t, locale, dir, isRTL, formatNumber, formatCurrency, formatDate, dirClasses };
}
