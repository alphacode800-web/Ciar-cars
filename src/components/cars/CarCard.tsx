'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MapPin,
  Gauge,
  Fuel,
  Settings2,
  Eye,
  ArrowRight,
  Star,
  ImageIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { CURRENCY } from '@/lib/constants';
import { useTranslation } from '@/hooks/use-translation';
import type { CarListItem } from '@/types';

// ============ Unsplash Car Images Pool ============

const UNSPLASH_CAR_IMAGES = [
  'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1626668011687-8a114cf5a34c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1525609004556-c46c40d4f174?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&h=400&fit=crop',
];

function getCarPrimaryImage(car: CarListItem): string {
  if (car.primaryImage) return car.primaryImage;
  const hash = car.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return UNSPLASH_CAR_IMAGES[hash % UNSPLASH_CAR_IMAGES.length];
}

function CarImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative bg-muted overflow-hidden ${className}`}>
      {!loaded && !error && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } group-hover:scale-105`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

interface CarCardProps {
  car: CarListItem;
}

export function CarCard({ car }: CarCardProps) {
  const { setView } = useAppStore();
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);

  const primaryImage = useMemo(() => getCarPrimaryImage(car), [car]);

  const handleClick = () => {
    setView('detail', { carId: car.id, slug: car.slug });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price: number) => {
    return `${CURRENCY.symbol}${price.toLocaleString('en-US')}`;
  };

  const formatMileage = (km: number) => {
    if (km >= 1000) return `${(km / 1000).toFixed(0)}K km`;
    return `${km} km`;
  };

  const fuelLabel = (fuel: string) => {
    const map: Record<string, string> = {
      petrol: t('carCard.petrol'),
      diesel: t('carCard.diesel'),
      electric: t('carCard.electric'),
      hybrid: t('carCard.hybrid'),
    };
    return map[fuel] || fuel;
  };

  const transmissionLabel = (trans: string) => {
    const map: Record<string, string> = {
      automatic: t('carCard.automatic'),
      manual: t('carCard.manual'),
      cvt: 'CVT',
    };
    return map[trans] || trans;
  };

  const conditionLabel = (cond: string) => {
    if (cond === 'new') return t('carCard.new');
    if (cond === 'used') return t('carCard.used');
    return cond.charAt(0).toUpperCase() + cond.slice(1);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="h-full"
    >
      <div
        className="group cursor-pointer h-full overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 flex flex-col"
        onClick={handleClick}
      >
        {/* Single Main Image */}
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <CarImage
            src={primaryImage}
            alt={`${car.brand} ${car.model} ${car.year}`}
            className="absolute inset-0"
          />

          {/* Top gradient overlay for badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

          {/* Badges - top left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {car.isFeatured && (
              <Badge className="bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 border-0 shadow-sm">
                {t('carCard.featured')}
              </Badge>
            )}
            {car.condition === 'new' && (
              <Badge className="bg-teal-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 border-0 shadow-sm">
                {t('carCard.new')}
              </Badge>
            )}
            {car.isAvailableForRent && (
              <Badge className="bg-amber-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 border-0 shadow-sm">
                {t('carCard.forRent')}
              </Badge>
            )}
          </div>

          {/* Favorite button - top right */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-all duration-300 z-10 hover:scale-110"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-300 ${
                isFavorite
                  ? 'text-red-500 fill-red-500 scale-110'
                  : 'text-white/90'
              }`}
            />
          </button>

          {/* Views count - bottom left */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md z-10">
            <Eye className="h-3 w-3 text-white/80" />
            <span className="text-[10px] text-white/80 font-medium tabular-nums">
              {(car.viewsCount || 0).toLocaleString()}
            </span>
          </div>

          {/* View Details button - bottom right, appears on hover */}
          <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-medium shadow-lg">
              {t('carCard.viewDetails')}
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Title + Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
              {car.brand} {car.model}{' '}
              <span className="text-muted-foreground font-normal">{car.year}</span>
            </h3>
            {car.averageRating != null && (
              <div className="flex items-center gap-0.5 shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-foreground">
                  {car.averageRating.toFixed(1)}
                </span>
                {car.reviewCount != null && car.reviewCount > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    ({car.reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-foreground tracking-tight">
              {formatPrice(car.price)}
            </span>
            {car.isNegotiable && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30"
              >
                {t('carCard.negotiable')}
              </Badge>
            )}
            {car.isAvailableForRent && car.rentalPriceDaily != null && (
              <span className="text-[11px] text-muted-foreground">
                ${car.rentalPriceDaily}{t('carCard.perDay')}
              </span>
            )}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3">
            {car.mileage != null && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Gauge className="h-3.5 w-3.5 shrink-0 text-emerald-500/70" />
                <span className="truncate">{formatMileage(car.mileage)}</span>
              </div>
            )}
            {car.fuelType && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Fuel className="h-3.5 w-3.5 shrink-0 text-emerald-500/70" />
                <span className="truncate">{fuelLabel(car.fuelType)}</span>
              </div>
            )}
            {car.transmission && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Settings2 className="h-3.5 w-3.5 shrink-0 text-emerald-500/70" />
                <span className="truncate">{transmissionLabel(car.transmission)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500/70" />
              <span className="truncate">{car.city}</span>
            </div>
          </div>

          {/* Footer - Owner + Condition */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  {(car.ownerName || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {car.ownerName || 'Unknown'}
              </span>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-normal border-border/60"
            >
              {conditionLabel(car.condition)}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm flex flex-col">
      <Skeleton className="w-full aspect-[16/10] rounded-none" />
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-6 w-1/3" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}
