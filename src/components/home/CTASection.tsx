'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NextImage from 'next/image';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/hooks/use-translation';

// ---------------------------------------------------------------------------
// Particle component – renders floating dots with varied motion paths
// ---------------------------------------------------------------------------
function Particle({
  className,
  size,
  delay,
  duration,
  style,
}: {
  className: string;
  size: number;
  delay: number;
  duration: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={{ ...style, width: size, height: size }}
      animate={{
        y: [0, -30, 10, -20, 0],
        x: [0, 10, -15, 5, 0],
        opacity: [0.15, 0.5, 0.2, 0.45, 0.15],
        scale: [1, 1.3, 0.8, 1.1, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function CTASection() {
  const { setView } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  const handleClick = () => {
    if (isAuthenticated) {
      setView('sell-car');
    } else {
      setView('auth');
    }
  };

  const handleBrowse = () => {
    setView('listing');
  };

  // Pre-generate deterministic particles (white & emerald themed)
  const particles = useMemo(
    () => [
      { top: '8%', left: '12%', size: 6, delay: 0, duration: 6, color: 'bg-emerald-300' },
      { top: '15%', right: '18%', size: 4, delay: 0.5, duration: 7, color: 'bg-white' },
      { top: '25%', left: '75%', size: 8, delay: 1, duration: 8, color: 'bg-emerald-400' },
      { top: '60%', left: '8%', size: 5, delay: 1.5, duration: 5.5, color: 'bg-white' },
      { top: '70%', right: '10%', size: 6, delay: 2, duration: 7.5, color: 'bg-emerald-300' },
      { top: '40%', left: '60%', size: 3, delay: 0.8, duration: 6.5, color: 'bg-white' },
      { top: '85%', left: '35%', size: 5, delay: 1.2, duration: 9, color: 'bg-emerald-400' },
      { top: '20%', left: '45%', size: 4, delay: 2.5, duration: 5, color: 'bg-white' },
      { top: '50%', right: '25%', size: 7, delay: 0.3, duration: 8.5, color: 'bg-emerald-300' },
      { top: '10%', left: '85%', size: 3, delay: 1.8, duration: 6, color: 'bg-white' },
      { top: '75%', left: '55%', size: 5, delay: 0.6, duration: 7, color: 'bg-emerald-400' },
      { top: '35%', left: '20%', size: 4, delay: 2.2, duration: 5.5, color: 'bg-white' },
    ],
    []
  );

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      {/* ── Background Image ── */}
      <div className="absolute inset-0">
        <NextImage
          src="https://images.unsplash.com/photo-1542362567-b07e54358753?w=1920&q=80"
          alt="Luxury car background"
          fill
          className="object-cover object-center"
          priority={false}
          sizes="100vw"
        />
      </div>

      {/* ── Dark Overlay (gradient + solid) ── */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      {/* ── Decorative blurred glow shapes ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {/* ── Floating Particles (white & emerald) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <Particle
            key={i}
            className={`absolute rounded-full ${p.color} ${
              p.size >= 6 ? 'blur-[1px]' : ''
            }`}
            size={p.size}
            delay={p.delay}
            duration={p.duration}
            style={{ top: p.top, left: p.left, right: p.right }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 text-emerald-300 text-sm font-medium mb-8 backdrop-blur-md border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            {t('cta.subtitle')?.slice(0, 28)}...
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight mb-5 drop-shadow-lg"
        >
          {t('cta.title')}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.24, ease: 'easeOut' }}
          className="text-lg sm:text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm"
        >
          {t('cta.subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.36, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
        >
          {/* Sell Your Car — primary solid button */}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              onClick={handleClick}
              className="group relative bg-gradient-to-r from-white to-emerald-50 text-emerald-900 hover:from-emerald-50 hover:to-white h-13 px-9 rounded-2xl font-bold text-base shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.25)] transition-all duration-300 border border-white/20"
            >
              <Plus className="mr-2.5 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              {t('cta.buttonText')}
              <ArrowRight className="ml-2.5 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Browse Cars — outline glassmorphism button */}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={handleBrowse}
              className="group bg-white/5 border-white/20 text-white hover:bg-white/15 hover:border-white/40 hover:text-white h-13 px-9 rounded-2xl font-bold text-base backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all duration-300"
            >
              <Search className="mr-2.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              {t('cta.browseButton')}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
