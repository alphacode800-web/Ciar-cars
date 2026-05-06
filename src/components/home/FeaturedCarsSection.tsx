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
import type { CarListItem } from '@/types';

const MOCK_FEATURED_CARS: CarListItem[] = [
  {
    id: '1',
    title: '2024 BMW M4 Competition',
    slug: '2024-bmw-m4-competition',
    brand: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    condition: 'new' as const,
    price: 3500000,
    currency: 'EGP',
    mileage: 0,
    fuelType: 'petrol' as const,
    transmission: 'automatic' as const,
    bodyType: 'coupe' as const,
    city: 'Cairo',
    status: 'active' as const,
    isFeatured: true,
    isBoosted: false,
    isNegotiable: false,
    isAvailableForRent: false,
    viewsCount: 1245,
    createdAt: new Date(),
    primaryImage: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=375&fit=crop',
    ownerName: 'Ahmed Motors',
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
    condition: 'used' as const,
    price: 2800000,
    currency: 'EGP',
    mileage: 15000,
    fuelType: 'petrol' as const,
    transmission: 'automatic' as const,
    bodyType: 'sedan' as const,
    city: 'Alexandria',
    status: 'active' as const,
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
    condition: 'new' as const,
    price: 4500000,
    currency: 'EGP',
    mileage: 0,
    fuelType: 'diesel' as const,
    transmission: 'automatic' as const,
    bodyType: 'suv' as const,
    city: 'Giza',
    status: 'active' as const,
    isFeatured: true,
    isBoosted: false,
    isNegotiable: false,
    isAvailableForRent: true,
    rentalPriceDaily: 5000,
    viewsCount: 2100,
    createdAt: new Date(),
    primaryImage: 'https://images.unsplash.com/photo-1626668011687-8a114cf5a34c?w=600&h=375&fit=crop',
    ownerName: 'Sahara Motors',
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
    condition: 'used' as const,
    price: 6200000,
    currency: 'EGP',
    mileage: 8000,
    fuelType: 'petrol' as const,
    transmission: 'automatic' as const,
    bodyType: 'coupe' as const,
    city: 'Cairo',
    status: 'active' as const,
    isFeatured: true,
    isBoosted: true,
    isNegotiable: false,
    isAvailableForRent: true,
    rentalPriceDaily: 8000,
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
    condition: 'new' as const,
    price: 1800000,
    currency: 'EGP',
    mileage: 0,
    fuelType: 'hybrid' as const,
    transmission: 'automatic' as const,
    bodyType: 'suv' as const,
    city: 'New Cairo',
    status: 'active' as const,
    isFeatured: true,
    isBoosted: false,
    isNegotiable: false,
    isAvailableForRent: false,
    viewsCount: 756,
    createdAt: new Date(),
    primaryImage: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=600&h=375&fit=crop',
    ownerName: 'Hyundai Egypt',
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
    condition: 'used' as const,
    price: 2100000,
    currency: 'EGP',
    mileage: 12000,
    fuelType: 'electric' as const,
    transmission: 'automatic' as const,
    bodyType: 'sedan' as const,
    city: '6th October',
    status: 'active' as const,
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
              Featured Cars
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Hand-picked premium vehicles for you
            </motion.p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setView('listing')}
            className="hidden sm:flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          >
            View All
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
            View All Featured Cars
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
