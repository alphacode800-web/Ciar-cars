'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  X,
  ArrowRight,
  Car,
  MapPin,
  Fuel,
  Settings2,
  Calendar,
  Eye,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CURRENCY, CAR_BODY_TYPES, FUEL_TYPES, TRANSMISSION_TYPES } from '@/lib/constants';
import { useAppStore } from '@/store/app-store';
import { useIsMobile } from '@/hooks/use-mobile';
import type { CarListItem } from '@/types';

// ============ Types ============

interface SearchResult extends CarListItem {
  primaryImage?: string | null;
  ownerName?: string | null;
}

// ============ Helpers ============

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(price));
}

function getBodyTypeLabel(value: string): string {
  return CAR_BODY_TYPES.find((b) => b.value === value)?.label || value;
}

function getFuelTypeLabel(value: string): string {
  return FUEL_TYPES.find((f) => f.value === value)?.label || value;
}

function getTransmissionLabel(value: string): string {
  return TRANSMISSION_TYPES.find((t) => t.value === value)?.label || value;
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// ============ Result Card ============

function ResultCard({
  car,
  isSelected,
  onClick,
}: {
  car: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  const conditionColor =
    car.condition === 'new'
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
      : 'bg-amber-500/10 text-amber-600 border-amber-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={cn(
          'group cursor-pointer transition-all duration-200 border hover:shadow-md',
          isSelected
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-border/60 hover:border-border'
        )}
        onClick={onClick}
      >
        <CardContent className="p-3 flex gap-3">
          {/* Thumbnail */}
          <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {car.primaryImage ? (
              <img
                src={car.primaryImage}
                alt={car.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-6 h-6 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-2">
                <h4 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {car.title}
                </h4>
                <Badge
                  className={cn(
                    'text-[10px] font-medium border flex-shrink-0',
                    conditionColor
                  )}
                >
                  {car.condition === 'new' ? 'New' : 'Used'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {car.year}
                {car.bodyType && ` · ${getBodyTypeLabel(car.bodyType)}`}
              </p>
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <span className="text-sm font-bold text-foreground">
                {CURRENCY.symbol} {formatPrice(car.price)}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {car.city}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============ Skeleton ============

function ResultSkeleton() {
  return (
    <Card className="border border-border/60">
      <CardContent className="p-3 flex gap-3">
        <Skeleton className="w-20 h-16 sm:w-24 sm:h-18 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Main Component ============

export default function SearchView() {
  const isMobile = useIsMobile();
  const { setView, setFilters } = useAppStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setSelectedIndex(-1);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data || []);
      }
    } catch (err) {
      console.error('[Search] Error:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useRef(debounce(doSearch, 300)).current;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        } else if (query.trim()) {
          // Go to listing with query
          handleViewAll();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setView('home');
      }
    },
    [results, selectedIndex, query, setView]
  );

  // Select a result
  const handleSelect = useCallback(
    (car: SearchResult) => {
      setView('detail', { carId: car.id });
    },
    [setView]
  );

  // View all results
  const handleViewAll = useCallback(() => {
    setFilters({ query: query.trim() || undefined, page: 1 });
    setView('listing');
  }, [query, setFilters, setView]);

  // Close search
  const handleClose = useCallback(() => {
    setView('home');
  }, [setView]);

  // Popular searches
  const popularSearches = [
    'BMW 320i',
    'Toyota Corolla',
    'Mercedes C200',
    'Hyundai Tucson',
    'Tesla Model 3',
    'Kia Sportage',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Full-screen search overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Close button */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground -ml-2"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
        </div>

        {/* Search input */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 sm:mt-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search cars by make, model, or keyword..."
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="h-14 pl-12 pr-12 text-lg bg-muted/50 border-border/60 rounded-2xl focus-visible:bg-background focus-visible:rounded-2xl"
                autoComplete="off"
              />
              {isLoading ? (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              ) : query ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setHasSearched(false);
                    inputRef.current?.focus();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-4"
          >
            <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto scrollbar-none">
              {/* Loading skeletons */}
              {isLoading && (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ResultSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Results list */}
              {!isLoading && results.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs text-muted-foreground">
                      {results.length} result{results.length !== 1 ? 's' : ''} found
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Use ↑↓ to navigate · Enter to select
                    </span>
                  </div>
                  <div className="space-y-2">
                    {results.map((car, idx) => (
                      <div
                        key={car.id}
                        ref={idx === selectedIndex ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                      >
                        <ResultCard
                          car={car}
                          isSelected={idx === selectedIndex}
                          onClick={() => handleSelect(car)}
                        />
                      </div>
                    ))}
                  </div>
                  {/* View all */}
                  <Button
                    variant="outline"
                    className="w-full mt-3 gap-2"
                    onClick={handleViewAll}
                  >
                    View all results
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* No results */}
              {!isLoading && hasSearched && query.trim() && results.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    No results found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Try different keywords or{' '}
                    <button
                      onClick={handleViewAll}
                      className="text-primary hover:underline font-medium"
                    >
                      browse all cars
                    </button>
                  </p>
                </div>
              )}

              {/* Default state: Popular searches */}
              {!isLoading && !hasSearched && !query.trim() && (
                <div className="py-8">
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          doSearch(term);
                        }}
                        className="px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border/40"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
