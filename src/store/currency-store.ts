import { create } from 'zustand';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  locale: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', locale: 'en-GB' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', flag: '🇸🇦', locale: 'ar-SA' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪', locale: 'ar-AE' },
  { code: 'SDG', symbol: 'ج.س', name: 'Sudanese Pound', flag: '🇸🇩', locale: 'ar-SD' },
  { code: 'SYP', symbol: 'ل.س', name: 'Syrian Pound', flag: '🇸🇾', locale: 'ar-SY' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', flag: '🇰🇼', locale: 'ar-KW' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', flag: '🇶🇦', locale: 'ar-QA' },
  { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', flag: '🇧🇭', locale: 'ar-BH' },
  { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial', flag: '🇴🇲', locale: 'ar-OM' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷', locale: 'tr-TR' },
];

const STORAGE_KEY = 'ciar-currency';
const DEFAULT_CURRENCY = CURRENCIES[0]; // USD

interface CurrencyState {
  currency: CurrencyInfo;
  setCurrency: (currency: CurrencyInfo) => void;
  isReady: boolean;
}

function getStoredCurrency(): CurrencyInfo {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const savedCode = localStorage.getItem(STORAGE_KEY);
  if (savedCode) {
    const found = CURRENCIES.find((c) => c.code === savedCode);
    if (found) return found;
  }
  return DEFAULT_CURRENCY;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: DEFAULT_CURRENCY,
  isReady: false,
  setCurrency: (currency) => {
    set({ currency, isReady: true });
    if (typeof document !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, currency.code);
    }
  },
}));

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const stored = getStoredCurrency();
  useCurrencyStore.getState().setCurrency(stored);
}
