'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import type { BodyType, FuelType } from '@/types';

// ---------------------------------------------------------------------------
// Category data – maps each category to its Unsplash image and filter type
// ---------------------------------------------------------------------------
const CATEGORIES = [
  {
    value: 'sedan',
    translationKey: 'categories.sedan',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=200&h=150&fit=crop',
    filterType: 'bodyType' as const,
    gradient: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    value: 'suv',
    translationKey: 'categories.suv',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=150&fit=crop',
    filterType: 'bodyType' as const,
    gradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    value: 'coupe',
    translationKey: 'categories.coupe',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=150&fit=crop',
    filterType: 'bodyType' as const,
    gradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    value: 'truck',
    translationKey: 'categories.truck',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&h=150&fit=crop',
    filterType: 'bodyType' as const,
    gradient: 'from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  {
    value: 'convertible',
    translationKey: 'categories.convertible',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=150&fit=crop',
    filterType: 'bodyType' as const,
    gradient: 'from-fuchsia-500/10 to-pink-500/10 dark:from-fuchsia-500/20 dark:to-pink-500/20',
    iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    value: 'hatchback',
    translationKey: 'categories.hatchback',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=200&h=150&fit=crop',
    filterType: 'bodyType' as const,
    gradient: 'from-cyan-500/10 to-sky-500/10 dark:from-cyan-500/20 dark:to-sky-500/20',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    value: 'electric',
    translationKey: 'categories.electric',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=200&h=150&fit=crop',
    filterType: 'fuelType' as const,
    gradient: 'from-green-500/10 to-lime-500/10 dark:from-green-500/20 dark:to-lime-500/20',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    value: 'hybrid',
    translationKey: 'categories.hybrid',
    image: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=200&h=150&fit=crop',
    filterType: 'fuelType' as const,
    gradient: 'from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
] as const;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function CategoriesSection() {
  const { setView, setFilters } = useAppStore();
  const { t } = useTranslation();

  const handleCategoryClick = (cat: (typeof CATEGORIES)[number]) => {
    if (cat.filterType === 'fuelType') {
      setFilters({ fuelType: cat.value as FuelType, page: 1 });
    } else {
      setFilters({ bodyType: cat.value as BodyType, page: 1 });
    }
    setView('listing');
  };

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          >
            {t('categories.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            {t('categories.subtitle')}
          </motion.p>
        </div>

        {/* Category Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.value} variants={item}>
              <Card
                className={`group cursor-pointer border-0 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/10 bg-gradient-to-br ${cat.gradient}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  {/* Category image thumbnail */}
                  <div className="relative h-20 w-24 rounded-xl overflow-hidden mb-4 ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-110 transition-transform duration-500">
                    <Image
                      src={cat.image}
                      alt={t(cat.translationKey)}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    {/* Gradient overlay on image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>

                  <h3 className="font-semibold text-sm mb-1">{t(cat.translationKey)}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{cat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
