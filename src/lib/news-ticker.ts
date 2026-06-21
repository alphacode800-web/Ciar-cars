export interface NewsTickerItem {
  id: string;
  text: string;
  link?: string;
}

export type NewsTickerFontFamily = 'sans' | 'display' | 'arabic' | 'mono';
export type NewsTickerFontWeight = '400' | '500' | '600' | '700' | '800';
export type NewsTickerSeparator = 'dot' | 'line' | 'diamond' | 'none';

export interface NewsTickerStyle {
  height: number;
  backgroundColor: string;
  backgroundColorEnd: string;
  useGradient: boolean;
  textColor: string;
  labelBackgroundColor: string;
  labelTextColor: string;
  accentColor: string;
  borderColor: string;
  fontSize: number;
  fontWeight: NewsTickerFontWeight;
  letterSpacing: number;
  fontFamily: NewsTickerFontFamily;
  textTransform: 'none' | 'uppercase';
  labelText: string;
  showLabel: boolean;
  labelPulse: boolean;
  showSeparator: boolean;
  separatorStyle: NewsTickerSeparator;
  pauseOnHover: boolean;
  showShimmer: boolean;
  showEdgeFade: boolean;
}

export interface NewsTickerConfig {
  enabled: boolean;
  speedSeconds: number;
  items: NewsTickerItem[];
  style: NewsTickerStyle;
}

export const NEWS_TICKER_KEYS = {
  enabled: 'news_ticker_enabled',
  items: 'news_ticker_items',
  speed: 'news_ticker_speed',
  style: 'news_ticker_style',
} as const;

export const DEFAULT_NEWS_TICKER_STYLE: NewsTickerStyle = {
  height: 40,
  backgroundColor: '#0c0c0e',
  backgroundColorEnd: '#1e1b4b',
  useGradient: true,
  textColor: '#f8fafc',
  labelBackgroundColor: '#dc2626',
  labelTextColor: '#ffffff',
  accentColor: '#2563eb',
  borderColor: 'rgba(255,255,255,0.08)',
  fontSize: 13,
  fontWeight: '600',
  letterSpacing: 0.4,
  fontFamily: 'sans',
  textTransform: 'none',
  labelText: 'BREAKING',
  showLabel: true,
  labelPulse: true,
  showSeparator: true,
  separatorStyle: 'line',
  pauseOnHover: true,
  showShimmer: true,
  showEdgeFade: true,
};

