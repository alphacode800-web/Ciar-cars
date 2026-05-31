'use client';

import { cn } from '@/lib/utils';

interface PageHeroProps {
  title: React.ReactNode;
  subtitle?: string;
  badge?: string;
  image: string;
  className?: string;
  compact?: boolean;
}

export function PageHero({
  title,
  subtitle,
  badge,
  image,
  className,
  compact,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden flex items-end',
        compact ? 'min-h-[220px] sm:min-h-[280px]' : 'min-h-[280px] sm:min-h-[360px] md:min-h-[420px]',
        className
      )}
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover scale-105"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-8 pt-16 md:px-6 md:pb-12">
        {badge && (
          <span className="inline-block mb-3 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-100 backdrop-blur-sm border border-emerald-400/20">
            {badge}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl max-w-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
