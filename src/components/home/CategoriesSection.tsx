'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Car,
  Mountain,
  Zap,
  Truck,
  Bus,
  Sun,
  CarFront,
  Luggage,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import { CAR_BODY_TYPES } from '@/lib/constants';
import type { BodyType } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Car,
  Mountain,
  Zap,
  Truck,
  Bus,
  Sun,
  CarFront,
  Luggage,
};

const MOCK_COUNTS: Record<string, string> = {
  sedan: '2,450',
  suv: '1,830',
  coupe: '920',
  truck: '640',
  van: '510',
  convertible: '380',
  hatchback: '1,120',
  wagon: '290',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function CategoriesSection() {
  const { setView, setFilters } = useAppStore();

  const handleCategoryClick = (bodyTypeValue: string) => {
    setFilters({ bodyType: bodyTypeValue as BodyType, page: 1 });
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
            Browse by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Find the perfect vehicle type for your needs
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
          {CAR_BODY_TYPES.map((type) => {
            const Icon = ICON_MAP[type.icon] || Car;
            const count = MOCK_COUNTS[type.value] || '0';

            return (
              <motion.div key={type.value} variants={item}>
                <Card
                  className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card"
                  onClick={() => handleCategoryClick(type.value)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/50 transition-colors">
                      <Icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{type.label}</h3>
                    <p className="text-xs text-muted-foreground">{count} cars</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
