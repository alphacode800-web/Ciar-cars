'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface GalleryCar {
  src: string;
  brand: string;
  label: string;
  yOffset: number;
}

const GALLERY_CARS: GalleryCar[] = [
  {
    src: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=500&h=350&fit=crop',
    brand: 'BMW',
    label: 'M4 Competition',
    yOffset: -12,
  },
  {
    src: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=350&fit=crop',
    brand: 'Mercedes',
    label: 'AMG GT',
    yOffset: 10,
  },
  {
    src: 'https://images.unsplash.com/photo-1626668011687-8a114cf5a34c?w=500&h=350&fit=crop',
    brand: 'Audi',
    label: 'RS e-tron GT',
    yOffset: -6,
  },
  {
    src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&h=350&fit=crop',
    brand: 'Porsche',
    label: '911 Turbo S',
    yOffset: 14,
  },
  {
    src: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=500&h=350&fit=crop',
    brand: 'Hyundai',
    label: 'Genesis G90',
    yOffset: -10,
  },
  {
    src: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&h=350&fit=crop',
    brand: 'Tesla',
    label: 'Model S Plaid',
    yOffset: 8,
  },
  {
    src: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=350&fit=crop',
    brand: 'Ferrari',
    label: '488 Pista',
    yOffset: -8,
  },
  {
    src: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=350&fit=crop',
    brand: 'Mercedes',
    label: 'GLE Coupe',
    yOffset: 12,
  },
  {
    src: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=350&fit=crop',
    brand: 'BMW',
    label: 'X7 M50i',
    yOffset: -14,
  },
  {
    src: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&h=350&fit=crop',
    brand: 'Lamborghini',
    label: 'Huracan Evo',
    yOffset: 6,
  },
  {
    src: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500&h=350&fit=crop',
    brand: 'Range Rover',
    label: 'Autobiography',
    yOffset: -4,
  },
  {
    src: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=500&h=350&fit=crop',
    brand: 'Maserati',
    label: 'MC20',
    yOffset: 16,
  },
  {
    src: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&h=350&fit=crop',
    brand: 'Aston Martin',
    label: 'DB11',
    yOffset: -16,
  },
  {
    src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=350&fit=crop',
    brand: 'Corvette',
    label: 'Stingray C8',
    yOffset: 10,
  },
  {
    src: 'https://images.unsplash.com/photo-1525609004556-c46c40d4f174?w=500&h=350&fit=crop',
    brand: 'Lexus',
    label: 'LC 500',
    yOffset: -8,
  },
];

const DUBLIST = [...GALLERY_CARS, ...GALLERY_CARS];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.15 + i * 0.06,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const headingVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LuxuryGalleryStrip() {
  const setView = useAppStore((s) => s.setView);
  const { t } = useTranslation();
  const stripRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);
  const speedRef = useRef(0.6);
  const isPaused = useRef(false);

  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    tickRef.current = () => {
      if (!stripRef.current || isPaused.current) {
        animRef.current = requestAnimationFrame(tickRef.current);
        return;
      }

      const halfWidth = stripRef.current.scrollWidth / 2;
      posRef.current -= speedRef.current;

      if (Math.abs(posRef.current) >= halfWidth) {
        posRef.current += halfWidth;
      }

      stripRef.current.style.transform = `translateX(${posRef.current}px)`;
      animRef.current = requestAnimationFrame(tickRef.current);
    };

    animRef.current = requestAnimationFrame(tickRef.current);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleMouseEnter = () => { isPaused.current = true; };
  const handleMouseLeave = () => { isPaused.current = false; };
  const handleTouchStart = () => { isPaused.current = true; };
  const handleTouchEnd = () => { isPaused.current = false; };

  const handleClick = () => {
    setView('listing');
  };

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 md:w-40 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 md:w-40 bg-gradient-to-l from-background via-background/80 to-transparent" />

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="container mx-auto px-4 mb-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headingVariants}
        >
          <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-emerald-600 dark:text-emerald-400 mb-2">
            {t('gallery.badge')}
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            {t('gallery.title').split(' ').map((word, i, arr) => 
              i === arr.length - 1 ? (
                <span key={i} className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  {word}
                </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </motion.div>
      </div>

      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={stripRef}
          className="flex gap-5 md:gap-6 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {DUBLIST.map((car, idx) => {
            const originalIdx = idx % GALLERY_CARS.length;
            return (
              <motion.div
                key={`${car.brand}-${car.label}-${originalIdx}`}
                custom={originalIdx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={cardVariants}
                whileHover={{ scale: 1.06, y: -6 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleClick();
                }}
                aria-label={`Browse ${car.brand} ${car.label}`}
                className="group relative flex-shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-2xl"
                style={{ marginTop: `${car.yOffset}px` }}
              >
                <div className="relative w-[260px] sm:w-[290px] md:w-[320px] lg:w-[360px] h-[180px] sm:h-[200px] md:h-[220px] lg:h-[240px] rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-emerald-500/10 dark:group-hover:shadow-emerald-500/5">
                  <img
                    src={car.src}
                    alt={`${car.brand} ${car.label}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 text-[10px] md:text-xs font-bold tracking-wider uppercase rounded-lg bg-white/15 backdrop-blur-md text-white border border-white/20">
                      {car.brand}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm md:text-base leading-tight drop-shadow-sm">
                        {car.label}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/80 backdrop-blur-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-6 flex justify-center gap-1.5"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </motion.div>
    </section>
  );
}
