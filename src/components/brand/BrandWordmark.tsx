'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  BRAND_SIZE_SCALE,
  DEFAULT_BRAND_WORDMARK,
  getBrandFontFamily,
  parseBrandWordmark,
  type BrandWordmarkConfig,
} from '@/lib/brand-wordmark';

interface BrandWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Show secondary/tagline text */
  showSecondary?: boolean;
  /** @deprecated Use showSecondary */
  showWordmark?: boolean;
  config?: BrandWordmarkConfig;
  onClick?: () => void;
  preview?: boolean;
}

export function BrandWordmark({
  className,
  size = 'md',
  showSecondary: showSecondaryProp,
  showWordmark,
  config: configProp,
  onClick,
  preview = false,
}: BrandWordmarkProps) {
  const [config, setConfig] = useState<BrandWordmarkConfig>(configProp ?? DEFAULT_BRAND_WORDMARK);

  useEffect(() => {
    if (configProp) {
      setConfig(configProp);
      return;
    }
    let cancelled = false;
    fetch('/api/public/site-content', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        const parsed =
          json.data?.brandWordmark ??
          parseBrandWordmark(json.data?.settings ?? {});
        setConfig(parsed);
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_BRAND_WORDMARK);
      });
    return () => {
      cancelled = true;
    };
  }, [configProp]);

  const scale = BRAND_SIZE_SCALE[size];
  const showSecondary =
    showSecondaryProp ?? (showWordmark !== undefined ? showWordmark : config.showSecondary);
  const primaryText = config.primaryText;
  const secondaryText = config.secondaryText;
  const primarySize = Math.round(config.fontSize * scale);
  const secondarySize = Math.round(config.secondaryFontSize * scale);

  const primaryStyle: React.CSSProperties = {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: '800',
    fontSize: Math.round(primarySize * 1.12),
    letterSpacing: `${Math.max(config.letterSpacing * 1.35, 1.2)}px`,
    textTransform: 'uppercase',
    fontStyle: 'normal',
    lineHeight: 1.1,
    ...(config.useGradient
      ? {
          backgroundImage: `linear-gradient(135deg, ${config.gradientStart} 0%, ${config.gradientEnd} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }
      : { color: config.solidColor }),
    ...(config.showGlow ? { filter: `drop-shadow(0 0 8px ${config.glowColor})` } : {}),
  };

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex flex-col items-center group',
        onClick && 'cursor-pointer',
        config.showShimmer && 'brand-wordmark-shimmer',
        preview && 'pointer-events-none',
        className
      )}
      aria-label={`${primaryText}${showSecondary && secondaryText ? ` ${secondaryText}` : ''}`}
    >
      <span className="flex items-baseline gap-1.5 sm:gap-2">
        <span className="relative" style={primaryStyle}>
          {primaryText}
        </span>
      </span>
      {showSecondary && secondaryText && (
        <span
          className={cn(
            'mt-0.5 transition-opacity group-hover:opacity-85',
            size === 'sm' && 'text-[0.78em]'
          )}
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: '400',
            fontSize: Math.max(Math.round(secondarySize * 0.72), 11),
            color: config.secondaryColor,
            letterSpacing: `${Math.max(config.letterSpacing * 0.9, 1)}px`,
            fontStyle: 'normal',
            textTransform: 'lowercase',
            lineHeight: 1,
          }}
        >
          {secondaryText}
        </span>
      )}
      {config.showUnderline && (
        <span
          className="mt-0.5 h-[2px] rounded-full transition-all duration-300 group-hover:w-full"
          style={{
            width: size === 'sm' ? '60%' : '75%',
            background: `linear-gradient(90deg, ${config.underlineStart}, ${config.underlineEnd})`,
          }}
        />
      )}
    </Wrapper>
  );
}

/** @deprecated Use BrandWordmark */
export const BrandLogo = BrandWordmark;
