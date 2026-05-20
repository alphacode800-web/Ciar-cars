'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Car, Users, ShieldCheck, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

// ---------------------------------------------------------------------------
// Unsplash car images for the scrolling gallery
// ---------------------------------------------------------------------------
const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1525609004556-c46c40d4f174?w=400&h=300&fit=crop', alt: 'Luxury car side view' },
  { src: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=300&fit=crop', alt: 'Car interior' },
  { src: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=400&h=300&fit=crop', alt: 'Sports car' },
  { src: 'https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=400&h=300&fit=crop', alt: 'Luxury car front' },
  { src: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=300&fit=crop', alt: 'Car detail' },
];

// Duplicate for seamless infinite scroll
const SCROLL_IMAGES = [...GALLERY_IMAGES, ...GALLERY_IMAGES];

// ---------------------------------------------------------------------------
// Stats data – emerald/teal accent scheme
// ---------------------------------------------------------------------------
const STATS = [
  {
    icon: Car,
    value: 10000,
    suffix: '+',
    labelKey: 'stats.carsListed',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    ringColor: 'ring-emerald-500/20',
    borderHover: 'hover:border-emerald-300/60 dark:hover:border-emerald-700/40',
    glowColor: 'group-hover:shadow-emerald-500/10',
  },
  {
    icon: Users,
    value: 100000,
    suffix: '+',
    labelKey: 'stats.happyCustomers',
    accentBg: 'bg-teal-50 dark:bg-teal-950/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
    ringColor: 'ring-teal-500/20',
    borderHover: 'hover:border-teal-300/60 dark:hover:border-teal-700/40',
    glowColor: 'group-hover:shadow-teal-500/10',
  },
  {
    icon: ShieldCheck,
    value: 5000,
    suffix: '+',
    labelKey: 'stats.verifiedDealers',
    accentBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    ringColor: 'ring-cyan-500/20',
    borderHover: 'hover:border-cyan-300/60 dark:hover:border-cyan-700/40',
    glowColor: 'group-hover:shadow-cyan-500/10',
  },
  {
    icon: MapPin,
    value: 80,
    suffix: '+',
    labelKey: 'stats.citiesCovered',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    ringColor: 'ring-emerald-500/20',
    borderHover: 'hover:border-emerald-300/60 dark:hover:border-emerald-700/40',
    glowColor: 'group-hover:shadow-emerald-500/10',
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
// Animated counter – counts up using requestAnimationFrame + easing
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
  const duration = 2000;

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Auto-scrolling gallery strip
// ---------------------------------------------------------------------------
function ScrollingGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const isPausedRef = useRef(false);
  const offsetRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const SPEED = 40; // pixels per second
  const tickRef = useRef<(timestamp: number) => void | undefined>();

  useEffect(() => {
    tickRef.current = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (!isPausedRef.current && scrollRef.current) {
        offsetRef.current += SPEED * (delta / 1000);

        const singleSetWidth = scrollRef.current.scrollWidth / 2;
        if (offsetRef.current >= singleSetWidth) {
          offsetRef.current -= singleSetWidth;
        }

        scrollRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }

      animFrameRef.current = requestAnimationFrame((ts) => tickRef.current?.(ts));
    };

    animFrameRef.current = requestAnimationFrame((ts) => tickRef.current?.(ts));

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleMouseEnter = () => { isPausedRef.current = true; };
  const handleMouseLeave = () => { isPausedRef.current = false; lastTimeRef.current = 0; };
  const handleTouchStart = () => { isPausedRef.current = true; };
  const handleTouchEnd = () => { isPausedRef.current = false; lastTimeRef.current = 0; };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full overflow-hidden mb-14"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <div className="flex gap-4 py-2">
        <div ref={scrollRef} className="flex gap-4 will-change-transform">
          {SCROLL_IMAGES.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 relative w-[240px] sm:w-[300px] h-[150px] sm:h-[180px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.04] group"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stats Section Component
// ---------------------------------------------------------------------------
export function StatsSection() {
  const { t, formatNumber } = useTranslation();

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-muted/40 via-background to-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          >
            {t('stats.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            {t('stats.subtitle')}
          </motion.p>
        </div>

        {/* Scrolling car image gallery */}
        <ScrollingGallery />

        {/* Stats grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.labelKey} variants={item}>
                <div
                  className={`relative text-center p-6 sm:p-7 rounded-2xl bg-card border border-border/50 ${stat.borderHover} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden group`}
                >
                  {/* Subtle top accent line */}
                  <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Background glow on hover */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                  {/* Icon */}
                  <div
                    className={`h-14 w-14 rounded-2xl ${stat.accentBg} flex items-center justify-center mx-auto mb-4 ring-4 ${stat.ringColor} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                  </div>

                  {/* Animated number */}
                  <div className="text-3xl sm:text-4xl font-extrabold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      formatNumber={formatNumber}
                    />
                  </div>

                  {/* Label */}
                  <div className="text-sm font-semibold text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                    {t(stat.labelKey)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