export const NEWS_TICKER_PRESETS: Record<string, Partial<NewsTickerStyle>> = {
  classic: {
    backgroundColor: '#0a0a0a',
    backgroundColorEnd: '#171717',
    useGradient: true,
    textColor: '#ffffff',
    labelBackgroundColor: '#dc2626',
    labelTextColor: '#ffffff',
    accentColor: '#ef4444',
    labelText: 'BREAKING',
    showShimmer: true,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  rcar: {
    backgroundColor: '#0a0a0a',
    backgroundColorEnd: '#1e3a5f',
    useGradient: true,
    textColor: '#f1f5f9',
    labelBackgroundColor: '#dc2626',
    labelTextColor: '#ffffff',
    accentColor: '#2563eb',
    labelText: 'RCiAR',
    showShimmer: true,
    fontWeight: '600',
  },
  minimal: {
    backgroundColor: '#18181b',
    backgroundColorEnd: '#18181b',
    useGradient: false,
    textColor: '#e4e4e7',
    labelBackgroundColor: '#059669',
    labelTextColor: '#ffffff',
    accentColor: '#34d399',
    labelText: 'NEWS',
    showShimmer: false,
    labelPulse: false,
    fontWeight: '500',
    separatorStyle: 'dot',
  },
  gold: {
    backgroundColor: '#1c1917',
    backgroundColorEnd: '#292524',
    useGradient: true,
    textColor: '#fef3c7',
    labelBackgroundColor: '#b45309',
    labelTextColor: '#fffbeb',
    accentColor: '#fbbf24',
    labelText: 'LIVE',
    showShimmer: true,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
};

export const DEFAULT_NEWS_TICKER: NewsTickerConfig = {
  enabled: true,
  speedSeconds: 50,
  items: [
    {
      id: '1',
      text: 'Over 3,100 verified cars across 60+ countries — browse now',
      link: 'listing',
    },
    {
      id: '2',
      text: 'List your car for free and reach thousands of buyers',
      link: 'sell-car',
    },
    {
      id: '3',
      text: 'Flexible car rentals — book daily, weekly, or monthly',
      link: 'rental',
    },
    {
      id: '4',
      text: 'Secure CIAR Wallet — pay and get paid with confidence',
      link: 'wallet',
    },
  ],
  style: DEFAULT_NEWS_TICKER_STYLE,
};

const FONT_FAMILY_MAP: Record<NewsTickerFontFamily, string> = {
  sans: 'var(--font-sans), system-ui, sans-serif',
  display: 'var(--font-display), system-ui, sans-serif',
  arabic: 'var(--font-arabic), system-ui, sans-serif',
  mono: 'ui-monospace, monospace',
};

export function getTickerFontFamily(family: NewsTickerFontFamily): string {
  return FONT_FAMILY_MAP[family] ?? FONT_FAMILY_MAP.sans;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseStyle(raw: string | undefined): NewsTickerStyle {
  if (!raw) return { ...DEFAULT_NEWS_TICKER_STYLE };
  try {
    const parsed = JSON.parse(raw) as Partial<NewsTickerStyle>;
    return {
      ...DEFAULT_NEWS_TICKER_STYLE,
      ...parsed,
      height: clamp(Number(parsed.height) || DEFAULT_NEWS_TICKER_STYLE.height, 32, 56),
      fontSize: clamp(Number(parsed.fontSize) || DEFAULT_NEWS_TICKER_STYLE.fontSize, 11, 18),
      letterSpacing: clamp(Number(parsed.letterSpacing) ?? DEFAULT_NEWS_TICKER_STYLE.letterSpacing, 0, 4),
    };
  } catch {
    return { ...DEFAULT_NEWS_TICKER_STYLE };
  }
}

export function parseNewsTicker(settings: Record<string, string | undefined>): NewsTickerConfig {
  const enabled = settings[NEWS_TICKER_KEYS.enabled] !== 'false';
  const speedRaw = Number(settings[NEWS_TICKER_KEYS.speed]);
  const speedSeconds = clamp(
    Number.isFinite(speedRaw) ? speedRaw : DEFAULT_NEWS_TICKER.speedSeconds,
    15,
    120
  );

  let items = DEFAULT_NEWS_TICKER.items;
  const rawItems = settings[NEWS_TICKER_KEYS.items];
  if (rawItems) {
    try {
      const parsed = JSON.parse(rawItems) as NewsTickerItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed
          .filter((item) => item && typeof item.text === 'string' && item.text.trim())
          .map((item, index) => ({
            id: item.id || String(index + 1),
            text: item.text.trim(),
            link: item.link?.trim() || undefined,
          }));
      }
    } catch {
      items = DEFAULT_NEWS_TICKER.items;
    }
  }

  const style = parseStyle(settings[NEWS_TICKER_KEYS.style]);

  return { enabled, speedSeconds, items, style };
}

export function serializeNewsTicker(config: NewsTickerConfig): Record<string, string> {
  return {
    [NEWS_TICKER_KEYS.enabled]: config.enabled ? 'true' : 'false',
    [NEWS_TICKER_KEYS.speed]: String(config.speedSeconds),
    [NEWS_TICKER_KEYS.items]: JSON.stringify(config.items),
    [NEWS_TICKER_KEYS.style]: JSON.stringify(config.style),
  };
}

export function resolveTickerLink(link: string | undefined): string | null {
  if (!link?.trim()) return null;
  const trimmed = link.trim();
  if (trimmed.startsWith('http')) return trimmed;
  return trimmed.replace(/^\//, '').split('?')[0];
}

export const TICKER_VIEW_MAP: Record<string, string> = {
  listing: 'listing',
  'sell-car': 'sell-car',
  rental: 'rental',
  wallet: 'wallet',
  contact: 'contact',
  about: 'about',
  home: 'home',
  search: 'search',
};
