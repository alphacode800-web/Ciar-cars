'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { CarCard, CarCardSkeleton } from '@/components/cars/CarCard';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import type { CarListItem } from '@/types';
import { CarCondition, FuelType, TransmissionType, BodyType, CarStatus } from '@/types';

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
    primaryImage: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=375&fit=crop',
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
    primaryImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=375&fit=crop',
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
    primaryImage: 'https://images.unsplash.com/photo-1626668011687-8a114cf5a34c?w=600&h=375&fit=crop',
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
    primaryImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=375&fit=crop',
    ownerName: 'Luxury Auto',
    averageRating: 5.0,
    reviewCount: 8,
  },
  {
    id: '5',
    title: '2024 Hyundai Tucson Hybrid',
    slug: '2024-hyundai-tucson-hybrid',
    brand: 'Hyundai',
    model: 'Tucson Hybrid',
    year: 2024,
    condition: CarCondition.NEW,
    price: 38000,
    currency: 'USD',
    mileage: 0,
    fuelType: FuelType.HYBRID,
    transmission: TransmissionType.AUTOMATIC,
    bodyType: BodyType.SUV,
    city: 'Seoul',
    status: CarStatus.ACTIVE,
    isFeatured: true,
    isBoosted: false,
    isNegotiable: false,
    isAvailableForRent: false,
    viewsCount: 756,
    createdAt: new Date(),
    primaryImage: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=600&h=375&fit=crop',
    ownerName: 'Hyundai World',
    averageRating: 4.5,
    reviewCount: 31,
  },
  {
    id: '6',
    title: '2023 Tesla Model 3',
    slug: '2023-tesla-model-3',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    condition: CarCondition.USED,
    price: 42000,
    currency: 'USD',
    mileage: 12000,
    fuelType: FuelType.ELECTRIC,
    transmission: TransmissionType.AUTOMATIC,
    bodyType: BodyType.SEDAN,
    city: 'San Francisco',
    status: CarStatus.ACTIVE,
    isFeatured: true,
    isBoosted: false,
    isNegotiable: true,
    isAvailableForRent: false,
    viewsCount: 1890,
    createdAt: new Date(),
    primaryImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=375&fit=crop',
    ownerName: 'EV Hub',
    averageRating: 4.7,
    reviewCount: 15,
  },
];

export function FeaturedCarsSection() {
  const { setView } = useAppStore();
  const { t } = useTranslation();
  const [cars, setCars] = useState<CarListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    // Try fetching from API, fallback to mock data
    const fetchCars = async () => {
      try {
        const res = await fetch('/api/cars/featured');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.length > 0) {
            setCars(data.data);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // API not available, use mock data
      }
      setCars(MOCK_FEATURED_CARS);
      setIsLoading(false);
    };
    fetchCars();
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
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
            className="hidden sm:flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          >
            {t('featured.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Carousel */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CarCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="relative">
            <Carousel
              setApi={setApi}
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 sm:-ml-6">
                {cars.map((car) => (
                  <CarouselItem
                    key={car.id}
                    className="pl-4 sm:pl-6 basis-[85%] sm:basis-[50%] lg:basis-[33.333%] xl:basis-[25%]"
                  >
                    <CarCard car={car} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Custom Navigation */}
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => api?.scrollPrev()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => api?.scrollNext()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-8 sm:hidden text-center">
          <Button
            variant="outline"
            onClick={() => setView('listing')}
            className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            {t('featured.viewAll')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
