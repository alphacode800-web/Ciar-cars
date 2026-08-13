'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type RecCar = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  city?: string | null;
  reasonAr?: string;
  images?: { url: string }[];
};

export function AiRecommendationsStrip({
  carId,
  className,
}: {
  carId?: string;
  className?: string;
}) {
  const { t, locale } = useTranslation();
  const { setView } = useAppStore();
  const [cars, setCars] = useState<RecCar[]>([]);
  const [note, setNote] = useState('');
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams({
          limit: '4',
          locale: locale || 'ar',
        });
        if (carId) q.set('carId', carId);
        const res = await fetch(`/api/ai/recommendations?${q}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (!cancelled && json.success) {
          setCars(json.data.cars || []);
          setNote(json.data.noteAr || '');
          setSource(json.data.source || '');
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [carId, locale]);

  if (!loading && cars.length === 0) return null;

  return (
    <section className={className || 'py-10'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                AI
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">{t('recommendations.title')}</h2>
            <p className="text-sm text-muted-foreground">
              {note || t('recommendations.subtitle')}
            </p>
          </div>
          {source === 'fallback' && (
            <Badge variant="secondary">{t('recommendations.fallback')}</Badge>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cars.map((car) => (
              <Card
                key={car.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setView('detail', { carId: car.id })}
              >
                <div className="aspect-[4/3] bg-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={car.images?.[0]?.url || '/placeholder-car.jpg'}
                    alt={car.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <CardContent className="p-3 space-y-1">
                  <p className="text-sm font-semibold truncate">{car.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {car.brand} {car.model} · {car.year}
                  </p>
                  <p className="text-sm font-bold text-emerald-600">
                    {Number(car.price).toLocaleString()}
                  </p>
                  {car.reasonAr && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {car.reasonAr}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
