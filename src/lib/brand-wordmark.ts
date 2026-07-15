export type BrandFontFamily = 'sans' | 'display' | 'arabic' | 'mono';
export type BrandFontWeight = '300' | '400' | '500' | '600' | '700' | '800' | '900';

export interface BrandWordmarkConfig {
  primaryText: string;
  secondaryText: string;
  primaryTextAr: string;
  secondaryTextAr: string;
  showSecondary: boolean;
  fontFamily: BrandFontFamily;
  fontWeight: BrandFontWeight;
  fontSize: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'capitalize';
  italic: boolean;
  useGradient: boolean;
  gradientStart: string;
  gradientEnd: string;
  solidColor: string;
  secondaryColor: string;
  secondaryFontWeight: BrandFontWeight;
  secondaryFontSize: number;
  showGlow: boolean;
  glowColor: string;
  showUnderline: boolean;
  underlineStart: string;
  underlineEnd: string;
  showShimmer: boolean;
}

export const BRAND_WORDMARK_KEY = 'brand_wordmark' as const;

export const DEFAULT_BRAND_WORDMARK: BrandWordmarkConfig = {
  primaryText: 'CIAR',
  secondaryText: 'cars',
  primaryTextAr: 'سيّار',
  secondaryTextAr: 'كارز',
  showSecondary: true,
  fontFamily: 'display',
  fontWeight: '700',
  fontSize: 26,
  letterSpacing: 1.5,
  textTransform: 'none',
  italic: false,
  useGradient: false,
  gradientStart: '#f5b972',
  gradientEnd: '#cf8a3b',
  solidColor: '#f5b972',
  secondaryColor: '#d7b487',
  secondaryFontWeight: '300',
  secondaryFontSize: 18,
  showGlow: false,
  glowColor: 'rgba(245, 185, 114, 0.3)',
  showUnderline: false,
  underlineStart: '#f5b972',
  underlineEnd: '#cf8a3b',
  showShimmer: false,
};

export const BRAND_WORDMARK_PRESETS: Record<string, Partial<BrandWordmarkConfig>> = {
  rcar: {
    primaryText: 'CIAR',
    secondaryText: 'Cars',
    primaryTextAr: 'سيّار',
    secondaryTextAr: 'كارز',
    useGradient: true,
    gradientStart: '#059669',
    gradientEnd: '#0d9488',
    showGlow: true,
    glowColor: 'rgba(16, 185, 129, 0.35)',
    showUnderline: true,
    underlineStart: '#10b981',
    underlineEnd: '#06b6d4',
    fontFamily: 'display',
    fontWeight: '700',
    letterSpacing: 1.5,
    showShimmer: true,
  },
  luxury: {
    primaryText: 'CIAR',
    secondaryText: 'Motors',
    primaryTextAr: 'سيّار',
    secondaryTextAr: 'المحرّكات',
    useGradient: true,
    gradientStart: '#d4af37',
    gradientEnd: '#f5e6a3',
    solidColor: '#d4af37',
    secondaryColor: '#a8a29e',
    showGlow: true,
    glowColor: 'rgba(212, 175, 55, 0.4)',
    showUnderline: true,
    underlineStart: '#d4af37',
    underlineEnd: '#b8860b',
    fontFamily: 'display',
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    showShimmer: true,
  },
  minimal: {
    primaryText: 'CIAR',
    secondaryText: 'Cars',
    primaryTextAr: 'سيّار',
    secondaryTextAr: 'كارز',
    useGradient: false,
    solidColor: '#0f172a',
    secondaryColor: '#64748b',
    showGlow: false,
    showUnderline: false,
    showShimmer: false,
    fontFamily: 'sans',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  neon: {
    primaryText: 'CIAR',
    secondaryText: 'Cars',
    primaryTextAr: 'سيّار',
    secondaryTextAr: 'كارز',
    useGradient: true,
    gradientStart: '#22d3ee',
    gradientEnd: '#a855f7',
    secondaryColor: '#c4b5fd',
    showGlow: true,
    glowColor: 'rgba(168, 85, 247, 0.5)',
    showUnderline: true,
    underlineStart: '#22d3ee',
    underlineEnd: '#a855f7',
    fontFamily: 'display',
    fontWeight: '800',
    letterSpacing: 2,
    showShimmer: true,
  },
};

const FONT_FAMILY_MAP: Record<BrandFontFamily, string> = {
  sans: 'var(--font-sans), system-ui, sans-serif',
  display: 'var(--font-display), system-ui, sans-serif',
  arabic: 'var(--font-arabic), system-ui, sans-serif',
  mono: 'ui-monospace, monospace',
};

export function getBrandFontFamily(family: BrandFontFamily): string {
  return FONT_FAMILY_MAP[family] ?? FONT_FAMILY_MAP.display;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function parseBrandWordmark(settings: Record<string, string | undefined>): BrandWordmarkConfig {
  const raw = settings[BRAND_WORDMARK_KEY];
  if (!raw) return { ...DEFAULT_BRAND_WORDMARK };
  try {
    const parsed = JSON.parse(raw) as Partial<BrandWordmarkConfig>;
    const normalizedPrimary = (parsed.primaryText ?? DEFAULT_BRAND_WORDMARK.primaryText).trim();
    const fixedPrimary = /^rciar$/i.test(normalizedPrimary) ? 'CIAR' : normalizedPrimary;

    return {
      ...DEFAULT_BRAND_WORDMARK,
      ...parsed,
      primaryText: fixedPrimary || DEFAULT_BRAND_WORDMARK.primaryText,
      secondaryText: (parsed.secondaryText ?? DEFAULT_BRAND_WORDMARK.secondaryText).trim(),
      primaryTextAr: (parsed.primaryTextAr ?? DEFAULT_BRAND_WORDMARK.primaryTextAr).trim() || DEFAULT_BRAND_WORDMARK.primaryTextAr,
      secondaryTextAr: (parsed.secondaryTextAr ?? DEFAULT_BRAND_WORDMARK.secondaryTextAr).trim(),
      fontSize: clamp(Number(parsed.fontSize) || DEFAULT_BRAND_WORDMARK.fontSize, 16, 42),
      secondaryFontSize: clamp(Number(parsed.secondaryFontSize) || DEFAULT_BRAND_WORDMARK.secondaryFontSize, 12, 28),
      letterSpacing: clamp(Number(parsed.letterSpacing) ?? DEFAULT_BRAND_WORDMARK.letterSpacing, -1, 6),
    };
  } catch {
    return { ...DEFAULT_BRAND_WORDMARK };
  }
}

export function serializeBrandWordmark(config: BrandWordmarkConfig): Record<string, string> {
  return { [BRAND_WORDMARK_KEY]: JSON.stringify(config) };
}

export const BRAND_SIZE_SCALE = { sm: 0.72, md: 1, lg: 1.35 } as const;
