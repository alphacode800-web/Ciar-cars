'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Car, Users, ShieldCheck, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

// ---------------------------------------------------------------------------
// Stats data – icons are kept static; labels come from i18n
// ---------------------------------------------------------------------------
const STATS = [
  {
    icon: Car,
    value: 10000,
    suffix: '+',
    labelKey: 'stats.carsListed',
    gradient: 'from-emerald-500 to-teal-500',
    ringColor: 'ring-emerald-500/20',
    bgAccent: 'bg-emerald-50 dark:bg-emerald-950/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200/60 dark:border-emerald-800/30',
  },
  {
    icon: Users,
    value: 100000,
    suffix: '+',
    labelKey: 'stats.happyCustomers',
    gradient: 'from-blue-500 to-indigo-500',
    ringColor: 'ring-blue-500/20',
    bgAccent: 'bg-blue-50 dark:bg-blue-950/30',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200/60 dark:border-blue-800/30',
  },
  {
    icon: ShieldCheck,
    value: 5000,
    suffix: '+',
    labelKey: 'stats.verifiedDealers',
    gradient: 'from-amber-500 to-orange-500',
    ringColor: 'ring-amber-500/20',
    bgAccent: 'bg-amber-50 dark:bg-amber-950/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200/60 dark:border-amber-800/30',
  },
  {
    icon: MapPin,
    value: 80,
    suffix: '+',
    labelKey: 'stats.citiesCovered',
    gradient: 'from-purple-500 to-fuchsia-500',
    ringColor: 'ring-purple-500/20',
    bgAccent: 'bg-purple-50 dark:bg-purple-950/30',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200/60 dark:border-purple-800/30',
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 240, damping: 20 },
  },
};

// ---------------------------------------------------------------------------
// Animated counter – counts up using setInterval + easing
// ---------------------------------------------------------------------------
function AnimatedCounter({
  target,
  suffix,
  formatNumber,
}: {
  target: number;
  suffix: string;
  formatNumber: (n: number) => string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const duration = 2000; // 2 seconds

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function StatsSection() {
  const { t, formatNumber } = useTranslation();

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          >
            {t('stats.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            {t('stats.subtitle')}
          </motion.p>
        </div>

        {/* Stats grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.labelKey} variants={item}>
                <div
                  className={`relative text-center p-6 rounded-2xl bg-card border ${stat.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group`}
                >
                  {/* Gradient top accent bar */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity`}
                  />

                  <div
                    className={`h-14 w-14 rounded-2xl ${stat.bgAccent} flex items-center justify-center mx-auto mb-4 ring-4 ${stat.ringColor}`}
                  >
                    <Icon className={`h-7 w-7 ${stat.textColor}`} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold mb-1">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      formatNumber={formatNumber}
                    />
                  </div>
                  <div className="font-semibold text-sm mb-1">{t(stat.labelKey)}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
