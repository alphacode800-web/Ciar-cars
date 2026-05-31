'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export const BRAND_LOGO_PATH = '/brand/rciar-logo.png';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const heights = { sm: 32, md: 40, lg: 52 } as const;

export function BrandLogo({
  className,
  imageClassName,
  showWordmark = true,
  size = 'md',
  onClick,
}: BrandLogoProps) {
  const h = heights[size];
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn('flex items-center gap-2 group', onClick && 'cursor-pointer', className)}
      aria-label="RCiAR Cars"
    >
      <Image
        src={BRAND_LOGO_PATH}
        alt="RCiAR"
        width={Math.round(h * 2.4)}
        height={h}
        className={cn('h-auto w-auto object-contain', imageClassName)}
        style={{ height: h, width: 'auto', maxWidth: h * 2.6 }}
        priority
      />
      {showWordmark && (
        <span className="text-lg font-extralight text-muted-foreground hidden sm:inline">
          Cars
        </span>
      )}
    </Wrapper>
  );
}
