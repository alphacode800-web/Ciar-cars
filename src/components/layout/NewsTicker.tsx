'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import {
  parseNewsTicker,
  resolveTickerLink,
  TICKER_VIEW_MAP,
  DEFAULT_NEWS_TICKER,
  type NewsTickerConfig,
} from '@/lib/news-ticker';
import { NewsTickerBar } from '@/components/layout/NewsTickerBar';

const ARABIC_HEADLINES_BY_LINK: Record<string, string> = {
  listing: 'أكثر من 3,100 سيارة موثقة عبر 60+ دولة — تصفح الآن',
  'sell-car': 'أعلن عن سيارتك مجاناً ووصل إلى آلاف المشترين',
  rental: 'تأجير مرن يومي وأسبوعي وشهري بأسعار منافسة',
  wallet: 'محفظة CIAR الآمنة للدفع والتحصيل بثقة كاملة',
};

export function NewsTicker() {
  const { isRTL } = useTranslation();
  const { setView } = useAppStore();
  const [config, setConfig] = useState<NewsTickerConfig | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/public/site-content', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data?.newsTicker) {
          setConfig(json.data.newsTicker);
          return;
        }
        setConfig(DEFAULT_NEWS_TICKER);
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_NEWS_TICKER);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visible = config?.enabled && (config.items?.some((i) => i.text.trim()) ?? false);

  useEffect(() => {
    const height = visible && config ? `${config.style.height}px` : '0px';
    document.documentElement.style.setProperty('--news-ticker-h', height);
    return () => {
      document.documentElement.style.setProperty('--news-ticker-h', '0px');
    };
  }, [visible, config]);

  const handleItemClick = useCallback(
    (item: { link?: string }) => {
      const resolved = resolveTickerLink(item.link);
      if (!resolved) return;
      if (resolved.startsWith('http')) {
        window.open(resolved, '_blank', 'noopener,noreferrer');
        return;
      }
      const view = (TICKER_VIEW_MAP[resolved] ?? 'listing') as Parameters<typeof setView>[0];
      setView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setView]
  );

  if (!visible || !config) return null;

  const localizedConfig: NewsTickerConfig = isRTL
    ? {
        ...config,
        items: config.items.map((item) => {
          const key = (item.link ?? '').replace(/^\//, '').split('?')[0];
          return {
            ...item,
            text: ARABIC_HEADLINES_BY_LINK[key] ?? item.text,
          };
        }),
        style: {
          ...config.style,
          labelText:
            config.style.labelText.toLowerCase() === 'breaking' || config.style.labelText.toLowerCase() === 'live'
              ? 'عاجل'
              : config.style.labelText,
        },
      }
    : config;

  return <NewsTickerBar config={localizedConfig} isRTL={isRTL} onItemClick={handleItemClick} />;
}
