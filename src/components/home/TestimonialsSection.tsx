'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

// ---------------------------------------------------------------------------
// Testimonial data
// ---------------------------------------------------------------------------
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    role: 'Car Buyer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Found my dream BMW 3 Series in perfect condition. The platform made it incredibly easy to compare prices and connect with the seller. Highly recommend!',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 2,
    name: 'Sarah Mohamed',
    role: 'Car Seller',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Sold my Hyundai within a week! The listing process was smooth and the exposure was amazing. Best car marketplace in Egypt by far.',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    id: 3,
    name: 'Omar Abdel-Rahim',
    role: 'Verified Dealer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 4,
    text: 'As a dealer, CIAR Cars has been a game-changer for our business. The platform brings quality leads and the support team is always responsive.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 4,
    name: 'Nour El-Din',
    role: 'Rental Customer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Rented a Tesla Model 3 for a weekend trip. The rental process was seamless, car was in excellent condition, and the pricing was very competitive.',
    gradient: 'from-purple-400 to-fuchsia-500',
  },
  {
    id: 5,
    name: 'Yasmine Khaled',
    role: 'Car Buyer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'The car inspection feature gave me peace of mind. Bought a used Mercedes and it was exactly as described. The whole experience was premium.',
    gradient: 'from-rose-400 to-pink-500',
  },
];

// ---------------------------------------------------------------------------
// Star rating sub-component
// ---------------------------------------------------------------------------
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-zinc-200 dark:text-zinc-700'
          }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide animation variants
// ---------------------------------------------------------------------------
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function TestimonialsSection() {
  const { t, dirClasses, isRTL } = useTranslation();
  const [[page, direction], setPage] = useState([0, 0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prev]) => {
        const next = prev + newDirection;
        if (next < 0) return [TESTIMONIALS.length - 1, newDirection];
        if (next >= TESTIMONIALS.length) return [0, newDirection];
        return [next, newDirection];
      });
    },
    []
  );

  // Auto-play every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => paginate(1), 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paginate]);

  const pauseAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resumeAutoPlay = () => {
    pauseAutoPlay();
    intervalRef.current = setInterval(() => paginate(1), 5000);
  };

  const current = TESTIMONIALS[page];

  // Desktop: show 3 visible (current + neighbours)
  // Mobile: show 1 visible
  const getVisibleIndices = () => {
    const total = TESTIMONIALS.length;
    return [
      (page - 1 + total) % total,
      page,
      (page + 1) % total,
    ];
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
            {t('testimonials.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            {t('testimonials.subtitle')}
          </motion.p>
        </div>

        {/* Carousel wrapper */}
        <div
          ref={containerRef}
          className="relative"
          onMouseEnter={pauseAutoPlay}
          onMouseLeave={resumeAutoPlay}
        >
          {/* Desktop: show 3 cards centered */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {getVisibleIndices().map((idx, i) => {
              const testimonial = TESTIMONIALS[idx];
              const isCenter = i === 1;
              return (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, scale: isCenter ? 1.02 : 0.96 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card
                    className={`h-full border shadow-sm hover:shadow-lg transition-all duration-300 ${
                      isCenter
                        ? 'ring-2 ring-emerald-500/30 shadow-emerald-500/5'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Gradient accent line */}
                      <div
                        className={`h-1 w-12 rounded-full bg-gradient-to-r ${testimonial.gradient} mb-4`}
                      />

                      {/* Quote icon */}
                      <Quote className="h-8 w-8 text-emerald-200 dark:text-emerald-900 mb-3" />

                      {/* Review text */}
                      <p className="text-sm text-foreground/90 leading-relaxed flex-1 mb-4">
                        &ldquo;{testimonial.text}&rdquo;
                      </p>

                      {/* Rating */}
                      <StarRating rating={testimonial.rating} />

                      {/* Author */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-zinc-800">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile: AnimatePresence carousel */}
          <div className="md:hidden overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) paginate(1);
                  else if (info.offset.x > 60) paginate(-1);
                }}
              >
                <Card className="mx-2 border shadow-sm">
                  <CardContent className="p-6">
                    {/* Gradient accent */}
                    <div
                      className={`h-1 w-12 rounded-full bg-gradient-to-r ${current.gradient} mb-4`}
                    />
                    <Quote className="h-8 w-8 text-emerald-200 dark:text-emerald-900 mb-3" />
                    <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                      &ldquo;{current.text}&rdquo;
                    </p>
                    <StarRating rating={current.rating} />
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-zinc-800">
                        <Image
                          src={current.avatar}
                          alt={current.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{current.name}</p>
                        <p className="text-xs text-muted-foreground">{current.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card border shadow-sm hover:shadow-md transition-all z-10 hidden sm:flex"
            style={{
              [isRTL ? 'right' : 'left']: '-12px',
              [isRTL ? 'left' : 'right']: 'auto',
            }}
            onClick={() => paginate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card border shadow-sm hover:shadow-md transition-all z-10 hidden sm:flex"
            style={{
              [isRTL ? 'left' : 'right']: '-12px',
              [isRTL ? 'right' : 'left']: 'auto',
            }}
            onClick={() => paginate(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage([i, i > page ? 1 : -1])}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === page
                    ? 'w-8 bg-emerald-500'
                    : 'w-2 bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
