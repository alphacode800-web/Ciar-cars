'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  PaymentMethodConfig,
  SocialLinksConfig,
  PageBackgroundsConfig,
} from '@/lib/cms-content';

export interface SiteBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position: string;
  order: number;
}

export interface SiteNavItem {
  id: string;
  label: string;
  url?: string | null;
  icon?: string | null;
  order: number;
  isOpen?: boolean;
  position: string;
  children?: SiteNavItem[];
}

export interface SiteHomepageSection {
  id: string;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  content?: unknown;
  order: number;
  isActive: boolean;
}

export interface SitePage {
  slug: string;
  title?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  content?: unknown;
}

export interface SiteContentData {
  heroBackgrounds: string[];
  banners: SiteBanner[];
  homepageSections: SiteHomepageSection[];
  settings: Record<string, string>;
  newsTicker?: unknown;
  brandWordmark?: unknown;
  navigation: { navbar: SiteNavItem[]; footer: SiteNavItem[] };
  paymentMethods: PaymentMethodConfig[];
  socialLinks: SocialLinksConfig;
  pageBackgrounds: PageBackgroundsConfig;
  pages: SitePage[];
}

let cached: SiteContentData | null = null;
let inflight: Promise<SiteContentData | null> | null = null;

async function fetchSiteContent(): Promise<SiteContentData | null> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch('/api/public/site-content', { credentials: 'include' });
      const json = await res.json();
      if (!json?.success || !json.data) return null;
      cached = json.data as SiteContentData;
      return cached;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function invalidateSiteContentCache() {
  cached = null;
}

export function useSiteContent() {
  const [data, setData] = useState<SiteContentData | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    invalidateSiteContentCache();
    setLoading(true);
    const next = await fetchSiteContent();
    setData(next);
    setError(next ? null : 'Failed to load site content');
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const next = await fetchSiteContent();
      if (cancelled) return;
      setData(next);
      setError(next ? null : 'Failed to load site content');
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error, reload };
}

export function getPageContent<T = unknown>(
  data: SiteContentData | null | undefined,
  slug: string
): T | null {
  const page = data?.pages?.find((p) => p.slug === slug);
  return (page?.content as T) ?? null;
}
