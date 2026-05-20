'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Car as CarIcon, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';

interface Banner {
  id: string;
  titleKey: string;
  subtitleKey: string;
  imageUrl: string;
  icon?: React.ReactNode;
  ctaKey: string;
  onCTA: () => void;
}

const BANNERS: Banner[] = [
  {
    id: 'new-arrivals',
    titleKey: 'banner.newArrivals',
    subtitleKey: 'banner.newArrivalsText',
    imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1400&h=500&fit=crop',
    icon: <CarIcon className="h-5 w-5" />,
    ctaKey: 'banner.newArrivalsCTA',
    onCTA: () => useAppStore.getState().setView('listing', { condition: 'new' }),
  },
  {
    id: 'electric-vehicles',
    titleKey: 'banner.electricVehicles',
    subtitleKey: 'banner.electricVehiclesText',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1400&h=500&fit=crop',
    icon: <Zap className="h-5 w-5" />,
    ctaKey: 'banner.electricVehiclesCTA',
    onCTA: () => useAppStore.getState().setView('listing', { fuelType: 'electric' }),
  },
  {
    id: 'premium-rental',
    titleKey: 'banner.premiumRental',
    subtitleKey: 'banner.premiumRentalText',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&h=500&fit=crop',
    icon: <Crown className="h-5 w-5" />,
    ctaKey: 'banner.premiumRentalCTA',
    onCTA: () => useAppStore.getState().setView('listing', { isAvailableForRent: true }),
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '60%' : '-60%',
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-60%' : '60%',
    opacity: 0,
    scale: 0.96,
  }),
};

const AUTO_PLAY_INTERVAL = 5000;

export function BannerSection() {
  const { isRTL } = useTranslation();
  const { t } = useTranslation();
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const banners = BANNERS;

  const paginate = useCallback(
    (newDirection: number) => {
      setCurrentIndex(([prev]) => {
        const next = prev + newDirection;
        if (next < 0) return [banners.length - 1, newDirection];
        if (next >= banners.length) return [0, newDirection];
        return [next, newDirection];
      });
      setProgressKey((k) => k + 1);
    },
    [banners.length]
  );

  const nextSlide = useCallback(() => paginate(1), [paginate]);
  const prevSlide = useCallback(() => paginate(-1), [paginate]);

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;
    timerRef.current = setTimeout(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAutoPlaying, nextSlide, banners.length, progressKey]);

  const handleDotClick = useCallback(
    (i: number) => {
      setCurrentIndex([i, i > currentIndex ? 1 : -1]);
      setProgressKey((k) => k + 1);
    },
    [currentIndex]
  );

  const handleMouseEnter = useCallback(() => setIsAutoPlaying(false), []);
  const handleMouseLeave = useCallback(() => {
    setIsAutoPlaying(true);
    setProgressKey((k) => k + 1);
  }, []);

  const currentBanner = banners[currentIndex];

  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-2xl overflow-hidden group shadow-luxury-lg"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 260, damping: 28, mass: 0.8 },
                opacity: { duration: 0.35, ease: 'easeInOut' },
                scale: { duration: 0.35, ease: 'easeInOut' },
              }}
              className="relative aspect-[16/6] sm:aspect-[3/1] lg:aspect-[4/1]"
            >
              <img
                src={currentBanner.imageUrl}
                alt={t(currentBanner.titleKey)}
                className="h-full w-full object-cover"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent ${
                  isRTL ? '[transform:scaleX(-1)]' : ''
                }`}
              />
              <div className="absolute inset-0 flex items-center">
                <div className="px-8 sm:px-12 lg:px-16 max-w-xl">
                  {currentBanner.icon && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm text-emerald-300 text-xs font-medium"
                    >
                      {currentBanner.icon}
                      {t('banner.featured')}
                    </motion.div>
                  )}

                  <motion.h3
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight"
                  >
                    {t(currentBanner.titleKey)}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-white/75 text-sm sm:text-base mb-6 line-clamp-2 leading-relaxed"
                  >
                    {t(currentBanner.subtitleKey)}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-11 px-7 rounded-xl shadow-lg shadow-emerald-900/30 transition-shadow hover:shadow-emerald-900/50"
                      onClick={currentBanner.onCTA}
                    >
                      {t(currentBanner.ctaKey)}
                      <ArrowRight
                        className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                          isRTL ? 'rotate-180' : 'group-hover:translate-x-0.5'
                        }`}
                      />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
              isRTL ? 'right-4' : 'left-4'
            }`}
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
              isRTL ? 'left-4' : 'right-4'
            }`}
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-8 bg-white shadow-sm shadow-white/50'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={progressKey}
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 origin-left"
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: isAutoPlaying ? 1 : 1,
                  transition: {
                    scaleX: { duration: isAutoPlaying ? 5 : 0, ease: 'linear' },
                  },
                }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
