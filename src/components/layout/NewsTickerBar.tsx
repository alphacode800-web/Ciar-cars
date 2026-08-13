'use client';

import { Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getTickerFontFamily,
  type NewsTickerConfig,
  type NewsTickerItem,
  type NewsTickerSeparator,
} from '@/lib/news-ticker';

function Separator({ style, color }: { style: NewsTickerSeparator; color: string }) {
  if (style === 'none') return null;
  if (style === 'dot') {
    return (
      <span
        className="mx-4 inline-block h-1.5 w-1.5 shrink-0 rounded-full opacity-80"
        style={{ backgroundColor: color }}
        aria-hidden
      />
    );
  }
  if (style === 'diamond') {
    return (
      <span
        className="mx-4 inline-block h-2 w-2 shrink-0 rotate-45 opacity-70"
        style={{ backgroundColor: color }}
        aria-hidden
      />
    );
  }
  return (
    <span
      className="mx-5 inline-block h-4 w-px shrink-0 opacity-40"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

interface NewsTickerBarProps {
  config: NewsTickerConfig;
  isRTL?: boolean;
  preview?: boolean;
  onItemClick?: (item: NewsTickerItem) => void;
  className?: string;
}

export function NewsTickerBar({
  config,
  isRTL = false,
  preview = false,
  onItemClick,
  className,
}: NewsTickerBarProps) {
  const { style, speedSeconds, items } = config;
  const activeItems = items.filter((i) => i.text.trim());
  if (activeItems.length === 0) return null;

  const loopItems = [...activeItems, ...activeItems];
  const bgStyle = style.useGradient
    ? {
        background: `linear-gradient(90deg, ${style.backgroundColor} 0%, ${style.backgroundColorEnd} 50%, ${style.backgroundColor} 100%)`,
      }
    : { backgroundColor: style.backgroundColor };

  return (
    <div
      className={cn(
        'relative overflow-hidden shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]',
        !preview && 'fixed top-[calc(4rem+2px)] inset-x-0 z-40',
        className
      )}
      style={{
        height: style.height,
        borderBottom: `1px solid ${style.borderColor}`,
        ...bgStyle,
      }}
      role="region"
      aria-label="News ticker"
      aria-live="polite"
    >
      {/* Ambient shine */}
      {style.showShimmer && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] animate-ticker-shine"
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.9) 50%, transparent 60%)',
          }}
        />
      )}

      <div className={cn('relative mx-auto flex h-full max-w-7xl items-stretch px-0 sm:px-2', isRTL && 'flex-row-reverse')}>
        {/* Label badge — TV news style */}
        {style.showLabel && (
          <div
            className={cn(
              'relative z-10 flex shrink-0 items-center gap-1.5 px-3 sm:px-4',
              'shadow-lg',
              isRTL ? 'border-l' : 'border-r',
              style.labelPulse && 'animate-ticker-label-pulse'
            )}
            style={{
              backgroundColor: style.labelBackgroundColor,
              color: style.labelTextColor,
              borderColor: style.borderColor,
              fontFamily: getTickerFontFamily(style.fontFamily),
              fontWeight: style.fontWeight,
              fontSize: Math.max(style.fontSize - 1, 10),
              letterSpacing: style.letterSpacing + 0.5,
              textTransform: 'uppercase',
            }}
          >
            <Radio className="h-3 w-3 shrink-0 opacity-90" />
            <span className="whitespace-nowrap font-bold tracking-wider">{style.labelText}</span>
            {style.labelPulse && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
          </div>
        )}

        {/* Marquee track */}
        <div
          className={cn(
            'group/ticker relative min-w-0 flex-1 overflow-hidden',
            style.showEdgeFade && 'ticker-edge-fade'
          )}
        >
          <div
            className={cn(
              'flex h-full w-max items-center whitespace-nowrap animate-news-ticker',
              style.pauseOnHover && 'group-hover/ticker:[animation-play-state:paused]'
            )}
            style={{
              animationDuration: `${speedSeconds}s`,
              color: style.textColor,
              fontFamily: getTickerFontFamily(style.fontFamily),
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              letterSpacing: `${style.letterSpacing}px`,
              textTransform: style.textTransform,
            }}
          >
            {loopItems.map((item, index) => (
              <span key={`${item.id}-${index}`} className="inline-flex items-center shrink-0">
                {index > 0 && style.showSeparator && (
                  <Separator style={style.separatorStyle} color={style.accentColor} />
                )}
                <button
                  type="button"
                  onClick={() => onItemClick?.(item)}
                  className={cn(
                    'inline-flex items-center px-2 transition-opacity duration-200',
                    item.link ? 'cursor-pointer hover:opacity-75' : 'cursor-default'
                  )}
                >
                  {item.text}
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
