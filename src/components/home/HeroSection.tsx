'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Car, Search, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';

// ─── 15 Hero background images from Unsplash ─────────────────────────────────
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1920&q=80',
  'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=1920&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&q=80',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1920&q=80',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1920&q=80',
  'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=1920&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920&q=80',
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1920&q=80',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1920&q=80',
  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1920&q=80',
  'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1920&q=80',
];

const SLIDE_INTERVAL = 5000; // 5 seconds per slide

// ─── Popular search tags ────────────────────────────────────────────────────
const POPULAR_TAGS = ['BMW', 'Mercedes', 'Toyota', 'Tesla', 'SUV', 'Electric'] as const;

// ─── Floating decorative orbs ───────────────────────────────────────────────
const FLOATING_ORBS = [
  { size: 340, x: '5%', y: '15%', delay: 0, duration: 12, color: 'bg-emerald-500/10' },
  { size: 220, x: '85%', y: '25%', delay: 1.5, duration: 10, color: 'bg-teal-500/10' },
  { size: 180, x: '75%', y: '70%', delay: 3, duration: 14, color: 'bg-cyan-500/8' },
  { size: 260, x: '15%', y: '75%', delay: 2, duration: 11, color: 'bg-emerald-400/6' },
];

// ─── Particle positions (subtle animated dots) ──────────────────────────────
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 3,
}));

// ─── Animation variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -40 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: 'spring' as const, stiffness: 120, damping: 14 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

// ─── Image transition variants ──────────────────────────────────────────────
const imageVariants = {
  enter: { opacity: 0, scale: 1.08 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// ─── Component ──────────────────────────────────────────────────────────────
export function HeroSection() {
  const { t, isRTL } = useTranslation();
  const { setView, setFilters, setSearchQuery } = useAppStore();
  const [searchValue, setSearchValue] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preload images
  useEffect(() => {
    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Parallax effect for background
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);

  // Slideshow progress & auto-advance (uses ref to avoid setState in effect)
  const startProgress = useCallback(() => {
    // Clear any existing timers
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);

    // Reset progress bar directly via DOM
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
    }
    const startTime = Date.now();

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / SLIDE_INTERVAL) * 100, 100);
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${pct}%`;
      }

      if (pct >= 100) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      }
    }, 30);

    slideTimerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, SLIDE_INTERVAL);
  }, []);

  // Reset progress & restart timer when slide changes
  useEffect(() => {
    startProgress();
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [currentIndex, startProgress]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleSearch = () => {
    const query = searchValue.trim();
    if (query) {
      setSearchQuery(query);
      setFilters({ query });
    }
    setView('listing');
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setFilters({ query: tag });
    setView('listing');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Split title for word-by-word stagger
  const titleText = t('hero.title');
  const titleWords = titleText.split(' ');

  return (
    <section
      ref={heroRef}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      {/* ── Sliding background gallery with crossfade ── */}
      <motion.div
        className="absolute inset-0 w-full h-full scale-110"
        style={{ y: bgY }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={HERO_IMAGES[currentIndex]}
              alt={`Luxury car gallery ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              loading={currentIndex < 2 ? 'eager' : 'lazy'}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Premium dark gradient overlay ── */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"
        style={{ opacity: overlayOpacity }}
      />

      {/* ── Secondary luxury vignette overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none z-[1]" />

      {/* ── Bottom fade to page ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[2]" />

      {/* ── Floating decorative glowing orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {FLOATING_ORBS.map((orb, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-3xl ${orb.color}`}
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
            }}
            animate={{
              y: [0, -35, 10, -20, 0],
              x: [0, 20, -10, 15, 0],
              scale: [1, 1.08, 0.95, 1.05, 1],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              delay: orb.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* ── Subtle animated particle dots ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/20"
            style={{
              width: p.size,
              height: p.size,
              left: p.x,
              top: p.y,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -30, -60],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* ── Badge ── */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
            className="mb-8"
          >
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border-emerald-500/25 text-emerald-400 text-sm font-medium backdrop-blur-sm cursor-default"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{t('hero.popularSearches')}</span>
            </Badge>
          </motion.div>

          {/* ── Title with word-by-word stagger ── */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 [perspective:800px]"
            style={{
              textShadow: '0 4px 30px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            {titleWords.map((word, i) => {
              const isHighlight =
                word.toLowerCase() === 'dream' ||
                word === t('hero.title').split(' ')[2];
              return (
                <motion.span
                  key={i}
                  variants={wordVariants}
                  className={`inline-block mr-[0.3em] last:mr-0 ${
                    isHighlight
                      ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent'
                      : 'text-white'
                  }`}
                >
                  {word}
                </motion.span>
              );
            })}
          </motion.h1>

          {/* ── Subtitle ── */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* ── Search bar with spring animation ── */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 90,
              damping: 18,
              delay: 0.6,
            }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-3 sm:p-4 mb-8 shadow-2xl shadow-black/20"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search
                  className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 ${
                    isRTL ? 'right-3' : 'left-3'
                  }`}
                />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('hero.searchPlaceholder')}
                  className={`w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${
                    isRTL ? 'pr-10' : 'pl-10'
                  }`}
                />
              </div>

              {/* Search button with animated gradient */}
              <Button
                onClick={handleSearch}
                className="h-12 px-6 sm:px-8 rounded-xl font-medium text-white relative overflow-hidden group"
                size="lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] animate-[gradientShift_3s_ease_infinite] group-hover:animate-[gradientShift_1.5s_ease_infinite]" />
                <span className="absolute inset-[1px] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[length:200%_100%] animate-[gradientShift_3s_ease_infinite] group-hover:animate-[gradientShift_1.5s_ease_infinite] rounded-[10px]" />
                <span className="relative flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('hero.searchButton')}</span>
                  <span className="sm:hidden">{t('hero.searchButton')}</span>
                  <ArrowRight
                    className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                      isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''
                    }`}
                  />
                </span>
              </Button>
            </div>
          </motion.div>

          {/* ── Popular search tags with staggered fade-in ── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07, delayChildren: 0.9 } },
            }}
            className="mb-12"
          >
            <motion.p
              variants={fadeUpVariants}
              className="text-sm text-zinc-500 mb-3 font-medium"
            >
              {t('hero.popularSearches')}
            </motion.p>
            <motion.div
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              className="flex flex-wrap items-center justify-center gap-2"
            >
              {POPULAR_TAGS.map((tag) => (
                <motion.button
                  key={tag}
                  variants={fadeUpVariants}
                  onClick={() => handleTagClick(tag)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:bg-emerald-500/15 hover:border-emerald-500/30 hover:text-emerald-400 hover:scale-105 cursor-pointer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {tag === 'Electric' && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  {tag === 'SUV' && <Car className="h-3.5 w-3.5" />}
                  {tag}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Browse categories CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setView('listing')}
              className="text-zinc-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl px-6 transition-all duration-300"
            >
              <Car className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('hero.browseCategories')}
              <ArrowRight
                className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`}
              />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Image counter dots / indicators ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative transition-all duration-300 rounded-full cursor-pointer ${
              index === currentIndex
                ? 'w-6 h-2'
                : 'w-2 h-2 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                index === currentIndex ? 'bg-white' : 'bg-white/25'
              }`}
            />
          </button>
        ))}
      </div>

      {/* ── Progress bar at the bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-1 bg-white/10">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-none"
          style={{ width: '0%' }}
        />
      </div>

      {/* ── CSS keyframes for animated gradient ── */}
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </section>
  );
}
