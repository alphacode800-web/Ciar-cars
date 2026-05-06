'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { CAR_BRANDS, CAR_CONDITIONS } from '@/lib/constants';
import type { CarCondition, BodyType } from '@/types';

const STATS = [
  { value: '10,000+', label: 'Cars Listed' },
  { value: '5,000+', label: 'Verified Dealers' },
  { value: '100,000+', label: 'Happy Users' },
  { value: '4.8★', label: 'User Rating' },
];

const floatingShapes = [
  { size: 120, x: '10%', y: '20%', delay: 0, duration: 8 },
  { size: 80, x: '80%', y: '30%', delay: 1, duration: 10 },
  { size: 60, x: '70%', y: '70%', delay: 2, duration: 7 },
  { size: 100, x: '20%', y: '75%', delay: 0.5, duration: 9 },
  { size: 40, x: '90%', y: '60%', delay: 1.5, duration: 6 },
];

export function HeroSection() {
  const { setView, setFilters } = useAppStore();
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');

  const handleSearch = () => {
    const filters: Record<string, unknown> = {};
    if (brand) filters.brand = brand;
    if (condition && condition !== 'all') filters.condition = condition as CarCondition;
    if (priceRange && priceRange !== 'all') {
      const ranges: Record<string, { min?: number; max?: number }> = {
        '0-500k': { max: 500000 },
        '500k-1m': { min: 500000, max: 1000000 },
        '1m-2m': { min: 1000000, max: 2000000 },
        '2m-5m': { min: 2000000, max: 5000000 },
        '5m+': { min: 5000000 },
      };
      filters.price = ranges[priceRange];
    }
    setFilters(filters);
    setView('listing');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-emerald-500/5 border border-emerald-500/10"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              delay: shape.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Egypt&apos;s #1 Car Marketplace
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6"
          >
            Find Your{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Dream Car
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
          >
            Egypt&apos;s Premier Car Marketplace — Buy, Rent, or Sell with confidence
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4 mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Brand */}
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 w-full focus:ring-emerald-500/50">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Brands</SelectItem>
                  {CAR_BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 w-full focus:ring-emerald-500/50">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="0-500k">Under E£500K</SelectItem>
                  <SelectItem value="500k-1m">E£500K - 1M</SelectItem>
                  <SelectItem value="1m-2m">E£1M - 2M</SelectItem>
                  <SelectItem value="2m-5m">E£2M - 5M</SelectItem>
                  <SelectItem value="5m+">Over E£5M</SelectItem>
                </SelectContent>
              </Select>

              {/* Condition */}
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 w-full focus:ring-emerald-500/50">
                  <SelectValue placeholder="Any Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Condition</SelectItem>
                  {CAR_CONDITIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 sm:col-span-1 lg:col-span-2 font-medium"
              >
                <Search className="mr-2 h-4 w-4" />
                Search Cars
              </Button>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView('listing')}
              className="border-white/20 text-white hover:bg-white/10 hover:text-white h-12 px-8 rounded-xl"
            >
              Browse All Cars
            </Button>
            <Button
              size="lg"
              onClick={() => setView('sell-car')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-8 rounded-xl"
            >
              Sell Your Car
            </Button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
