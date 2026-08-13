'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import { finalAdPrice } from '@/lib/ad-constants';
import { ImageIcon, MapPin, Truck } from 'lucide-react';

export type AdListItem = {
  id: string;
  slug?: string;
  title: string;
  category: string;
  price: number;
  discountPercent?: number;
  finalPrice?: number;
  currency?: string;
  city?: string | null;
  isFeatured?: boolean;
  shippingAvailable?: boolean;
  status?: string;
  media?: { url: string; type: string; isPrimary?: boolean }[];
};

export function AdvertisementCard({ ad, locale = 'ar' }: { ad: AdListItem; locale?: string }) {
  const { setView } = useAppStore();
  const isAr = locale === 'ar';
  const primary =
    ad.media?.find((m) => m.isPrimary && m.type === 'image') ||
    ad.media?.find((m) => m.type === 'image') ||
    ad.media?.[0];
  const price = ad.finalPrice ?? finalAdPrice(ad.price, ad.discountPercent || 0);

  return (
    <Card
      className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
      onClick={() => setView('advertisement-detail', { id: ad.id })}
    >
      <div className="relative aspect-[4/3] bg-muted">
        {primary?.type === 'video' ? (
          <video src={primary.url} className="h-full w-full object-cover" muted />
        ) : primary?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.url}
            alt={ad.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-2 start-2 flex flex-wrap gap-1">
          {ad.isFeatured && (
            <Badge className="bg-amber-500 text-white">{isAr ? 'مميز' : 'Featured'}</Badge>
          )}
          {(ad.discountPercent || 0) > 0 && (
            <Badge variant="destructive">-{ad.discountPercent}%</Badge>
          )}
        </div>
      </div>
      <CardContent className="p-3 space-y-1.5">
        <p className="font-semibold line-clamp-2 text-sm leading-snug">{ad.title}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold text-primary">
            {price.toLocaleString()} {ad.currency || 'EGP'}
          </p>
          {ad.shippingAvailable && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Truck className="h-3 w-3" />
              {isAr ? 'شحن' : 'Ship'}
            </span>
          )}
        </div>
        {ad.city && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {ad.city}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
