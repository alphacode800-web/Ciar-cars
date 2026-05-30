'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Luxury Card ───────────────────────────────────────────────────────────

export function LuxuryCard({
  className,
  children,
  glow = false,
}: {
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl shadow-xl shadow-black/5',
        'dark:bg-slate-900/60 dark:shadow-black/20',
        glow && 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-amber-500/5 before:via-transparent before:to-emerald-500/5 before:pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Page Header ───────────────────────────────────────────────────────────

export function AdminPageHeader({
  title,
  subtitle,
  badge,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="space-y-1">
        {badge && (
          <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {badge}
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-l from-foreground to-foreground/70 bg-clip-text">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-muted-foreground max-w-xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

export function AdminStatCard({
  label,
  value,
  change,
  isUp = true,
  icon: Icon,
  accent = 'emerald',
  delay = 0,
}: {
  label: string;
  value: string;
  change?: string;
  isUp?: boolean;
  icon: LucideIcon;
  accent?: 'emerald' | 'teal' | 'amber' | 'cyan' | 'violet';
  delay?: number;
}) {
  const accents = {
    emerald: {
      icon: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
      ring: 'ring-emerald-500/20',
      bar: 'bg-emerald-500/40',
    },
    teal: {
      icon: 'from-teal-500 to-cyan-600 shadow-teal-500/25',
      ring: 'ring-teal-500/20',
      bar: 'bg-teal-500/40',
    },
    amber: {
      icon: 'from-amber-500 to-orange-600 shadow-amber-500/25',
      ring: 'ring-amber-500/20',
      bar: 'bg-amber-500/40',
    },
    cyan: {
      icon: 'from-cyan-500 to-blue-600 shadow-cyan-500/25',
      ring: 'ring-cyan-500/20',
      bar: 'bg-cyan-500/40',
    },
    violet: {
      icon: 'from-violet-500 to-purple-600 shadow-violet-500/25',
      ring: 'ring-violet-500/20',
      bar: 'bg-violet-500/40',
    },
  }[accent];

  const bars = [38, 62, 45, 78, 55, 88, 70];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
    >
      <LuxuryCard className="group overflow-hidden transition-all duration-300 hover:border-amber-500/20 hover:shadow-2xl hover:shadow-emerald-500/5">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg ring-1',
                accents.icon,
                accents.ring
              )}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            {change && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  isUp
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/15 text-red-600 dark:text-red-400'
                )}
              >
                {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {change}
              </span>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
          <div className="mt-4 flex items-end gap-1 h-7 opacity-60 group-hover:opacity-100 transition-opacity">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: delay + i * 0.04, duration: 0.35 }}
                className={cn('flex-1 rounded-sm min-h-[4px]', accents.bar)}
              />
            ))}
          </div>
        </div>
      </LuxuryCard>
    </motion.div>
  );
}

// ─── Quick Action Button ───────────────────────────────────────────────────

export function AdminQuickAction({
  icon: Icon,
  title,
  subtitle,
  onClick,
  accent = 'emerald',
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
  accent?: 'emerald' | 'amber' | 'teal' | 'cyan' | 'slate';
}) {
  const iconBg = {
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    teal: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
    cyan: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    slate: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 dark:bg-white/[0.02] p-3 text-start transition-all hover:border-amber-500/20 hover:bg-emerald-500/5 hover:shadow-md group"
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      <span className="text-muted-foreground/50 group-hover:text-amber-500 transition-colors text-lg">‹</span>
    </button>
  );
}

// ─── Welcome Banner ────────────────────────────────────────────────────────

export function AdminWelcomeBanner({
  greeting,
  subtitle,
  stats,
}: {
  greeting: string;
  subtitle: string;
  stats?: { label: string; value: string }[];
}) {
  return (
    <LuxuryCard glow className="overflow-hidden">
      <div className="relative p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-amber-500/10 pointer-events-none" />
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/90 mb-2">
              CIAR Cars
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{greeting}</h2>
            <p className="text-muted-foreground mt-2 max-w-lg">{subtitle}</p>
          </div>
          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/10 bg-black/20 dark:bg-white/5 backdrop-blur px-4 py-3 min-w-[100px]"
                >
                  <p className="text-lg font-bold tabular-nums">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LuxuryCard>
  );
}
