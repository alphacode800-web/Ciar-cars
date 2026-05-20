'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

const TESTIMONIALS = [
  {
    id: 1,
    nameKey: 'testimonials.name1',
    roleKey: 'testimonials.role1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    textKey: 'testimonials.text1',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 2,
    nameKey: 'testimonials.name2',
    roleKey: 'testimonials.role2',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    textKey: 'testimonials.text2',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    id: 3,
    nameKey: 'testimonials.name3',
    roleKey: 'testimonials.role3',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 4,
    textKey: 'testimonials.text3',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 4,
    nameKey: 'testimonials.name4',
    roleKey: 'testimonials.role4',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    textKey: 'testimonials.text4',
    gradient: 'from-purple-400 to-fuchsia-500',
  },
  {
    id: 5,
    nameKey: 'testimonials.name5',
    roleKey: 'testimonials.role5',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    textKey: 'testimonials.text5',
    gradient: 'from-rose-400 to-pink-500',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-white/20'
          }`}
        />
      ))}
    </div>
  );
}

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

  const getVisibleIndices = () => {
    const total = TESTIMONIALS.length;
    return [
      (page - 1 + total) % total,
      page,
      (page + 1) % total,
    ];
  };

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <NextImage
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
          alt="Luxury car showroom"
          fill
          className="object-cover object-center"
          priority={false}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white"
          >
            {t('testimonials.title')}
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-20 h-1 mx-auto mb-5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-lg max-w-xl mx-auto"
          >
            {t('testimonials.subtitle')}
          </motion.p>
        </div>

        <div
          ref={containerRef}
          className="relative"
          onMouseEnter={pauseAutoPlay}
          onMouseLeave={resumeAutoPlay}
        >
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {getVisibleIndices().map((idx, i) => {
              const testimonial = TESTIMONIALS[idx];
              const isCenter = i === 1;
              return (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, scale: isCenter ? 1.03 : 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card
                    className={`h-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-emerald-500/10 transition-all duration-500 ${
                      isCenter
                        ? 'ring-1 ring-emerald-400/30 shadow-emerald-500/10'
                        : 'opacity-60 hover:opacity-90'
                    }`}
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      <div
                        className={`h-1 w-12 rounded-full bg-gradient-to-r ${testimonial.gradient} mb-4`}
                      />
                      <Quote className="h-8 w-8 text-white/15 mb-3" />
                      <p className="text-sm text-white/85 leading-relaxed flex-1 mb-4">
                        &ldquo;{t(testimonial.textKey)}&rdquo;
                      </p>
                      <StarRating rating={testimonial.rating} />
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/30">
                          <NextImage
                            src={testimonial.avatar}
                            alt={t(testimonial.nameKey)}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{t(testimonial.nameKey)}</p>
                          <p className="text-xs text-white/50">{t(testimonial.roleKey)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

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
                <Card className="mx-2 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                  <CardContent className="p-6">
                    <div
                      className={`h-1 w-12 rounded-full bg-gradient-to-r ${current.gradient} mb-4`}
                    />
                    <Quote className="h-8 w-8 text-white/15 mb-3" />
                    <p className="text-sm text-white/85 leading-relaxed mb-4">
                      &ldquo;{t(current.textKey)}&rdquo;
                    </p>
                    <StarRating rating={current.rating} />
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/30">
                        <NextImage
                          src={current.avatar}
                          alt={t(current.nameKey)}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{t(current.nameKey)}</p>
                        <p className="text-xs text-white/50">{t(current.roleKey)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 hover:text-white hover:border-white/20 shadow-lg transition-all z-10 hidden sm:flex"
            style={{
              [isRTL ? 'right' : 'left']: '-16px',
              [isRTL ? 'left' : 'right']: 'auto',
            }}
            onClick={() => paginate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 hover:text-white hover:border-white/20 shadow-lg transition-all z-10 hidden sm:flex"
            style={{
              [isRTL ? 'left' : 'right']: '-16px',
              [isRTL ? 'right' : 'left']: 'auto',
            }}
            onClick={() => paginate(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage([i, i > page ? 1 : -1])}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === page
                    ? 'w-8 bg-emerald-400'
                    : 'w-2 bg-white/25 hover:bg-white/50'
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
