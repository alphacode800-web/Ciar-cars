'use client';

import React from 'react';
import { Car, SearchX } from 'lucide-react';
import { CarCard, CarCardSkeleton } from './CarCard';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
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
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
        {Array.from({ length: 8 }).map((_, i) => (
          <CarCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No cars found</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          We couldn&apos;t find any cars matching your criteria. Try adjusting your
          filters or search terms.
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

    return (
      <Pagination className="mt-10">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange?.(currentPage - 1)}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
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
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange?.(currentPage + 1)}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div>
      {/* 3-column grid on large screens for the wider 3-image cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>

      {renderPagination()}
    </div>
  );
}
