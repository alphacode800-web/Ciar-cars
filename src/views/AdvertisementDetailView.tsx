'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Truck,
  Package,
} from 'lucide-react';
import { getAdvertisement } from '@/lib/client-api';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { AD_CATEGORIES, finalAdPrice } from '@/lib/ad-constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function whatsappHref(value?: string | null) {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  const digits = value.replace(/[^\d+]/g, '');
  if (!digits) return null;
  const normalized = digits.startsWith('+') ? digits.slice(1) : digits;
  return `https://wa.me/${normalized}`;
}

export default function AdvertisementDetailView() {
  const { viewParams, setView } = useAppStore();
  const { locale } = useTranslation();
  const isAr = locale === 'ar';
  const id = String(viewParams?.id || '');

  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    void getAdvertisement(id).then((res) => {
      setLoading(false);
      if (res.success) setAd(res.data);
      else setAd(null);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">
          {isAr ? 'الإعلان غير موجود أو غير منشور' : 'Ad not found or not published'}
        </p>
        <Button className="mt-4" variant="outline" onClick={() => setView('advertisements')}>
          {isAr ? 'العودة للإعلانات' : 'Back to ads'}
        </Button>
      </div>
    );
  }

  const media = ad.media || [];
  const current = media[activeMedia] || media[0];
  const price = ad.finalPrice ?? finalAdPrice(ad.price, ad.discountPercent || 0);
  const wa = whatsappHref(ad.whatsapp || ad.phone);
  const category = AD_CATEGORIES.find((item) => item.value === ad.category);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8" dir={isAr ? 'rtl' : 'ltr'}>
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => setView('advertisements')}>
        {isAr ? (
          <ArrowRight className="me-1 h-4 w-4" />
        ) : (
          <ArrowLeft className="me-1 h-4 w-4" />
        )}
        {isAr ? 'الإعلانات' : 'Ads'}
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border bg-muted aspect-square">
            {current?.type === 'video' ? (
              <video src={current.url} className="h-full w-full object-contain" controls />
            ) : current?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.url} alt={ad.title} className="h-full w-full object-contain" />
            ) : null}
          </div>
          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {media.map((m: any, i: number) => (
                <button
                  key={m.id || m.url}
                  type="button"
                  onClick={() => setActiveMedia(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border ${
                    i === activeMedia ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {m.type === 'video' ? (
                    <video src={m.url} className="h-full w-full object-cover" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ad.isFeatured && (
              <Badge className="bg-amber-500 text-white">{isAr ? 'مميز' : 'Featured'}</Badge>
            )}
            <Badge variant="secondary">
              {category ? (isAr ? category.labelAr : category.labelEn) : ad.category}
            </Badge>
            {ad.subcategory && <Badge variant="outline">{ad.subcategory}</Badge>}
          </div>
          <h1 className="text-2xl font-bold">{ad.title}</h1>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-primary">
              {price.toLocaleString()} {ad.currency || 'EGP'}
            </p>
            {(ad.discountPercent || 0) > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {ad.price.toLocaleString()}
                </span>
                <Badge variant="destructive">-{ad.discountPercent}%</Badge>
              </>
            )}
          </div>

          {ad.description && (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
              {ad.description}
            </p>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            {ad.fabricType && (
              <div>
                <p className="text-muted-foreground">{isAr ? 'نوع القماش' : 'Fabric'}</p>
                <p className="font-medium">{ad.fabricType}</p>
              </div>
            )}
            {ad.quantity != null && (
              <div>
                <p className="text-muted-foreground">{isAr ? 'العدد المتبقي' : 'Quantity'}</p>
                <p className="font-medium flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {ad.quantity}
                </p>
              </div>
            )}
            {Array.isArray(ad.colors) && ad.colors.length > 0 && (
              <div className="col-span-2">
                <p className="text-muted-foreground mb-1">{isAr ? 'الألوان' : 'Colors'}</p>
                <div className="flex flex-wrap gap-1">
                  {ad.colors.map((c: string) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(ad.sizes) && ad.sizes.length > 0 && (
              <div className="col-span-2">
                <p className="text-muted-foreground mb-1">{isAr ? 'المقاسات' : 'Sizes'}</p>
                <div className="flex flex-wrap gap-1">
                  {ad.sizes.map((s: string) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {ad.city && (
              <div className="col-span-2 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {[ad.city, ad.country].filter(Boolean).join(', ')}
              </div>
            )}
            {ad.shippingAvailable && (
              <div className="col-span-2 rounded-lg border p-3">
                <p className="flex items-center gap-1 font-medium">
                  <Truck className="h-4 w-4" />
                  {isAr ? 'الشحن متاح' : 'Shipping available'}
                </p>
                {ad.shippingInfo && (
                  <p className="mt-1 text-xs text-muted-foreground">{ad.shippingInfo}</p>
                )}
              </div>
            )}
          </div>

          <Card>
            <CardContent className="flex flex-wrap gap-2 p-4">
              {ad.phone && (
                <Button asChild>
                  <a href={`tel:${ad.phone}`}>
                    <Phone className="me-1 h-4 w-4" />
                    {isAr ? 'اتصال' : 'Call'}
                  </a>
                </Button>
              )}
              {wa && (
                <Button variant="outline" asChild>
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="me-1 h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {ad.owner?.name && (
            <p className="text-xs text-muted-foreground">
              {isAr ? 'المعلن:' : 'Seller:'} {ad.owner.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
