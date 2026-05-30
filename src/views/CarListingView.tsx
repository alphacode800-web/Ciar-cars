'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Car,
  Sparkles,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CAR_SORT_OPTIONS, CURRENCY } from '@/lib/constants';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getStoredCountry,
  setStoredCountry,
} from '@/lib/countries';
import { useAppStore } from '@/store/app-store';
import { useCarStore } from '@/store/car-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { CarGrid } from '@/components/cars/CarGrid';
import CarFilters from '@/components/cars/CarFilters';
import type { CarListItem, PaginatedResponse, CarSearchFilters } from '@/types';

// ============ Helper ============

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(price));
}

function buildQueryString(filters: CarSearchFilters & { sortBy?: string; sortOrder?: string; page?: number; limit?: number }): string {
  const params = new URLSearchParams();

  if (filters.brand) params.set('brand', filters.brand);
  if (filters.model) params.set('model', filters.model);
  if (filters.year?.min) params.set('year', String(filters.year.min));
  if (filters.year?.max) params.set('yearMax', String(filters.year.max));
  if (filters.condition) params.set('condition', filters.condition);
  if (filters.price?.min) params.set('minPrice', String(filters.price.min));
  if (filters.price?.max) params.set('maxPrice', String(filters.price.max));
  if (filters.fuelType) params.set('fuelType', filters.fuelType);
  if (filters.transmission) params.set('transmission', filters.transmission);
  if (filters.bodyType) params.set('bodyType', filters.bodyType);
  if (filters.city) params.set('city', filters.city);
  if (filters.country) params.set('country', filters.country);
  if (filters.mileage?.min) params.set('minMileage', String(filters.mileage.min));
  if (filters.mileage?.max) params.set('maxMileage', String(filters.mileage.max));
  if (filters.isAvailableForRent) params.set('isAvailableForRent', 'true');
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.query) params.set('search', filters.query);

  return params.toString();
}

// ============ Main Component ============

