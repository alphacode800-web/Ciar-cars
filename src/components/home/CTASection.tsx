'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}: {
  className: string;
  size: number;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={{
        y: [0, -30, 10, -20, 0],
        x: [0, 10, -15, 5, 0],
        opacity: [0.15, 0.4, 0.2, 0.35, 0.15],
        scale: [1, 1.2, 0.8, 1.1, 1],
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

  // Pre-generate deterministic particles
  const particles = useMemo(
    () => [
      { top: '8%', left: '12%', size: 6, delay: 0, duration: 6 },
      { top: '15%', right: '18%', size: 4, delay: 0.5, duration: 7 },
      { top: '25%', left: '75%', size: 8, delay: 1, duration: 8 },
      { top: '60%', left: '8%', size: 5, delay: 1.5, duration: 5.5 },
      { top: '70%', right: '10%', size: 6, delay: 2, duration: 7.5 },
      { top: '40%', left: '60%', size: 3, delay: 0.8, duration: 6.5 },
      { top: '85%', left: '35%', size: 5, delay: 1.2, duration: 9 },
      { top: '20%', left: '45%', size: 4, delay: 2.5, duration: 5 },
      { top: '50%', right: '25%', size: 7, delay: 0.3, duration: 8.5 },
      { top: '10%', left: '85%', size: 3, delay: 1.8, duration: 6 },
      { top: '75%', left: '55%', size: 5, delay: 0.6, duration: 7 },
      { top: '35%', left: '20%', size: 4, delay: 2.2, duration: 5.5 },
    ],
    []
  );

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600" />

      {/* Decorative blurred shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <Particle
            key={i}
            className={`absolute rounded-full bg-white ${
              p.size >= 6 ? 'blur-[1px]' : ''
            }`}
            size={p.size}
            delay={p.delay}
            duration={p.duration}
            {...(p.top ? { style: { top: p.top, left: p.left, right: p.right, width: p.size, height: p.size } } : {})}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-sm font-medium mb-6 backdrop-blur-sm">
            <Plus className="h-4 w-4" />
            {t('cta.subtitle')?.slice(0, 20)}...
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4"
        >
          {t('cta.title')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto"
        >
          {t('cta.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={handleClick}
            className="bg-white text-emerald-700 hover:bg-emerald-50 h-12 px-8 rounded-xl font-semibold shadow-lg shadow-black/10 transition-transform hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('cta.buttonText')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleBrowse}
            className="border-white/30 text-white hover:bg-white/10 hover:text-white h-12 px-8 rounded-xl backdrop-blur-sm transition-transform hover:scale-105"
          >
            <Search className="mr-2 h-4 w-4" />
            {t('cta.browseButton')}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
