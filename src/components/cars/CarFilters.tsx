'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Car,
  Fuel,
  Settings2,
  Building,
  MapPin,
  Gauge,
  DollarSign,
  Calendar,
  Tag,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CAR_BRANDS,
  CAR_BODY_TYPES,
  MOTORCYCLE_BRANDS,
  MOTORCYCLE_BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
} from '@/lib/constants';
import type { CarSearchFilters } from '@/types';
import { BodyType } from '@/types';
import { COUNTRIES, COUNTRY_NAMES } from '@/lib/countries';
import { useTranslation } from '@/hooks/use-translation';

// ============ Types ============

interface CarFiltersProps {
  filters: CarSearchFilters;
  onChange: (filters: Partial<CarSearchFilters>) => void;
  onReset: () => void;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// ============ Constants ============

const CITIES = [
  'Dubai',
  'London',
  'Tokyo',
  'New York',
  'Paris',
  'Berlin',
  'Sydney',
  'Toronto',
  'Singapore',
  'Mumbai',
  'São Paulo',
  'Seoul',
  'Los Angeles',
  'Zurich',
  'Madrid',
  'Milan',
  'Amsterdam',
  'Bangkok',
  'Istanbul',
  'Barcelona',
] as const;

const CITY_LABELS_AR: Record<string, string> = {
  Dubai: 'دبي',
  London: 'لندن',
  Tokyo: 'طوكيو',
  'New York': 'نيويورك',
  Paris: 'باريس',
  Berlin: 'برلين',
  Sydney: 'سيدني',
  Toronto: 'تورونتو',
  Singapore: 'سنغافورة',
  Mumbai: 'مومباي',
  'São Paulo': 'ساو باولو',
  Seoul: 'سيول',
  'Los Angeles': 'لوس أنجلوس',
  Zurich: 'زيورخ',
  Madrid: 'مدريد',
  Milan: 'ميلانو',
  Amsterdam: 'أمستردام',
  Bangkok: 'بانكوك',
  Istanbul: 'إسطنبول',
  Barcelona: 'برشلونة',
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

const FUEL_LABELS_AR: Record<string, string> = {
  petrol: 'بنزين',
  diesel: 'ديزل',
  electric: 'كهربائي',
  hybrid: 'هجين',
};

const TRANSMISSION_LABELS_AR: Record<string, string> = {
  automatic: 'أوتوماتيك',
  manual: 'يدوي',
  cvt: 'CVT',
};

// ============ Filter Section ============

function FilterSection({ title, icon, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useOpenState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 group">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <AnimatePresence initial={false}>
        {isOpen && (
          <CollapsibleContent forceMount>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-3 pt-1 space-y-2.5">{children}</div>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}

// Simple hook for collapsible state
function useOpenState(defaultOpen: boolean) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return [isOpen, setIsOpen] as const;
}

// ============ Active Filters Count ============

function getActiveFilterCount(filters: CarSearchFilters): number {
  let count = 0;
  if (filters.brand) count++;
  if (filters.model) count++;
  if (filters.year?.min || filters.year?.max) count++;
  if (filters.condition) count++;
  if (filters.price?.min || filters.price?.max) count++;
  if (filters.fuelType) count++;
  if (filters.transmission) count++;
  if (filters.bodyType) count++;
  if (filters.country) count++;
  if (filters.city) count++;
  if (filters.mileage?.min || filters.mileage?.max) count++;
  if (filters.isAvailableForRent) count++;
  return count;
}

// ============ Main Component ============

export default function CarFilters({
  filters,
  onChange,
  onReset,
  className,
}: CarFiltersProps) {
  const { locale, isRTL } = useTranslation();
  const isAr = locale === 'ar';
  const tr = useCallback((ar: string, other: string) => (isAr ? ar : other), [isAr]);

  const activeCount = getActiveFilterCount(filters);
  const isMotorcycle = filters.vehicleType === 'motorcycle';
  const brands = isMotorcycle ? MOTORCYCLE_BRANDS : CAR_BRANDS;
  const bodyTypes = isMotorcycle ? MOTORCYCLE_BODY_TYPES : CAR_BODY_TYPES;

  const motorcycleBodyLabelsAr: Record<string, string> = {
    sport: 'رياضية',
    cruiser: 'كروزر',
    touring: 'سياحية',
    naked: 'نيكد',
    adventure: 'مغامرات',
    scooter: 'سكوتر',
    offroad: 'طرق وعرة',
    dual_sport: 'ثنائية',
    chopper: 'تشopper',
    electric: 'كهربائية',
  };

  const updateFilter = useCallback(
    (patch: Partial<CarSearchFilters>) => {
      onChange(patch);
    },
    [onChange]
  );

  const clearAll = () => {
    onReset();
  };

  const bodyTypeFilters = filters.bodyType
    ? [filters.bodyType as string]
    : [];

  const handleBodyTypeToggle = (value: string, checked: boolean) => {
    if (checked) {
      updateFilter({ bodyType: isMotorcycle ? value : (value as BodyType) });
    } else {
      updateFilter({ bodyType: undefined });
    }
  };

  const countryLabel = (nameEn: string) => {
    const found = COUNTRIES.find((c) => c.nameEn === nameEn);
    return isAr && found ? found.nameAr : nameEn;
  };

  const cityLabel = (city: string) => (isAr ? (CITY_LABELS_AR[city] ?? city) : city);

  return (
    <div className={cn('space-y-1', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">{tr('الفلاتر', 'Filters')}</h3>
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[11px]">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearAll}
          >
            <RotateCcw className="w-3 h-3 me-1" />
            {tr('مسح الكل', 'Clear All')}
          </Button>
        )}
      </div>

      <Separator className="mb-2" />

      <ScrollArea className="h-[calc(100vh-16rem)] max-h-[700px] pe-1">
        <div className="space-y-0.5">
          {/* Brand */}
          <FilterSection title={tr('الماركة', 'Brand')} icon={<Tag className="w-4 h-4" />}>
            <Select
              value={filters.brand || '__all__'}
              onValueChange={(v) =>
                updateFilter({ brand: v === '__all__' ? undefined : v, model: undefined })
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder={tr('كل الماركات', 'All Brands')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{tr('كل الماركات', 'All Brands')}</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Model */}
          <FilterSection title={tr('الموديل', 'Model')} icon={<Car className="w-4 h-4" />}>
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder={
                  filters.brand
                    ? tr(`موديلات ${filters.brand}...`, `${filters.brand} models...`)
                    : tr('اختر الماركة أولاً', 'Select brand first')
                }
                value={filters.model || ''}
                onChange={(e) => updateFilter({ model: e.target.value || undefined })}
                className="h-9 ps-8 text-sm"
                disabled={!filters.brand}
              />
              {filters.model && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute end-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => updateFilter({ model: undefined })}
                  aria-label={tr('مسح الموديل', 'Clear model')}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </FilterSection>

          {/* Year Range */}
          <FilterSection title={tr('السنة', 'Year')} icon={<Calendar className="w-4 h-4" />} defaultOpen={false}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={tr('من', 'Min')}
                min={1990}
                max={2026}
                value={filters.year?.min || ''}
                onChange={(e) =>
                  updateFilter({
                    year: {
                      ...filters.year,
                      min: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                className="h-9 text-sm"
              />
              <span className="text-xs text-muted-foreground flex-shrink-0">{tr('إلى', 'to')}</span>
              <Input
                type="number"
                placeholder={tr('إلى', 'Max')}
                min={1990}
                max={2026}
                value={filters.year?.max || ''}
                onChange={(e) =>
                  updateFilter({
                    year: {
                      ...filters.year,
                      max: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                className="h-9 text-sm"
              />
            </div>
          </FilterSection>

          {/* Condition */}
          <FilterSection title={tr('الحالة', 'Condition')} icon={<Car className="w-4 h-4" />}>
            <RadioGroup
              value={filters.condition || ''}
              onValueChange={(v) =>
                updateFilter({ condition: v ? (v as CarSearchFilters['condition']) : undefined })
              }
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="new" id="cond-new" className="sr-only" />
                <Label
                  htmlFor="cond-new"
                  className={cn(
                    'flex-1 cursor-pointer text-sm rounded-lg border px-3 py-2 text-center transition-all',
                    filters.condition === 'new'
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {tr('جديد', 'New')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="used" id="cond-used" className="sr-only" />
                <Label
                  htmlFor="cond-used"
                  className={cn(
                    'flex-1 cursor-pointer text-sm rounded-lg border px-3 py-2 text-center transition-all',
                    filters.condition === 'used'
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {tr('مستعمل', 'Used')}
                </Label>
              </div>
            </RadioGroup>
          </FilterSection>

          {/* Price Range */}
          <FilterSection
            title={tr('نطاق السعر (دولار)', 'Price Range (USD)')}
            icon={<DollarSign className="w-4 h-4" />}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={tr('من', 'Min')}
                min={0}
                value={filters.price?.min || ''}
                onChange={(e) =>
                  updateFilter({
                    price: {
                      ...filters.price,
                      min: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                className="h-9 text-sm"
              />
              <span className="text-xs text-muted-foreground flex-shrink-0">{tr('إلى', 'to')}</span>
              <Input
                type="number"
                placeholder={tr('إلى', 'Max')}
                min={0}
                value={filters.price?.max || ''}
                onChange={(e) =>
                  updateFilter({
                    price: {
                      ...filters.price,
                      max: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                className="h-9 text-sm"
              />
            </div>
          </FilterSection>

          {/* Fuel Type */}
          <FilterSection title={tr('نوع الوقود', 'Fuel Type')} icon={<Fuel className="w-4 h-4" />} defaultOpen={false}>
            <Select
              value={filters.fuelType || '__all__'}
              onValueChange={(v) =>
                updateFilter({
                  fuelType: v === '__all__' ? undefined : (v as CarSearchFilters['fuelType']),
                })
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder={tr('كل أنواع الوقود', 'All Fuel Types')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{tr('كل أنواع الوقود', 'All Fuel Types')}</SelectItem>
                {FUEL_TYPES.map((ft) => (
                  <SelectItem key={ft.value} value={ft.value}>
                    {isAr ? (FUEL_LABELS_AR[ft.value] ?? ft.label) : ft.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Transmission */}
          <FilterSection
            title={tr('ناقل الحركة', 'Transmission')}
            icon={<Settings2 className="w-4 h-4" />}
            defaultOpen={false}
          >
            <Select
              value={filters.transmission || '__all__'}
              onValueChange={(v) =>
                updateFilter({
                  transmission:
                    v === '__all__' ? undefined : (v as CarSearchFilters['transmission']),
                })
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder={tr('كل ناقلات الحركة', 'All Transmissions')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{tr('كل ناقلات الحركة', 'All Transmissions')}</SelectItem>
                {TRANSMISSION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {isAr ? (TRANSMISSION_LABELS_AR[t.value] ?? t.label) : t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Body Type */}
          <FilterSection
            title={isMotorcycle ? tr('نوع الدراجة', 'Motorcycle Type') : tr('نوع الهيكل', 'Body Type')}
            icon={<Car className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="grid grid-cols-2 gap-2">
              {bodyTypes.map((bt) => (
                <Label
                  key={bt.value}
                  className={cn(
                    'flex items-center gap-2 cursor-pointer text-xs rounded-lg border px-2.5 py-2 transition-all select-none',
                    bodyTypeFilters.includes(bt.value)
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/50 text-muted-foreground'
                  )}
                >
                  <Checkbox
                    checked={bodyTypeFilters.includes(bt.value)}
                    onCheckedChange={(checked) => handleBodyTypeToggle(bt.value, !!checked)}
                    className="sr-only"
                  />
                  {isAr
                    ? (isMotorcycle
                        ? (motorcycleBodyLabelsAr[bt.value] ?? bt.label)
                        : (BODY_TYPE_LABELS_AR[bt.value] ?? bt.label))
                    : bt.label}
                </Label>
              ))}
            </div>
          </FilterSection>

          {/* City */}
          <FilterSection title={tr('المدينة', 'City')} icon={<MapPin className="w-4 h-4" />} defaultOpen={false}>
            <Select
              value={filters.city || '__all__'}
              onValueChange={(v) =>
                updateFilter({ city: v === '__all__' ? undefined : v })
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder={tr('كل المدن', 'All Cities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{tr('كل المدن', 'All Cities')}</SelectItem>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {cityLabel(city)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Country */}
          <FilterSection title={tr('الدولة', 'Country')} icon={<Building className="w-4 h-4" />} defaultOpen={false}>
            <Select
              value={filters.country || '__all__'}
              onValueChange={(v) =>
                updateFilter({ country: v === '__all__' ? undefined : v })
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder={tr('كل الدول', 'All Countries')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{tr('كل الدول', 'All Countries')}</SelectItem>
                {COUNTRY_NAMES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {countryLabel(country)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Mileage Range */}
          <FilterSection title={tr('المسافة المقطوعة', 'Mileage')} icon={<Gauge className="w-4 h-4" />} defaultOpen={false}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={tr('من كم', 'Min km')}
                min={0}
                value={filters.mileage?.min || ''}
                onChange={(e) =>
                  updateFilter({
                    mileage: {
                      ...filters.mileage,
                      min: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                className="h-9 text-sm"
              />
              <span className="text-xs text-muted-foreground flex-shrink-0">{tr('إلى', 'to')}</span>
              <Input
                type="number"
                placeholder={tr('إلى كم', 'Max km')}
                min={0}
                value={filters.mileage?.max || ''}
                onChange={(e) =>
                  updateFilter({
                    mileage: {
                      ...filters.mileage,
                      max: e.target.value ? parseInt(e.target.value) : undefined,
                    },
                  })
                }
                className="h-9 text-sm"
              />
            </div>
          </FilterSection>

          {/* Available for Rent — cars only */}
          {!isMotorcycle && (
          <FilterSection
            title={tr('التأجير', 'Rental')}
            icon={<Building className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="flex items-center justify-between">
              <Label
                htmlFor="rent-toggle"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {tr('متاح للتأجير', 'Available for Rent')}
              </Label>
              <Switch
                id="rent-toggle"
                checked={!!filters.isAvailableForRent}
                onCheckedChange={(checked) =>
                  updateFilter({ isAvailableForRent: checked || undefined })
                }
              />
            </div>
          </FilterSection>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