export default function CarListingView() {
  const isMobile = useIsMobile();
  const { filters, setFilters, resetFilters, viewParams } = useAppStore();
  const { setCars, setLoading } = useCarStore();

  const [cars, setLocalCars] = useState<CarListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Initialize search input from filters
  useEffect(() => {
    if (filters.query) {
      setSearchInput(filters.query);
    }
  }, [filters.query]);

  // Default country filter (Sudan first, persisted in localStorage)
  useEffect(() => {
    if (filters.country) return;
    const stored = getStoredCountry();
    const initial = stored || DEFAULT_COUNTRY;
    setFilters({ country: initial, page: 1 });
    setStoredCountry(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once until country is set
  }, []);

  const handleCountryChange = useCallback(
    (countryName: string) => {
      setStoredCountry(countryName);
      setFilters({ country: countryName, page: 1 });
    },
    [setFilters]
  );

  // Pre-populate filters from viewParams (when coming from homepage or other views)
  useEffect(() => {
    if (viewParams) {
      const updates: Partial<typeof filters> = {};
      let hasUpdates = false;

      if (viewParams.brand && typeof viewParams.brand === 'string') {
        updates.brand = viewParams.brand;
        hasUpdates = true;
      }
      if (viewParams.bodyType && typeof viewParams.bodyType === 'string') {
        updates.bodyType = viewParams.bodyType as CarSearchFilters['bodyType'];
        hasUpdates = true;
      }
      if (viewParams.condition && typeof viewParams.condition === 'string') {
        updates.condition = viewParams.condition as CarSearchFilters['condition'];
        hasUpdates = true;
      }
      if (viewParams.fuelType && typeof viewParams.fuelType === 'string') {
        updates.fuelType = viewParams.fuelType as CarSearchFilters['fuelType'];
        hasUpdates = true;
      }
      if (viewParams.city && typeof viewParams.city === 'string') {
        updates.city = viewParams.city;
        hasUpdates = true;
      }
      if (viewParams.country && typeof viewParams.country === 'string') {
        updates.country = viewParams.country;
        hasUpdates = true;
      }
      if (viewParams.isAvailableForRent) {
        updates.isAvailableForRent = true;
        hasUpdates = true;
      }
      if (viewParams.isFeatured) {
        updates.isFeatured = true;
        hasUpdates = true;
      }
      if (viewParams.query && typeof viewParams.query === 'string') {
        updates.query = viewParams.query;
        setSearchInput(viewParams.query);
        hasUpdates = true;
      }

      if (hasUpdates) {
        setFilters(updates);
      }
    }
  }, [viewParams]);

  // Fetch cars
  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      const qs = buildQueryString(filters);
      const res = await fetch(`/api/cars?${qs}`);
      const json = (await res.json()) as PaginatedResponse<CarListItem>;

      if (json.data) {
        setLocalCars(json.data);
        setCars(json.data, json.pagination.total);
        setTotalCount(json.pagination.total);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (err) {
      console.error('[CarListing] Fetch error:', err);
      setLocalCars([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [filters, setCars, setLoading]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Debounced search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchInput(value);
      setFilters({ query: value || undefined, page: 1 });
    },
    [setFilters]
  );

  // Filter change handler
  const handleFilterChange = useCallback(
    (patch: Partial<CarSearchFilters>) => {
      setFilters({ ...patch, page: 1 });
    },
    [setFilters]
  );

  // Sort change handler
  const handleSortChange = useCallback(
    (value: string) => {
      const option = CAR_SORT_OPTIONS.find(
        (o) => `${o.value}-${o.order}` === value
      );
      if (option) {
        setFilters({ sortBy: option.value, sortOrder: option.order, page: 1 });
      }
    },
    [setFilters]
  );

  // Pagination
  const goToPage = useCallback(
    (page: number) => {
      setFilters({ page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setFilters]
  );

  // Reset
  const handleReset = useCallback(() => {
    resetFilters();
    setSearchInput('');
  }, [resetFilters]);

  // Sort value
  const sortValue = useMemo(
    () => `${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`,
    [filters.sortBy, filters.sortOrder]
  );

  // Pagination range
  const paginationRange = useMemo(() => {
    const page = filters.page || 1;
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [filters.page, totalPages]);

  const selectedCountry = filters.country || DEFAULT_COUNTRY;

  return (
    <div className="min-h-screen bg-background">
      {/* Country selector */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium shrink-0">
              <Globe className="h-4 w-4 text-emerald-600" />
              <span>Browse cars in</span>
            </div>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger className="w-full sm:w-[280px] h-10 bg-background">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-[320px]">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.nameEn}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.nameEn}</span>
                      {c.featured && (
                        <Badge variant="secondary" className="text-[10px] ml-1">
                          Popular
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground sm:ml-auto">
              Showing listings in <strong className="text-foreground">{selectedCountry}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3">
            {/* Search bar — more prominent */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                <Search className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Input
                placeholder="Search by make, model, year, or keyword..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-11 pr-10 h-11 bg-muted/60 border-border/50 focus-visible:bg-background focus-visible:border-emerald-300 dark:focus-visible:border-emerald-700 focus-visible:ring-emerald-200/50 dark:focus-visible:ring-emerald-800/30 transition-all duration-200 rounded-xl text-sm"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted"
                  onClick={() => handleSearch('')}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Sort dropdown */}
            <Select value={sortValue} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] h-11 bg-muted/60 border-border/50 rounded-xl text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {CAR_SORT_OPTIONS.map((opt, idx) => (
                  <SelectItem key={`${opt.value}-${opt.order}-${idx}`} value={`${opt.value}-${opt.order}`}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View mode toggle (desktop) */}
            {!isMobile && (
              <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Mobile filter button */}
            {isMobile && (
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-11 gap-2 rounded-xl">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] sm:w-[360px] p-0">
                  <SheetHeader className="px-5 py-4 border-b border-border/50">
                    <SheetTitle className="text-base font-semibold flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="px-4 py-3">
                    <CarFilters
                      filters={filters}
                      onChange={(patch) => {
                        handleFilterChange(patch);
                      }}
                      onReset={() => {
                        handleReset();
                        setMobileFiltersOpen(false);
                      }}
                    />
                    <div className="pt-3 pb-4">
                      <Button
                        className="w-full"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        Show {totalCount > 0 ? `${totalCount} Results` : 'Results'}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar (desktop) */}
          {!isMobile && (
            <motion.aside
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-64 flex-shrink-0"
            >
              <div className="sticky top-[72px]">
                <CarFilters
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={handleReset}
                  className="border border-border/50 rounded-xl bg-card p-4 shadow-sm"
                />
              </div>
            </motion.aside>
          )}

          {/* Results area */}
          <div className="flex-1 min-w-0">
            {/* Page Title + Results header */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Browse Cars
                </h1>
              </div>
              <div className="flex items-center justify-between">
                {isLoading ? (
                  <Skeleton className="h-4 w-52" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-semibold text-foreground">
                      {cars.length}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-foreground">
                      {totalCount.toLocaleString()}
                    </span>{' '}
                    cars available
                  </p>
                )}
              </div>
            </motion.div>

            {/* Active filter badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex items-center justify-between mb-5"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                {!isMobile && filters.brand && (
                  <FilterBadge label={filters.brand} onRemove={() => handleFilterChange({ brand: undefined })} />
                )}
                {!isMobile && filters.model && (
                  <FilterBadge label={filters.model} onRemove={() => handleFilterChange({ model: undefined })} />
                )}
                {!isMobile && filters.condition && (
                  <FilterBadge label={filters.condition === 'new' ? 'New' : 'Used'} onRemove={() => handleFilterChange({ condition: undefined })} />
                )}
                {!isMobile && filters.city && (
                  <FilterBadge label={filters.city} onRemove={() => handleFilterChange({ city: undefined })} />
                )}
                {!isMobile && filters.country && (
                  <FilterBadge label={filters.country} onRemove={() => handleFilterChange({ country: undefined })} />
                )}
                {!isMobile && filters.bodyType && (
                  <FilterBadge label={filters.bodyType} onRemove={() => handleFilterChange({ bodyType: undefined })} />
                )}
              </div>
            </motion.div>

            {/* Grid */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <CarGrid
                cars={cars}
                isLoading={isLoading}
                viewMode={isMobile ? 'grid' : viewMode}
                onViewModeChange={setViewMode}
              />
            </motion.div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-center justify-center mt-8"
              >
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={(filters.page || 1) <= 1}
                    onClick={() => goToPage(1)}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={(filters.page || 1) <= 1}
                    onClick={() => goToPage((filters.page || 1) - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {paginationRange.map((p, idx) =>
                    p === '...' ? (
                      <span
                        key={`dots-${idx}`}
                        className="px-1.5 text-sm text-muted-foreground"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={p === (filters.page || 1) ? 'default' : 'outline'}
                        size="icon"
                        className={cn(
                          'h-9 w-9',
                          p === (filters.page || 1) && 'shadow-sm'
                        )}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={(filters.page || 1) >= totalPages}
                    onClick={() => goToPage((filters.page || 1) + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={(filters.page || 1) >= totalPages}
                    onClick={() => goToPage(totalPages)}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Filter Badge ============

function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className="gap-1 pl-2 pr-1 h-6 text-xs font-medium cursor-default"
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </Badge>
  );
}
