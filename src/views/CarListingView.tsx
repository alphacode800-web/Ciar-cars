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
  Sparkles,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CAR_SORT_OPTIONS } from '@/lib/constants';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getStoredCountry,
  setStoredCountry,
} from '@/lib/countries';
import { useAppStore } from '@/store/app-store';
import { useCarStore } from '@/store/car-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import { CarGrid } from '@/components/cars/CarGrid';
import CarFilters from '@/components/cars/CarFilters';
import type { Car, CarListItem, PaginatedResponse, CarSearchFilters } from '@/types';

// ============ Helper ============

function buildQueryString(filters: CarSearchFilters & { sortBy?: string; sortOrder?: string; page?: number; limit?: number }): string {
  const params = new URLSearchParams();

  if (filters.brand) params.set('brand', filters.brand);
  if (filters.model) params.set('model', filters.model);
  if (filters.year?.min) params.set('year', String(filters.year.min));
  if (filters.year?.max) params.set('yearMax', String(filters.year.max));
  if (filters.condition) params.set('condition', filters.condition);
  if (filters.vehicleType) params.set('vehicleType', filters.vehicleType);
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

const SORT_LABELS_AR: Record<string, string> = {
  'createdAt-desc': 'الأحدث أولاً',
  'createdAt-asc': 'الأقدم أولاً',
  'price-asc': 'السعر: من الأقل للأعلى',
  'price-desc': 'السعر: من الأعلى للأقل',
  'year-desc': 'السنة: الأحدث أولاً',
  'year-asc': 'السنة: الأقدم أولاً',
  'mileage-asc': 'المسافة: من الأقل للأعلى',
  'mileage-desc': 'المسافة: من الأعلى للأقل',
  'viewsCount-desc': 'الأكثر مشاهدة',
  'horsepower-desc': 'القوة: من الأعلى للأقل',
};

const MOTORCYCLE_BODY_TYPE_LABELS_AR: Record<string, string> = {
  sport: 'رياضية',
  cruiser: 'كروزر',
  touring: 'سياحية',
  naked: 'نيكد / شارع',
  adventure: 'مغامرات',
  scooter: 'سكوتر',
  offroad: 'طرق وعرة',
  dual_sport: 'ثنائية الاستخدام',
  chopper: 'شopper',
  electric: 'كهربائية',
};

const BODY_TYPE_LABELS_AR: Record<string, string> = {
  sedan: 'سيدان',
  suv: 'دفع رباعي',
  coupe: 'كوبيه',
  truck: 'شاحنة',
  van: 'فان / ميني فان',
  convertible: 'مكشوفة',
  hatchback: 'هاتشباك',
  wagon: 'ستيشن',
};

// ============ Main Component ============

export default function CarListingView() {
  const isMobile = useIsMobile();
  const { locale, isRTL } = useTranslation();
  const isAr = locale === 'ar';
  const tr = useCallback((ar: string, other: string) => (isAr ? ar : other), [isAr]);

  const { filters, setFilters, resetFilters, viewParams } = useAppStore();
  const { setCars, setLoading } = useCarStore();

  const vehicleType = filters.vehicleType ?? 'car';
  const isMotorcycle = vehicleType === 'motorcycle';

  const [cars, setLocalCars] = useState<CarListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const countryLabel = useCallback(
    (nameEn: string) => {
      const found = COUNTRIES.find((c) => c.nameEn === nameEn);
      return isAr && found ? found.nameAr : nameEn;
    },
    [isAr]
  );

  const sortOptionLabel = useCallback(
    (opt: (typeof CAR_SORT_OPTIONS)[number]) => {
      const key = `${opt.value}-${opt.order}`;
      return isAr ? (SORT_LABELS_AR[key] ?? opt.label) : opt.label;
    },
    [isAr]
  );

  const bodyTypeLabel = useCallback(
    (value: string) => (isAr ? (BODY_TYPE_LABELS_AR[value] ?? value) : value),
    [isAr]
  );

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
      if (viewParams.vehicleType && typeof viewParams.vehicleType === 'string') {
        updates.vehicleType = viewParams.vehicleType as CarSearchFilters['vehicleType'];
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
        setCars(json.data as Car[], json.pagination.total);
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

  const handleVehicleTypeChange = useCallback(
    (type: 'car' | 'motorcycle') => {
      setFilters({ vehicleType: type, page: 1, bodyType: undefined });
    },
    [setFilters]
  );

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
  const chevronFlip = isRTL ? 'rotate-180' : undefined;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Country selector */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium shrink-0">
              <Globe className="h-4 w-4 text-emerald-600" />
              <span>{tr(isMotorcycle ? 'تصفح الدراجات في' : 'تصفح السيارات في', isMotorcycle ? 'Browse motorcycles in' : 'Browse cars in')}</span>
            </div>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger className="w-full sm:w-[280px] h-10 bg-background">
                <SelectValue placeholder={tr('اختر الدولة', 'Select country')} />
              </SelectTrigger>
              <SelectContent className="max-h-[320px]">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.nameEn}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{isAr ? c.nameAr : c.nameEn}</span>
                      {c.featured && (
                        <Badge variant="secondary" className="text-[10px] ms-1">
                          {tr('شائع', 'Popular')}
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground sm:ms-auto">
              {tr('عرض الإعلانات في', 'Showing listings in')}{' '}
              <strong className="text-foreground">{countryLabel(selectedCountry)}</strong>
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
              <div className="absolute start-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                <Search className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Input
                placeholder={tr(
                  'ابحث بالماركة أو الموديل أو السنة أو كلمة مفتاحية...',
                  'Search by make, model, year, or keyword...'
                )}
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="ps-11 pe-10 h-11 bg-muted/60 border-border/50 focus-visible:bg-background focus-visible:border-emerald-300 dark:focus-visible:border-emerald-700 focus-visible:ring-emerald-200/50 dark:focus-visible:ring-emerald-800/30 transition-all duration-200 rounded-xl text-sm"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute end-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted"
                  onClick={() => handleSearch('')}
                  aria-label={tr('مسح البحث', 'Clear search')}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Sort dropdown */}
            <Select value={sortValue} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] h-11 bg-muted/60 border-border/50 rounded-xl text-sm">
                <SelectValue placeholder={tr('ترتيب حسب', 'Sort by')} />
              </SelectTrigger>
              <SelectContent>
                {CAR_SORT_OPTIONS.map((opt, idx) => (
                  <SelectItem key={`${opt.value}-${opt.order}-${idx}`} value={`${opt.value}-${opt.order}`}>
                    {sortOptionLabel(opt)}
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
                  aria-label={tr('عرض شبكة', 'Grid view')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setViewMode('list')}
                  aria-label={tr('عرض قائمة', 'List view')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Mobile filter button */}
            {isMobile && (
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button className="h-11 gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex-1 sm:flex-none min-h-[44px]">
                    <SlidersHorizontal className="w-4 h-4" />
                    {tr('الفلاتر', 'Filters')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85dvh] rounded-t-2xl p-0">
                  <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/30 mt-3 mb-1" />
                  <SheetHeader className="px-5 py-3 border-b border-border/50">
                    <SheetTitle className="text-base font-semibold flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      {tr('الفلاتر', 'Filters')}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto px-4 py-3 max-h-[calc(85dvh-8rem)]">
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
                  </div>
                  <div className="sticky bottom-0 p-4 border-t bg-background pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <Button
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      {totalCount > 0
                        ? tr(`عرض ${totalCount} نتيجة`, `Show ${totalCount} Results`)
                        : tr('عرض النتائج', 'Show Results')}
                    </Button>
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
              initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
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
                  {tr(
                    isMotorcycle ? 'تصفح الدراجات' : 'تصفح السيارات',
                    isMotorcycle ? 'Browse Motorcycles' : 'Browse Cars'
                  )}
                </h1>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="inline-flex rounded-xl bg-muted/60 p-1 border border-border/50">
                  <Button
                    variant={!isMotorcycle ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-lg h-9 px-4"
                    onClick={() => handleVehicleTypeChange('car')}
                  >
                    {tr('السيارات', 'Cars')}
                  </Button>
                  <Button
                    variant={isMotorcycle ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-lg h-9 px-4"
                    onClick={() => handleVehicleTypeChange('motorcycle')}
                  >
                    {tr('الدراجات', 'Motorcycles')}
                  </Button>
                </div>
                {isLoading ? (
                  <Skeleton className="h-4 w-52" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {tr('عرض', 'Showing')}{' '}
                    <span className="font-semibold text-foreground">
                      {cars.length}
                    </span>{' '}
                    {tr('من', 'of')}{' '}
                    <span className="font-semibold text-foreground">
                      {totalCount.toLocaleString(isAr ? 'ar' : 'en-US')}
                    </span>{' '}
                    {tr(
                      isMotorcycle ? 'دراجة متاحة' : 'سيارة متاحة',
                      isMotorcycle ? 'motorcycles available' : 'cars available'
                    )}
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
                  <FilterBadge
                    label={filters.condition === 'new' ? tr('جديد', 'New') : tr('مستعمل', 'Used')}
                    onRemove={() => handleFilterChange({ condition: undefined })}
                  />
                )}
                {!isMobile && filters.city && (
                  <FilterBadge label={filters.city} onRemove={() => handleFilterChange({ city: undefined })} />
                )}
                {!isMobile && filters.country && (
                  <FilterBadge
                    label={countryLabel(filters.country)}
                    onRemove={() => handleFilterChange({ country: undefined })}
                  />
                )}
                {!isMobile && filters.bodyType && (
                  <FilterBadge
                    label={bodyTypeLabel(filters.bodyType)}
                    onRemove={() => handleFilterChange({ bodyType: undefined })}
                  />
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
                    aria-label={tr('الصفحة الأولى', 'First page')}
                  >
                    <ChevronsLeft className={cn('w-4 h-4', chevronFlip)} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={(filters.page || 1) <= 1}
                    onClick={() => goToPage((filters.page || 1) - 1)}
                    aria-label={tr('الصفحة السابقة', 'Previous page')}
                  >
                    <ChevronLeft className={cn('w-4 h-4', chevronFlip)} />
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
                        aria-label={tr(`الصفحة ${p}`, `Page ${p}`)}
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
                    aria-label={tr('الصفحة التالية', 'Next page')}
                  >
                    <ChevronRight className={cn('w-4 h-4', chevronFlip)} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={(filters.page || 1) >= totalPages}
                    onClick={() => goToPage(totalPages)}
                    aria-label={tr('الصفحة الأخيرة', 'Last page')}
                  >
                    <ChevronsRight className={cn('w-4 h-4', chevronFlip)} />
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
      className="gap-1 ps-2 pe-1 h-6 text-xs font-medium cursor-default"
    >
      {label}
      <button
        onClick={onRemove}
        className="ms-0.5 hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
        aria-label="Remove filter"
      >
        <X className="w-3 h-3" />
      </button>
    </Badge>
  );
}
