'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarCard, CarCardSkeleton } from '@/components/cars/CarCard';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { CarListItem } from '@/types';
import { CarCondition, FuelType, TransmissionType, BodyType, CarStatus } from '@/types';

/** 4 columns × 3 rows on desktop */
const PAGE_SIZE = 12;

const MOCK_FEATURED_CARS: CarListItem[] = [
  {
    id: '1',
    title: '2024 BMW M4 Competition',
    slug: '2024-bmw-m4-competition',
    brand: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    condition: CarCondition.NEW,
    price: 82000,
    currency: 'USD',
    mileage: 0,
    fuelType: FuelType.PETROL,
    transmission: TransmissionType.AUTOMATIC,
    bodyType: BodyType.COUPE,
    city: 'Dubai',
    status: CarStatus.ACTIVE,
    isFeatured: true,
    isBoosted: false,
    isNegotiable: false,
    isAvailableForRent: false,
    viewsCount: 1245,
    createdAt: new Date(),
    primaryImage:
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=375&fit=crop',
    ownerName: 'Premier Motors',
    averageRating: 4.8,
    reviewCount: 24,
  },
  {
    id: '2',
    title: '2023 Mercedes-Benz C300 AMG',
    slug: '2023-mercedes-benz-c300-amg',
    brand: 'Mercedes-Benz',
    model: 'C300 AMG',
    year: 2023,
    condition: CarCondition.USED,
    price: 58000,
    currency: 'USD',
    mileage: 15000,
    fuelType: FuelType.PETROL,
    transmission: TransmissionType.AUTOMATIC,
    bodyType: BodyType.SEDAN,
    city: 'London',
    status: CarStatus.ACTIVE,
    isFeatured: true,
    isBoosted: true,
    isNegotiable: true,
    isAvailableForRent: false,
    viewsCount: 982,
    createdAt: new Date(),
    primaryImage:
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=375&fit=crop',
    ownerName: 'Star Auto',
    averageRating: 4.6,
    reviewCount: 18,
  },
  {
    id: '3',
    title: '2024 Toyota Land Cruiser',
    slug: '2024-toyota-land-cruiser',
    brand: 'Toyota',
    model: 'Land Cruiser',
    year: 2024,
    condition: CarCondition.NEW,
    price: 95000,
    currency: 'USD',
    mileage: 0,
    fuelType: FuelType.DIESEL,
    transmission: TransmissionType.AUTOMATIC,
    bodyType: BodyType.SUV,
    city: 'Tokyo',
    status: CarStatus.ACTIVE,
    isFeatured: true,
    isBoosted: false,
    isNegotiable: false,
    isAvailableForRent: true,
    rentalPriceDaily: 180,
    viewsCount: 2100,
    createdAt: new Date(),
    primaryImage:
      'https://images.unsplash.com/photo-1626668011687-8a114cf5a34c?w=600&h=375&fit=crop',
    ownerName: 'Global Motors',
    averageRating: 4.9,
    reviewCount: 42,
  },
  {
    id: '4',
    title: '2023 Porsche 911 Carrera',
    slug: '2023-porsche-911-carrera',
    brand: 'Porsche',
    model: '911 Carrera',
    year: 2023,
    condition: CarCondition.USED,
    price: 128000,
    currency: 'USD',
    mileage: 8000,
    fuelType: FuelType.PETROL,
    transmission: TransmissionType.AUTOMATIC,
    bodyType: BodyType.COUPE,
    city: 'Zurich',
    status: CarStatus.ACTIVE,
    isFeatured: true,
    isBoosted: true,
    isNegotiable: false,
    isAvailableForRent: true,
    rentalPriceDaily: 350,
    viewsCount: 3200,
    createdAt: new Date(),
    primaryImage:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=375&fit=crop',
    ownerName: 'Luxury Auto',
    averageRating: 5.0,
    reviewCount: 8,
  },
];

function buildPageRange(page: number, totalPages: number): (number | '...')[] {
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }
  pages.push(1);
  if (page > 3) pages.push('...');
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    pages.push(i);
  }
  if (page < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}

export function FeaturedCarsSection({ cmsContent: _cmsContent }: { cmsContent?: unknown } = {}) {
  const { setView } = useAppStore();
  const { t, isRTL } = useTranslation();
  const [cars, setCars] = useState<CarListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const chevronFlip = isRTL ? 'rotate-180' : undefined;

  const fetchCars = useCallback(async (nextPage: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/cars?page=${nextPage}&limit=${PAGE_SIZE}&vehicleType=car&sortBy=createdAt&sortOrder=desc`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCars(data.data);
          setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
          setPage(nextPage);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // fall through to mock
    }
    setCars(MOCK_FEATURED_CARS);
    setTotalPages(1);
    setPage(1);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchCars(1);
  }, [fetchCars]);

  const goToPage = useCallback(
    (nextPage: number) => {
      if (nextPage < 1 || nextPage > totalPages || nextPage === page || isLoading) return;
      void fetchCars(nextPage);
      const section = document.getElementById('home-cars-section');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [fetchCars, isLoading, page, totalPages]
  );

  const paginationRange = useMemo(
    () => buildPageRange(page, totalPages),
    [page, totalPages]
  );

  return (
    <section id="home-cars-section" className="py-16 sm:py-20 bg-muted/30 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10 gap-4">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold tracking-tight"
            >
              {t('featured.title')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              {t('featured.subtitle')}
            </motion.p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setView('listing')}
            className="hidden sm:flex items-center gap-1 shrink-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          >
            {t('featured.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <CarCardSkeleton key={i} />
            ))}
          </div>
        ) : cars.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {t('featured.subtitle')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {cars.map((car, index) => (
              <motion.div
                key={`${car.id}-${page}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.3 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center mt-10">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                disabled={page <= 1}
                onClick={() => goToPage(1)}
                aria-label="First page"
              >
                <ChevronsLeft className={cn('w-4 h-4', chevronFlip)} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className={cn('w-4 h-4', chevronFlip)} />
              </Button>

              {paginationRange.map((p, idx) =>
                p === '...' ? (
                  <span
                    key={`dots-${idx}`}
                    className="px-1.5 text-sm text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="icon"
                    className={cn('h-9 w-9', p === page && 'shadow-sm')}
                    onClick={() => goToPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight className={cn('w-4 h-4', chevronFlip)} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                disabled={page >= totalPages}
                onClick={() => goToPage(totalPages)}
                aria-label="Last page"
              >
                <ChevronsRight className={cn('w-4 h-4', chevronFlip)} />
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button
            variant="outline"
            onClick={() => setView('listing')}
            className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          >
            {t('featured.viewAll')}
            <ArrowRight className="ms-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
