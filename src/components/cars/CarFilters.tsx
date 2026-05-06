'use client';

import { useCallback } from 'react';
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
  FUEL_TYPES,
  TRANSMISSION_TYPES,
} from '@/lib/constants';
import type { CarSearchFilters } from '@/types';
import { BodyType } from '@/types';

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
  'Cairo',
  'Alexandria',
  'Giza',
  'Shubra El Kheima',
  'Port Said',
  'Suez',
  'Luxor',
  'Aswan',
  'Mansoura',
  'Tanta',
  'Ismailia',
  'Faiyum',
  'Zagazig',
  'Damietta',
  'Minya',
  'Beni Suef',
  'Sohag',
  'Qena',
  'Hurghada',
  'Sharm El Sheikh',
] as const;

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

import React from 'react';

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
  const activeCount = getActiveFilterCount(filters);

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
    ? [filters.bodyType]
    : [];

  const handleBodyTypeToggle = (value: string, checked: boolean) => {
    if (checked) {
      updateFilter({ bodyType: value as BodyType });
    } else {
      updateFilter({ bodyType: undefined });
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
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
            <RotateCcw className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <Separator className="mb-2" />

      <ScrollArea className="h-[calc(100vh-16rem)] max-h-[700px] pr-1">
        <div className="space-y-0.5">
          {/* Brand */}
          <FilterSection title="Brand" icon={<Tag className="w-4 h-4" />}>
            <Select
              value={filters.brand || '__all__'}
              onValueChange={(v) =>
                updateFilter({ brand: v === '__all__' ? undefined : v, model: undefined })
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Brands</SelectItem>
                {CAR_BRANDS.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Model */}
          <FilterSection title="Model" icon={<Car className="w-4 h-4" />}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder={filters.brand ? `${filters.brand} models...` : 'Select brand first'}
                value={filters.model || ''}
                onChange={(e) => updateFilter({ model: e.target.value || undefined })}
                className="h-9 pl-8 text-sm"
                disabled={!filters.brand}
              />
              {filters.model && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => updateFilter({ model: undefined })}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </FilterSection>

          {/* Year Range */}
          <FilterSection title="Year" icon={<Calendar className="w-4 h-4" />} defaultOpen={false}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
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
              <span className="text-xs text-muted-foreground flex-shrink-0">to</span>
              <Input
                type="number"
                placeholder="Max"
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
          <FilterSection title="Condition" icon={<Car className="w-4 h-4" />}>
            <RadioGroup
              value={filters.condition || ''}
              onValueChange={(v) =>
                updateFilter({ condition: v ? (v as CarSearchFilters['condition']) : undefined })
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
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
                  New
                </Label>
              </div>
              <div className="flex items-center space-x-2">
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
                  Used
                </Label>
              </div>
            </RadioGroup>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range (EGP)" icon={<DollarSign className="w-4 h-4" />}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
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
              <span className="text-xs text-muted-foreground flex-shrink-0">to</span>
              <Input
                type="number"
                placeholder="Max"
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
          <FilterSection title="Fuel Type" icon={<Fuel className="w-4 h-4" />} defaultOpen={false}>
            <Select
              value={filters.fuelType || '__all__'}
              onValueChange={(v) =>
                updateFilter({
                  fuelType: v === '__all__' ? undefined : (v as CarSearchFilters['fuelType']),
                })
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="All Fuel Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Fuel Types</SelectItem>
                {FUEL_TYPES.map((ft) => (
                  <SelectItem key={ft.value} value={ft.value}>
                    {ft.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Transmission */}
          <FilterSection
            title="Transmission"
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
                <SelectValue placeholder="All Transmissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Transmissions</SelectItem>
                {TRANSMISSION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Body Type */}
          <FilterSection title="Body Type" icon={<Car className="w-4 h-4" />} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-2">
              {CAR_BODY_TYPES.map((bt) => (
                <Label
                  key={bt.value}
                  className={cn(
                    'flex items-center gap-2 cursor-pointer text-xs rounded-lg border px-2.5 py-2 transition-all select-none',
                    bodyTypeFilters.includes(bt.value as BodyType)
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/50 text-muted-foreground'
                  )}
                >
                  <Checkbox
                    checked={bodyTypeFilters.includes(bt.value as BodyType)}
                    onCheckedChange={(checked) => handleBodyTypeToggle(bt.value, !!checked)}
                    className="sr-only"
                  />
                  {bt.label}
                </Label>
              ))}
            </div>
          </FilterSection>

          {/* City */}
          <FilterSection title="City" icon={<MapPin className="w-4 h-4" />} defaultOpen={false}>
            <Select
              value={filters.city || '__all__'}
              onValueChange={(v) =>
                updateFilter({ city: v === '__all__' ? undefined : v })
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Cities</SelectItem>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Mileage Range */}
          <FilterSection title="Mileage" icon={<Gauge className="w-4 h-4" />} defaultOpen={false}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min km"
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
              <span className="text-xs text-muted-foreground flex-shrink-0">to</span>
              <Input
                type="number"
                placeholder="Max km"
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

          {/* Available for Rent */}
          <FilterSection
            title="Rental"
            icon={<Building className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="flex items-center justify-between">
              <Label
                htmlFor="rent-toggle"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Available for Rent
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
        </div>
      </ScrollArea>
    </div>
  );
}
