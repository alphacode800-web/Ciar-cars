'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Search, Megaphone, Loader2 } from 'lucide-react';
import { getAdvertisements } from '@/lib/client-api';
import { AD_CATEGORIES } from '@/lib/ad-constants';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import { AdvertisementCard, type AdListItem } from '@/components/ads/AdvertisementCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdvertisementsView() {
  const { locale } = useTranslation();
  const { setView } = useAppStore();
  const isAr = locale === 'ar';

  const [items, setItems] = useState<AdListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [shipping, setShipping] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAdvertisements({
      page,
      limit: 12,
      search: search || undefined,
      category: category !== 'all' ? category : undefined,
      shippingAvailable: shipping === 'yes' ? true : shipping === 'no' ? false : undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setLoading(false);
    if (res.success && Array.isArray(res.data)) {
      setItems(res.data as AdListItem[]);
      setTotalPages(res.pagination?.totalPages || 1);
    } else {
      setItems([]);
    }
  }, [page, search, category, shipping]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="container mx-auto px-4 py-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Megaphone className="h-7 w-7 text-primary" />
            {isAr ? 'الإعلانات' : 'Advertisements'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? 'تصفح الإعلانات المعتمدة والمنشورة على المنصة'
              : 'Browse approved published ads on the platform'}
          </p>
        </div>
        <Button onClick={() => setView('create-advertisement')}>
          {isAr ? 'إضافة إعلان' : 'Post an Ad'}
        </Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={isAr ? 'بحث...' : 'Search...'}
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => {
            setPage(1);
            setCategory(v);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={isAr ? 'الفئة' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? 'كل الفئات' : 'All categories'}</SelectItem>
            {AD_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {isAr ? c.labelAr : c.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={shipping}
          onValueChange={(v) => {
            setPage(1);
            setShipping(v);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={isAr ? 'الشحن' : 'Shipping'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="yes">{isAr ? 'مع شحن' : 'With shipping'}</SelectItem>
            <SelectItem value="no">{isAr ? 'بدون شحن' : 'No shipping'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          {isAr ? 'لا توجد إعلانات منشورة حاليًا' : 'No published ads yet'}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((ad) => (
            <AdvertisementCard key={ad.id} ad={ad} locale={locale} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            {isAr ? 'السابق' : 'Prev'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isAr ? 'التالي' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
}
