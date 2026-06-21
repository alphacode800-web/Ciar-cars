'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import {
  parseNewsTicker,
  resolveTickerLink,
  TICKER_VIEW_MAP,
  type NewsTickerConfig,
} from '@/lib/news-ticker';
import { NewsTickerBar } from '@/components/layout/NewsTickerBar';

export function NewsTicker() {
  const { isRTL } = useTranslation();
  const { setView } = useAppStore();
  const [config, setConfig] = useState<NewsTickerConfig | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/public/site-content', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        setConfig(json.data?.newsTicker ?? null);
      })
      .catch(() => {
        if (!cancelled) setConfig(null);
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

  return <NewsTickerBar config={config} isRTL={isRTL} onItemClick={handleItemClick} />;
}
