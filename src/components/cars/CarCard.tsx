'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MapPin,
  Gauge,
  Fuel,
  Settings2,
  Eye,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { CURRENCY } from '@/lib/constants';
import type { CarListItem } from '@/types';

interface CarCardProps {
  car: CarListItem;
}

export function CarCard({ car }: CarCardProps) {
  const { setView } = useAppStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    setView('detail', { carId: car.id, slug: car.slug });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price: number) => {
    return `${CURRENCY.symbol}${price.toLocaleString('en-EG')}`;
  };

  const formatMileage = (km: number) => {
    if (km >= 1000) return `${(km / 1000).toFixed(0)}K km`;
    return `${km} km`;
  };

  const fuelLabel = (fuel: string) => {
    const labels: Record<string, string> = {
      petrol: 'Petrol',
      diesel: 'Diesel',
      electric: 'Electric',
      hybrid: 'Hybrid',
    };
    return labels[fuel] || fuel;
  };

  const transmissionLabel = (trans: string) => {
    const labels: Record<string, string> = {
      automatic: 'Auto',
      manual: 'Manual',
      cvt: 'CVT',
    };
    return labels[trans] || trans;
  };

  const conditionLabel = (cond: string) => {
    return cond.charAt(0).toUpperCase() + cond.slice(1);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="group cursor-pointer overflow-hidden border shadow-sm hover:shadow-lg transition-shadow duration-300 h-full"
        onClick={handleClick}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] bg-muted overflow-hidden">
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0 rounded-none" />
          )}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="text-4xl mb-1">🚗</div>
                <span className="text-xs text-muted-foreground">No Image</span>
              </div>
            </div>
          ) : (
            <img
              src={car.primaryImage || `/api/placeholder/car/${car.id}`}
              alt={`${car.brand} ${car.model} ${car.year}`}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {car.isFeatured && (
              <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 border-0">
                Featured
              </Badge>
            )}
            {car.condition === 'new' && (
              <Badge className="bg-blue-600 text-white text-[10px] px-2 py-0.5 border-0">
                New
              </Badge>
            )}
            {car.isAvailableForRent && (
              <Badge className="bg-purple-600 text-white text-[10px] px-2 py-0.5 border-0">
                For Rent
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite
                  ? 'text-red-500 fill-red-500'
                  : 'text-white'
              } transition-colors`}
            />
          </button>

          {/* Views */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
            <Eye className="h-3 w-3 text-white/80" />
            <span className="text-[10px] text-white/80 font-medium">
              {car.viewsCount?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {car.brand} {car.model} {car.year}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(car.price)}
            </span>
            {car.isNegotiable && (
              <Badge variant="secondary" className="text-[10px]">
                Negotiable
              </Badge>
            )}
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {car.mileage != null && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Gauge className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{formatMileage(car.mileage)}</span>
              </div>
            )}
            {car.fuelType && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Fuel className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{fuelLabel(car.fuelType)}</span>
              </div>
            )}
            {car.transmission && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Settings2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{transmissionLabel(car.transmission)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{car.city}</span>
            </div>
          </div>

          {/* Owner & Condition */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-zinc-100 dark:bg-zinc-800">
                  {(car.ownerName || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {car.ownerName || 'Unknown'}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-normal">
              {conditionLabel(car.condition)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CarCardSkeleton() {
  return (
    <Card className="overflow-hidden border shadow-sm h-full">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
