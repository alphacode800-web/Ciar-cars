/** Countries supported on the platform (55+). Sudan & Syria listed first. */
export interface CountryOption {
  code: string;
  nameEn: string;
  nameAr: string;
  flag: string;
  featured?: boolean;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'SD', nameEn: 'Sudan', nameAr: 'السودان', flag: '🇸🇩', featured: true },
  { code: 'SY', nameEn: 'Syria', nameAr: 'سوريا', flag: '🇸🇾', featured: true },
  { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر', flag: '🇪🇬', featured: true },
  { code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦', featured: true },
  { code: 'AE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات', flag: '🇦🇪', featured: true },
  { code: 'QA', nameEn: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
  { code: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼' },
  { code: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭' },
  { code: 'OM', nameEn: 'Oman', nameAr: 'عُمان', flag: '🇴🇲' },
  { code: 'YE', nameEn: 'Yemen', nameAr: 'اليمن', flag: '🇾🇪' },
  { code: 'IQ', nameEn: 'Iraq', nameAr: 'العراق', flag: '🇮🇶' },
  { code: 'JO', nameEn: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴' },
  { code: 'LB', nameEn: 'Lebanon', nameAr: 'لبنان', flag: '🇱🇧' },
  { code: 'PS', nameEn: 'Palestine', nameAr: 'فلسطين', flag: '🇵🇸' },
  { code: 'LY', nameEn: 'Libya', nameAr: 'ليبيا', flag: '🇱🇾' },
  { code: 'TN', nameEn: 'Tunisia', nameAr: 'تونس', flag: '🇹🇳' },
  { code: 'DZ', nameEn: 'Algeria', nameAr: 'الجزائر', flag: '🇩🇿' },
  { code: 'MA', nameEn: 'Morocco', nameAr: 'المغرب', flag: '🇲🇦' },
  { code: 'MR', nameEn: 'Mauritania', nameAr: 'موريتانيا', flag: '🇲🇷' },
  { code: 'SO', nameEn: 'Somalia', nameAr: 'الصومال', flag: '🇸🇴' },
  { code: 'DJ', nameEn: 'Djibouti', nameAr: 'جيبوتي', flag: '🇩🇯' },
  { code: 'US', nameEn: 'United States', nameAr: 'الولايات المتحدة', flag: '🇺🇸' },
  { code: 'GB', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة', flag: '🇬🇧' },
  { code: 'DE', nameEn: 'Germany', nameAr: 'ألمانيا', flag: '🇩🇪' },
  { code: 'FR', nameEn: 'France', nameAr: 'فرنسا', flag: '🇫🇷' },
  { code: 'IT', nameEn: 'Italy', nameAr: 'إيطاليا', flag: '🇮🇹' },
  { code: 'ES', nameEn: 'Spain', nameAr: 'إسبانيا', flag: '🇪🇸' },
  { code: 'NL', nameEn: 'Netherlands', nameAr: 'هولندا', flag: '🇳🇱' },
  { code: 'BE', nameEn: 'Belgium', nameAr: 'بلجيكا', flag: '🇧🇪' },
  { code: 'CH', nameEn: 'Switzerland', nameAr: 'سويسرا', flag: '🇨🇭' },
  { code: 'SE', nameEn: 'Sweden', nameAr: 'السويد', flag: '🇸🇪' },
  { code: 'NO', nameEn: 'Norway', nameAr: 'النرويج', flag: '🇳🇴' },
  { code: 'DK', nameEn: 'Denmark', nameAr: 'الدنمارك', flag: '🇩🇰' },
  { code: 'FI', nameEn: 'Finland', nameAr: 'فنلندا', flag: '🇫🇮' },
  { code: 'PL', nameEn: 'Poland', nameAr: 'بولندا', flag: '🇵🇱' },
  { code: 'TR', nameEn: 'Turkey', nameAr: 'تركيا', flag: '🇹🇷' },
  { code: 'RU', nameEn: 'Russia', nameAr: 'روسيا', flag: '🇷🇺' },
  { code: 'CA', nameEn: 'Canada', nameAr: 'كندا', flag: '🇨🇦' },
  { code: 'MX', nameEn: 'Mexico', nameAr: 'المكسيك', flag: '🇲🇽' },
  { code: 'BR', nameEn: 'Brazil', nameAr: 'البرازيل', flag: '🇧🇷' },
  { code: 'AR', nameEn: 'Argentina', nameAr: 'الأرجنتين', flag: '🇦🇷' },
  { code: 'CL', nameEn: 'Chile', nameAr: 'تشيلي', flag: '🇨🇱' },
  { code: 'CO', nameEn: 'Colombia', nameAr: 'كولومبيا', flag: '🇨🇴' },
  { code: 'IN', nameEn: 'India', nameAr: 'الهند', flag: '🇮🇳' },
  { code: 'PK', nameEn: 'Pakistan', nameAr: 'باكستان', flag: '🇵🇰' },
  { code: 'BD', nameEn: 'Bangladesh', nameAr: 'بنغلاديش', flag: '🇧🇩' },
  { code: 'CN', nameEn: 'China', nameAr: 'الصين', flag: '🇨🇳' },
  { code: 'JP', nameEn: 'Japan', nameAr: 'اليابان', flag: '🇯🇵' },
  { code: 'KR', nameEn: 'South Korea', nameAr: 'كوريا الجنوبية', flag: '🇰🇷' },
  { code: 'SG', nameEn: 'Singapore', nameAr: 'سنغافورة', flag: '🇸🇬' },
  { code: 'MY', nameEn: 'Malaysia', nameAr: 'ماليزيا', flag: '🇲🇾' },
  { code: 'ID', nameEn: 'Indonesia', nameAr: 'إندونيسيا', flag: '🇮🇩' },
  { code: 'TH', nameEn: 'Thailand', nameAr: 'تايلاند', flag: '🇹🇭' },
  { code: 'VN', nameEn: 'Vietnam', nameAr: 'فيتنام', flag: '🇻🇳' },
  { code: 'PH', nameEn: 'Philippines', nameAr: 'الفلبين', flag: '🇵🇭' },
  { code: 'AU', nameEn: 'Australia', nameAr: 'أستراليا', flag: '🇦🇺' },
  { code: 'NZ', nameEn: 'New Zealand', nameAr: 'نيوزيلندا', flag: '🇳🇿' },
  { code: 'ZA', nameEn: 'South Africa', nameAr: 'جنوب أفريقيا', flag: '🇿🇦' },
  { code: 'NG', nameEn: 'Nigeria', nameAr: 'نيجيريا', flag: '🇳🇬' },
  { code: 'KE', nameEn: 'Kenya', nameAr: 'كينيا', flag: '🇰🇪' },
  { code: 'ET', nameEn: 'Ethiopia', nameAr: 'إثيوبيا', flag: '🇪🇹' },
  { code: 'GH', nameEn: 'Ghana', nameAr: 'غانا', flag: '🇬🇭' },
];

export const COUNTRY_NAMES = COUNTRIES.map((c) => c.nameEn);

export const DEFAULT_COUNTRY = 'Sudan';

export const SELECTED_COUNTRY_STORAGE_KEY = 'ciar-selected-country';

export function getCountryByName(name: string): CountryOption | undefined {
  return COUNTRIES.find(
    (c) => c.nameEn.toLowerCase() === name.toLowerCase() || c.nameAr === name
  );
}

export function getStoredCountry(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SELECTED_COUNTRY_STORAGE_KEY);
}

export function setStoredCountry(name: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTED_COUNTRY_STORAGE_KEY, name);
}

export const DEFAULT_HERO_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1920&q=80',
  'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=1920&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80',
];
