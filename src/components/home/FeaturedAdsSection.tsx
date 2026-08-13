'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, ArrowRight } from 'lucide-react';
import { getAdvertisements } from '@/lib/client-api';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import { AdvertisementCard, type AdListItem } from '@/components/ads/AdvertisementCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedAdsSection() {
  const { locale } = useTranslation();
  const { setView } = useAppStore();
  const isAr = locale === 'ar';
  const [items, setItems] = useState<AdListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getAdvertisements({
      page: 1,
      limit: 8,
      isFeatured: true,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }).then((res) => {
      setLoading(false);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setItems(res.data as AdListItem[]);
      } else {
        // fallback: latest published
        void getAdvertisements({ page: 1, limit: 4 }).then((r2) => {
          if (r2.success && Array.isArray(r2.data)) setItems(r2.data as AdListItem[]);
        });
      }
    });
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
            <Megaphone className="h-6 w-6 text-primary" />
            {isAr ? 'إعلانات مميزة' : 'Featured Ads'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'أحدث الإعلانات المعتمدة على المنصة' : 'Latest approved ads on the platform'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setView('advertisements')}>
          {isAr ? 'عرض الكل' : 'View all'}
          <ArrowRight className="ms-1 h-4 w-4" />
        </Button>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.slice(0, 8).map((ad) => (
            <AdvertisementCard key={ad.id} ad={ad} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
