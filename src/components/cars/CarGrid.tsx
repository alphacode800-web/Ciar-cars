'use client';

import React, { useCallback } from 'react';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { CarCard, CarCardSkeleton } from './CarCard';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import type { CarListItem } from '@/types';

interface CarGridProps {
  cars: CarListItem[];
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function CarGrid({
  cars,
  isLoading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}: CarGridProps) {
  const { locale, isRTL } = useTranslation();
  const isAr = locale === 'ar';
  const tr = useCallback((ar: string, other: string) => (isAr ? ar : other), [isAr]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CarCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {tr('لا توجد سيارات', 'No cars found')}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          {tr(
            'لم نعثر على سيارات تطابق معاييرك. جرّب تعديل الفلاتر أو كلمات البحث.',
            "We couldn't find any cars matching your criteria. Try adjusting your filters or search terms."
          )}
        </p>
      </div>
    );
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5;

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }

    const chevronFlip = isRTL ? 'rotate-180' : undefined;

    return (
      <Pagination className="mt-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              size="default"
              onClick={() => onPageChange?.(currentPage - 1)}
              className={cn(
                'gap-1 px-2.5 cursor-pointer',
                currentPage <= 1 && 'pointer-events-none opacity-50'
              )}
              aria-label={tr('الصفحة السابقة', 'Go to previous page')}
            >
              <ChevronLeft className={cn('h-4 w-4', chevronFlip)} />
              <span className="hidden sm:block">{tr('السابق', 'Previous')}</span>
            </PaginationLink>
          </PaginationItem>

          {pages.map((page, i) =>
            page === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange?.(page)}
                  className="cursor-pointer"
                  aria-label={tr(`الصفحة ${page}`, `Page ${page}`)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationLink
              size="default"
              onClick={() => onPageChange?.(currentPage + 1)}
              className={cn(
                'gap-1 px-2.5 cursor-pointer',
                currentPage >= totalPages && 'pointer-events-none opacity-50'
              )}
              aria-label={tr('الصفحة التالية', 'Go to next page')}
            >
              <span className="hidden sm:block">{tr('التالي', 'Next')}</span>
              <ChevronRight className={cn('h-4 w-4', chevronFlip)} />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>

      {renderPagination()}
    </div>
  );
}
