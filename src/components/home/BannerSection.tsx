'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  ctaText?: string;
}

// ---------------------------------------------------------------------------
// Mock fallback data
// ---------------------------------------------------------------------------
const MOCK_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'New Arrivals: 2024 Models',
    subtitle: 'Explore the latest models from top brands with exclusive financing offers.',
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&h=500&fit=crop',
    linkUrl: '/listing?condition=new',
    ctaText: 'Explore Now',
  },
  {
    id: '2',
    title: 'Electric Vehicles Festival',
    subtitle: 'Discover the future of driving with our curated EV collection.',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1400&h=500&fit=crop',
    linkUrl: '/listing?fuelType=electric',
    ctaText: 'View EVs',
  },
  {
    id: '3',
    title: 'Rent Premium Cars',
    subtitle: 'Experience luxury on wheels. Daily rates starting from $89.',
    imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1400&h=500&fit=crop',
    linkUrl: '/rental',
    ctaText: 'Rent Now',
  },
];

// ---------------------------------------------------------------------------
// Slide transition variants
// ---------------------------------------------------------------------------
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.02,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.98,
  }),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function BannerSection() {
  const { isRTL } = useTranslation();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners?position=home');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.length > 0) {
            setBanners(data.data);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // API not available, use mock data
      }
      setBanners(MOCK_BANNERS);
      setIsLoading(false);
    };
    fetchBanners();
  }, []);

  const paginate = useCallback(
    (newDirection: number) => {
      setCurrentIndex(([prev]) => {
        const next = prev + newDirection;
        if (next < 0) return [banners.length - 1, newDirection];
        if (next >= banners.length) return [0, newDirection];
        return [next, newDirection];
      });
    },
    [banners.length]
  );

  const nextSlide = useCallback(() => paginate(1), [paginate]);
  const prevSlide = useCallback(() => paginate(-1), [paginate]);

  // Auto-rotate
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, banners.length]);

  if (isLoading || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const handleCTA = () => {
    if (currentBanner.linkUrl) {
      // In SPA context, this would navigate using the store
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-2xl overflow-hidden group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Banner images with slide/fade transitions */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              className="relative aspect-[16/6] sm:aspect-[3/1] lg:aspect-[4/1]"
            >
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                className="h-full w-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="px-8 sm:px-12 lg:px-16 max-w-xl">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
                  >
                    {currentBanner.title}
                  </motion.h3>
                  {currentBanner.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/80 text-sm sm:text-base mb-6 line-clamp-2"
                    >
                      {currentBanner.subtitle}
                    </motion.p>
                  )}
                  {currentBanner.ctaText && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-6 rounded-xl"
                        onClick={handleCTA}
                      >
                        {currentBanner.ctaText}
                        <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180 rtl:rotate-0' : ''}`} />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows – RTL-aware positioning */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
              isRTL ? 'right-4' : 'left-4'
            }`}
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
              isRTL ? 'left-4' : 'right-4'
            }`}
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Progress dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex([i, i > currentIndex ? 1 : -1])}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
