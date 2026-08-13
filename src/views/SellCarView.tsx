'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Bike,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  X,
  Star,
  Upload,
  DollarSign,
  Settings2,
  Loader2,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import {
  CAR_BRANDS,
  CAR_BODY_TYPES,
  MOTORCYCLE_BRANDS,
  MOTORCYCLE_BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  DRIVETRAIN_TYPES,
  CAR_COLORS,
  CURRENCY,
  UPLOAD_LIMITS,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

type TrFn = (ar: string, en: string) => string;

// ============ Schema ============

function createSellCarSchema(tr: TrFn) {
  return z.object({
    // Step 1: Basic Info
    title: z
      .string()
      .min(3, tr('يجب ألا يقل العنوان عن 3 أحرف', 'Title must be at least 3 characters'))
      .max(100, tr('العنوان طويل جدًا', 'Title too long')),
    brand: z.string().min(1, tr('اختر علامة تجارية', 'Select a brand')),
    model: z.string().min(1, tr('أدخل الطراز', 'Enter a model')),
    year: z.number().min(2000).max(2025),
    condition: z.enum(['new', 'used']),
    vehicleType: z.enum(['car', 'motorcycle']).default('car'),
    mileage: z.number().optional(),
    description: z.string().optional(),

    // Step 2: Specifications
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    engineSize: z.string().optional(),
    horsepower: z.number().optional(),
    drivetrain: z.string().optional(),
    bodyType: z.string().optional(),
    doors: z.number().optional(),
    seats: z.number().optional(),
    exteriorColor: z.string().optional(),
    interiorColor: z.string().optional(),

    // Step 3: Pricing & Location
    price: z.number().min(1, tr('يجب ألا يقل السعر عن 1', 'Price must be at least 1')),
    isNegotiable: z.boolean(),
    city: z.string().min(1, tr('المدينة مطلوبة', 'City is required')),
    address: z.string().optional(),

    // Step 4: Images (handled separately)
    images: z
      .array(z.object({ url: z.string(), alt: z.string().optional(), isPrimary: z.boolean() }))
      .optional(),

    // Step 5: Rental Options
    isAvailableForRent: z.boolean(),
    rentalPriceDaily: z.number().optional(),
    rentalPriceWeekly: z.number().optional(),
    rentalPriceMonthly: z.number().optional(),
  });
}

type SellCarFormData = z.infer<ReturnType<typeof createSellCarSchema>>;

// ============ Steps ============

function getSteps(tr: TrFn, isMotorcycle: boolean) {
  const steps = [
    { id: 1, title: tr('المعلومات الأساسية', 'Basic Info'), icon: isMotorcycle ? Bike : Car },
    { id: 2, title: tr('المواصفات', 'Specifications'), icon: Settings2 },
    { id: 3, title: tr('السعر والموقع', 'Pricing & Location'), icon: DollarSign },
    { id: 4, title: tr('الصور', 'Images'), icon: ImagePlus },
    { id: 5, title: tr('خيارات الإيجار', 'Rental Options'), icon: Star },
  ];
  return isMotorcycle ? steps.filter((s) => s.id !== 5) : steps;
}

// ============ Cities ============

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
];

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

const COLOR_LABELS_AR: Record<string, string> = {
  White: 'أبيض',
  Black: 'أسود',
  Silver: 'فضي',
  Gray: 'رمادي',
  Red: 'أحمر',
  Blue: 'أزرق',
  Brown: 'بني',
  Beige: 'بيج',
  Green: 'أخضر',
  Gold: 'ذهبي',
  Orange: 'برتقالي',
  Yellow: 'أصفر',
  Purple: 'بنفسجي',
  Bronze: 'برونزي',
  Maroon: 'كستنائي',
  Navy: 'كحلي',
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

const DRIVETRAIN_LABELS_AR: Record<string, string> = {
  fwd: 'دفع أمامي (FWD)',
  rwd: 'دفع خلفي (RWD)',
  awd: 'دفع رباعي مستمر (AWD)',
  '4wd': 'دفع رباعي (4WD)',
};

const BODY_LABELS_AR: Record<string, string> = {
  sedan: 'سيدان',
  suv: 'SUV',
  coupe: 'كوبيه',
  truck: 'شاحنة',
  van: 'فان / ميني فان',
  convertible: 'مكشوفة',
  hatchback: 'هاتشباك',
  wagon: 'ستيشن / واجن',
};

// ============ Stepper ============

function StepStepper({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: ReturnType<typeof getSteps>;
}) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              animate={{
                scale: isCurrent ? 1.05 : 1,
              }}
              className={cn(
                'flex flex-col items-center gap-1.5',
                idx < steps.length - 1 && 'pe-2 md:pe-4'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-primary/10 text-primary',
                  !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span
                className={cn(
                  'hidden text-xs font-medium md:block',
                  isCurrent && 'text-primary',
                  isCompleted && 'text-primary',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
            </motion.div>

            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'mb-6 h-0.5 w-8 md:w-16',
                  currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============ Step 1: Basic Info ============

function StepBasicInfo({
  form,
  errors,
  tr,
  isMotorcycle,
}: {
  form: ReturnType<typeof useForm<SellCarFormData>>;
  errors: ReturnType<typeof useForm<SellCarFormData>>['formState']['errors'];
  tr: TrFn;
  isMotorcycle: boolean;
}) {
  const brands = isMotorcycle ? MOTORCYCLE_BRANDS : CAR_BRANDS;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Title */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">{tr('العنوان *', 'Title *')}</Label>
          <Input
            id="title"
            placeholder={
              isMotorcycle
                ? tr('مثال: ياماها R1 موديل 2023', 'e.g., 2023 Yamaha R1')
                : tr('مثال: بي إم دبليو 330i M Sport موديل 2023', 'e.g., 2023 BMW 330i M Sport')
            }
            {...form.register('title')}
            className={cn(errors.title && 'border-destructive')}
          />
          {errors.title?.message && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <Label htmlFor="brand">{tr('العلامة التجارية *', 'Brand *')}</Label>
          <Select
            value={form.watch('brand')}
            onValueChange={(v) => form.setValue('brand', v, { shouldValidate: true })}
          >
            <SelectTrigger className={cn(errors.brand && 'border-destructive')}>
              <SelectValue placeholder={tr('اختر العلامة', 'Select brand')} />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.brand?.message && (
            <p className="text-xs text-destructive">{errors.brand.message}</p>
          )}
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">{tr('الطراز *', 'Model *')}</Label>
          <Input
            id="model"
            placeholder={tr('مثال: 330i', 'e.g., 330i')}
            {...form.register('model')}
            className={cn(errors.model && 'border-destructive')}
          />
          {errors.model?.message && (
            <p className="text-xs text-destructive">{errors.model.message}</p>
          )}
        </div>

        {/* Year */}
        <div className="space-y-2">
          <Label htmlFor="year">{tr('سنة الصنع *', 'Year *')}</Label>
          <Input
            id="year"
            type="number"
            placeholder="2024"
            min={2000}
            max={2025}
            {...form.register('year', { valueAsNumber: true })}
            className={cn(errors.year && 'border-destructive')}
          />
          {errors.year?.message && (
            <p className="text-xs text-destructive">{errors.year.message}</p>
          )}
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label>{tr('الحالة *', 'Condition *')}</Label>
          <Select
            value={form.watch('condition')}
            onValueChange={(v) =>
              form.setValue('condition', v as 'new' | 'used', { shouldValidate: true })
            }
          >
            <SelectTrigger className={cn(errors.condition && 'border-destructive')}>
              <SelectValue placeholder={tr('اختر الحالة', 'Select condition')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">{tr('جديدة', 'New')}</SelectItem>
              <SelectItem value="used">{tr('مستعملة', 'Used')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.condition?.message && (
            <p className="text-xs text-destructive">{errors.condition.message}</p>
          )}
        </div>

        {/* Mileage (conditional) */}
        {form.watch('condition') === 'used' && (
          <div className="space-y-2">
            <Label htmlFor="mileage">{tr('المسافة المقطوعة (كم)', 'Mileage (km)')}</Label>
            <Input
              id="mileage"
              type="number"
              placeholder="50000"
              min={0}
              {...form.register('mileage', { valueAsNumber: true })}
            />
          </div>
        )}

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">{tr('الوصف', 'Description')}</Label>
          <Textarea
            id="description"
            placeholder={
              isMotorcycle
                ? tr('صف مميزات دراجتك وتاريخها وحالتها...', "Describe your motorcycle's features, history, and condition...")
                : tr(
                    'صف مميزات سيارتك وتاريخها وحالتها وأي إضافات...',
                    "Describe your car's features, history, condition, and any extras..."
                  )
            }
            rows={5}
            {...form.register('description')}
          />
          <p className="text-xs text-muted-foreground">
            {tr('الوصف التفصيلي يساعد على البيع بشكل أسرع', 'A detailed description helps sell faster')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ Step 2: Specifications ============

function StepSpecifications({
  form,
  tr,
  isAr,
  isMotorcycle,
}: {
  form: ReturnType<typeof useForm<SellCarFormData>>;
  tr: TrFn;
  isAr: boolean;
  isMotorcycle: boolean;
}) {
  const bodyTypes = isMotorcycle ? MOTORCYCLE_BODY_TYPES : CAR_BODY_TYPES;
  const bodyLabelsAr = isMotorcycle
    ? {
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
      }
    : BODY_LABELS_AR;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Fuel Type */}
        <div className="space-y-2">
          <Label>{tr('نوع الوقود', 'Fuel Type')}</Label>
          <Select
            value={form.watch('fuelType') || ''}
            onValueChange={(v) => form.setValue('fuelType', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={tr('اختر', 'Select')} />
            </SelectTrigger>
            <SelectContent>
              {FUEL_TYPES.map((ft) => (
                <SelectItem key={ft.value} value={ft.value}>
                  {isAr ? FUEL_LABELS_AR[ft.value] || ft.label : ft.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div className="space-y-2">
          <Label>{tr('ناقل الحركة', 'Transmission')}</Label>
          <Select
            value={form.watch('transmission') || ''}
            onValueChange={(v) => form.setValue('transmission', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={tr('اختر', 'Select')} />
            </SelectTrigger>
            <SelectContent>
              {TRANSMISSION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {isAr ? TRANSMISSION_LABELS_AR[t.value] || t.label : t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Engine Size */}
        <div className="space-y-2">
          <Label htmlFor="engineSize">
            {isMotorcycle ? tr('سعة المحرك', 'Engine Capacity') : tr('حجم المحرك', 'Engine Size')}
          </Label>
          <Input
            id="engineSize"
            placeholder={isMotorcycle ? tr('مثال: 600cc', 'e.g., 600cc') : tr('مثال: 2.0 لتر', 'e.g., 2.0L')}
            {...form.register('engineSize')}
          />
        </div>

        {/* Horsepower */}
        <div className="space-y-2">
          <Label htmlFor="horsepower">{tr('القدرة الحصانية', 'Horsepower')}</Label>
          <Input
            id="horsepower"
            type="number"
            placeholder={tr('مثال: 258', 'e.g., 258')}
            min={0}
            {...form.register('horsepower', { valueAsNumber: true })}
          />
        </div>

        {/* Drivetrain — cars only */}
        {!isMotorcycle && (
          <div className="space-y-2">
            <Label>{tr('نظام الدفع', 'Drivetrain')}</Label>
            <Select
              value={form.watch('drivetrain') || ''}
              onValueChange={(v) => form.setValue('drivetrain', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={tr('اختر', 'Select')} />
              </SelectTrigger>
              <SelectContent>
                {DRIVETRAIN_TYPES.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>
                    {isAr ? DRIVETRAIN_LABELS_AR[dt.value] || dt.label : dt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Body Type */}
        <div className="space-y-2">
          <Label>{isMotorcycle ? tr('نوع الدراجة', 'Motorcycle Type') : tr('نوع الهيكل', 'Body Type')}</Label>
          <Select
            value={form.watch('bodyType') || ''}
            onValueChange={(v) => form.setValue('bodyType', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={tr('اختر', 'Select')} />
            </SelectTrigger>
            <SelectContent>
              {bodyTypes.map((bt) => (
                <SelectItem key={bt.value} value={bt.value}>
                  {isAr ? bodyLabelsAr[bt.value as keyof typeof bodyLabelsAr] || bt.label : bt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doors — cars only */}
        {!isMotorcycle && (
          <div className="space-y-2">
            <Label htmlFor="doors">{tr('الأبواب', 'Doors')}</Label>
            <Input
              id="doors"
              type="number"
              placeholder="4"
              min={1}
              max={6}
              {...form.register('doors', { valueAsNumber: true })}
            />
          </div>
        )}

        {/* Seats — cars only */}
        {!isMotorcycle && (
          <div className="space-y-2">
            <Label htmlFor="seats">{tr('المقاعد', 'Seats')}</Label>
            <Input
              id="seats"
            type="number"
            placeholder="5"
            min={1}
            max={9}
            {...form.register('seats', { valueAsNumber: true })}
          />
          </div>
        )}

        {/* Exterior Color */}
        <div className="space-y-2">
          <Label>{tr('اللون الخارجي', 'Exterior Color')}</Label>
          <Select
            value={form.watch('exteriorColor') || ''}
            onValueChange={(v) => form.setValue('exteriorColor', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={tr('اختر', 'Select')} />
            </SelectTrigger>
            <SelectContent>
              {CAR_COLORS.map((c) => (
                <SelectItem key={c} value={c}>
                  {isAr ? COLOR_LABELS_AR[c] || c : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Interior Color — cars only */}
        {!isMotorcycle && (
        <div className="space-y-2">
          <Label>{tr('اللون الداخلي', 'Interior Color')}</Label>
          <Select
            value={form.watch('interiorColor') || ''}
            onValueChange={(v) => form.setValue('interiorColor', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={tr('اختر', 'Select')} />
            </SelectTrigger>
            <SelectContent>
              {CAR_COLORS.map((c) => (
                <SelectItem key={c} value={c}>
                  {isAr ? COLOR_LABELS_AR[c] || c : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        )}
      </div>
    </div>
  );
}

// ============ Step 3: Pricing & Location ============

function StepPricingLocation({
  form,
  errors,
  tr,
  isAr,
}: {
  form: ReturnType<typeof useForm<SellCarFormData>>;
  errors: ReturnType<typeof useForm<SellCarFormData>>['formState']['errors'];
  tr: TrFn;
  isAr: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">
            {tr(`السعر (${CURRENCY.symbol}) *`, `Price (${CURRENCY.symbol}) *`)}
          </Label>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {CURRENCY.symbol}
            </span>
            <Input
              id="price"
              type="number"
              placeholder="0"
              min={1}
              className={cn('ps-8', errors.price && 'border-destructive')}
              {...form.register('price', { valueAsNumber: true })}
            />
          </div>
          {errors.price?.message && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        {/* Negotiable */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label>{tr('السعر قابل للتفاوض', 'Price Negotiable')}</Label>
            <p className="text-xs text-muted-foreground">
              {tr('السماح للمشترين بتقديم عروض', 'Allow buyers to make offers')}
            </p>
          </div>
          <Switch
            checked={form.watch('isNegotiable')}
            onCheckedChange={(v) => form.setValue('isNegotiable', v)}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label>{tr('المدينة *', 'City *')}</Label>
          <Select
            value={form.watch('city')}
            onValueChange={(v) => form.setValue('city', v, { shouldValidate: true })}
          >
            <SelectTrigger className={cn(errors.city && 'border-destructive')}>
              <SelectValue placeholder={tr('اختر المدينة', 'Select city')} />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {isAr ? CITY_LABELS_AR[city] || city : city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city?.message && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">{tr('العنوان', 'Address')}</Label>
          <Input
            id="address"
            placeholder={tr('عنوان الشارع أو المنطقة', 'Street address or area')}
            {...form.register('address')}
          />
        </div>
      </div>
    </div>
  );
}

// ============ Step 4: Images ============

function StepImages({
  images,
  setImages,
  tr,
}: {
  images: { url: string; alt?: string; isPrimary: boolean }[];
  setImages: (imgs: { url: string; alt?: string; isPrimary: boolean }[]) => void;
  tr: TrFn;
}) {
  const handleSetPrimary = useCallback(
    (idx: number) => {
      setImages(
        images.map((img, i) => ({
          ...img,
          isPrimary: i === idx,
        }))
      );
    },
    [images, setImages]
  );

  const handleRemove = useCallback(
    (idx: number) => {
      setImages(images.filter((_, i) => i !== idx));
    },
    [images, setImages]
  );

  const handleAddPlaceholder = useCallback(() => {
    if (images.length >= UPLOAD_LIMITS.maxCarImages) return;
    const n = images.length + 1;
    const placeholderUrl = `https://placehold.co/800x600/e2e8f0/64748b?text=Car+Image+${n}`;
    setImages([
      ...images,
      {
        url: placeholderUrl,
        alt: tr(`صورة السيارة ${n}`, `Car Image ${n}`),
        isPrimary: images.length === 0,
      },
    ]);
  }, [images, setImages, tr]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={handleAddPlaceholder}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 transition-colors hover:border-primary/50 hover:bg-primary/5"
      >
        <Upload className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">{tr('انقر لإضافة صور', 'Click to add images')}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {tr(
            `حتى ${UPLOAD_LIMITS.maxCarImages} صور · بحد أقصى ${UPLOAD_LIMITS.maxImageSizeMB} ميجابايت لكل صورة`,
            `Up to ${UPLOAD_LIMITS.maxCarImages} images · Max ${UPLOAD_LIMITS.maxImageSizeMB}MB each`
          )}
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP, AVIF</p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <AnimatePresence>
            {images.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  'group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted',
                  img.isPrimary ? 'border-primary' : 'border-transparent'
                )}
              >
                <img
                  src={img.url}
                  alt={img.alt || tr(`صورة ${idx + 1}`, `Image ${idx + 1}`)}
                  className="h-full w-full object-cover"
                />

                {/* Primary badge */}
                {img.isPrimary && (
                  <Badge className="absolute start-2 top-2 bg-primary text-primary-foreground text-[10px]">
                    {tr('رئيسية', 'Primary')}
                  </Badge>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {!img.isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(idx);
                      }}
                    >
                      <Star className="me-1 h-3 w-3" />
                      {tr('رئيسية', 'Primary')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                  >
                    <X className="me-1 h-3 w-3" />
                    {tr('إزالة', 'Remove')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {images.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {tr(
            'أضف صورة واحدة على الأقل. ستُعيَّن الصورة الأولى كصورة رئيسية.',
            'Add at least one image. The first image will be set as primary.'
          )}
        </p>
      )}
    </div>
  );
}

// ============ Step 5: Rental Options ============

function StepRentalOptions({
  form,
  tr,
}: {
  form: ReturnType<typeof useForm<SellCarFormData>>;
  tr: TrFn;
}) {
  const isRentEnabled = form.watch('isAvailableForRent');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label className="text-base font-semibold">
            {tr('متاحة للإيجار', 'Available for Rent')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {tr(
              'السماح للمستخدمين باستئجار هذه السيارة يوميًا أو أسبوعيًا أو شهريًا',
              'Allow users to rent this car on a daily/weekly/monthly basis'
            )}
          </p>
        </div>
        <Switch
          checked={isRentEnabled}
          onCheckedChange={(v) => form.setValue('isAvailableForRent', v)}
        />
      </div>

      <AnimatePresence>
        {isRentEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Daily */}
              <div className="space-y-2">
                <Label htmlFor="rentalPriceDaily">
                  {tr(`السعر اليومي (${CURRENCY.symbol})`, `Daily Price (${CURRENCY.symbol})`)}
                </Label>
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {CURRENCY.symbol}
                  </span>
                  <Input
                    id="rentalPriceDaily"
                    type="number"
                    placeholder="0"
                    min={1}
                    className="ps-8"
                    {...form.register('rentalPriceDaily', { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Weekly */}
              <div className="space-y-2">
                <Label htmlFor="rentalPriceWeekly">
                  {tr(`السعر الأسبوعي (${CURRENCY.symbol})`, `Weekly Price (${CURRENCY.symbol})`)}
                </Label>
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {CURRENCY.symbol}
                  </span>
                  <Input
                    id="rentalPriceWeekly"
                    type="number"
                    placeholder="0"
                    min={1}
                    className="ps-8"
                    {...form.register('rentalPriceWeekly', { valueAsNumber: true })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {tr('خصم اختياري للإيجار الأسبوعي', 'Optional discount for weekly')}
                </p>
              </div>

              {/* Monthly */}
              <div className="space-y-2">
                <Label htmlFor="rentalPriceMonthly">
                  {tr(`السعر الشهري (${CURRENCY.symbol})`, `Monthly Price (${CURRENCY.symbol})`)}
                </Label>
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {CURRENCY.symbol}
                  </span>
                  <Input
                    id="rentalPriceMonthly"
                    type="number"
                    placeholder="0"
                    min={1}
                    className="ps-8"
                    {...form.register('rentalPriceMonthly', { valueAsNumber: true })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {tr('خصم اختياري للإيجار الشهري', 'Optional discount for monthly')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ Success State ============

function SuccessState({
  onGoToDetail,
  tr,
  isRTL,
}: {
  carId: string;
  onGoToDetail: () => void;
  tr: TrFn;
  isRTL: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-[60vh] items-center justify-center"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
          >
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold">{tr('تم إرسال الإعلان!', 'Listing Submitted!')}</h2>
          <p className="mt-2 text-muted-foreground">
            {tr(
              'تم إرسال إعلان سيارتك للمراجعة. سيظهر للجمهور بعد موافقة فريقنا.',
              'Your car listing has been submitted for review. It will be live once approved by our team.'
            )}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={onGoToDetail} className="w-full gap-2">
              {tr('عرض الإعلان', 'View Listing')}
              <ArrowRight className={cn('h-4 w-4', isRTL && 'rotate-180')} />
            </Button>
            <Button variant="outline" onClick={() => onGoToDetail()} className="w-full">
              {tr('الذهاب إلى إعلاناتي', 'Go to My Listings')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============ Main Component ============

export default function SellCarView() {
  const { setView, viewParams } = useAppStore();
  const { locale, isRTL } = useTranslation();
  const isAr = locale === 'ar';
  const tr = useCallback((ar: string, en: string) => (isAr ? ar : en), [isAr]);

  const isMotorcycle = viewParams?.vehicleType === 'motorcycle';
  const maxStep = isMotorcycle ? 4 : 5;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdCarId, setCreatedCarId] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; alt?: string; isPrimary: boolean }[]>([]);

  const sellCarSchema = useMemo(() => createSellCarSchema(tr), [tr]);
  const steps = useMemo(() => getSteps(tr, isMotorcycle), [tr, isMotorcycle]);

  const form = useForm<SellCarFormData>({
    resolver: (values, context, options) =>
      zodResolver(sellCarSchema)(values, context, options),
    defaultValues: {
      title: '',
      brand: '',
      model: '',
      year: 2024,
      condition: 'used',
      vehicleType: isMotorcycle ? 'motorcycle' : 'car',
      mileage: undefined,
      description: '',
      fuelType: '',
      transmission: '',
      engineSize: '',
      horsepower: undefined,
      drivetrain: '',
      bodyType: '',
      doors: undefined,
      seats: undefined,
      exteriorColor: '',
      interiorColor: '',
      price: undefined as unknown as number,
      isNegotiable: true,
      city: '',
      address: '',
      isAvailableForRent: false,
      rentalPriceDaily: undefined,
      rentalPriceWeekly: undefined,
      rentalPriceMonthly: undefined,
    },
    mode: 'onChange',
  });

  const { errors, trigger } = form.formState;

  // ============ Validate Current Step ============

  const validateStep = useCallback(async (): Promise<boolean> => {
    switch (currentStep) {
      case 1: {
        const valid = await trigger(['title', 'brand', 'model', 'year', 'condition']);
        return valid;
      }
      case 2:
        return true; // Specs are optional
      case 3: {
        const valid = await trigger(['price', 'city']);
        return valid;
      }
      case 4:
        return true; // Images are optional
      case 5:
        return true; // Rental is optional
      default:
        return true;
    }
  }, [currentStep, trigger]);

  // ============ Next Step ============

  const handleNext = useCallback(async () => {
    const valid = await validateStep();
    if (valid) {
      setCurrentStep((s) => Math.min(s + 1, maxStep));
    }
  }, [validateStep, maxStep]);

  // ============ Previous Step ============

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  // ============ Submit ============

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const values = form.getValues();
      const body = {
        ...values,
        vehicleType: isMotorcycle ? 'motorcycle' : 'car',
        isAvailableForRent: isMotorcycle ? false : values.isAvailableForRent,
        images: images.length > 0 ? images : undefined,
        // Clean undefined values
        mileage: values.mileage || undefined,
        horsepower: values.horsepower || undefined,
        doors: values.doors || undefined,
        seats: values.seats || undefined,
        rentalPriceDaily: values.isAvailableForRent ? values.rentalPriceDaily : undefined,
        rentalPriceWeekly: values.isAvailableForRent ? values.rentalPriceWeekly : undefined,
        rentalPriceMonthly: values.isAvailableForRent ? values.rentalPriceMonthly : undefined,
      };

      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success && data.data?.id) {
        setCreatedCarId(data.data.id);
      } else {
        setSubmitError(data.error || tr('فشل إنشاء الإعلان', 'Failed to create listing'));
      }
    } catch {
      setSubmitError(tr('حدث خطأ ما. يرجى المحاولة مرة أخرى.', 'Something went wrong. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }, [form, images, tr, isMotorcycle]);

  // ============ Success State ============

  if (createdCarId) {
    return (
      <SuccessState
        carId={createdCarId}
        onGoToDetail={() => setView('detail', { carId: createdCarId })}
        tr={tr}
        isRTL={isRTL}
      />
    );
  }

  // ============ Render ============

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold md:text-3xl">
          {tr(isMotorcycle ? 'بع دراجتك' : 'بع سيارتك', isMotorcycle ? 'Sell Your Motorcycle' : 'Sell Your Car')}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {tr(
            isMotorcycle
              ? `املأ التفاصيل لنشر دراجتك على ${process.env.NEXT_PUBLIC_PLATFORM_NAME || 'CIAR Cars'}`
              : `املأ التفاصيل لنشر سيارتك على ${process.env.NEXT_PUBLIC_PLATFORM_NAME || 'CIAR Cars'}`,
            isMotorcycle
              ? `Fill in the details to list your motorcycle on ${process.env.NEXT_PUBLIC_PLATFORM_NAME || 'CIAR Cars'}`
              : `Fill in the details to list your car on ${process.env.NEXT_PUBLIC_PLATFORM_NAME || 'CIAR Cars'}`
          )}
        </p>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <StepStepper currentStep={currentStep} steps={steps} />
      </motion.div>

      {/* Form Card */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{steps[currentStep - 1]?.title}</CardTitle>
            <CardDescription>
              {tr(`الخطوة ${currentStep} من ${steps.length}`, `Step ${currentStep} of ${steps.length}`)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step Content */}
            {currentStep === 1 && (
              <StepBasicInfo form={form} errors={errors} tr={tr} isMotorcycle={isMotorcycle} />
            )}
            {currentStep === 2 && (
              <StepSpecifications form={form} tr={tr} isAr={isAr} isMotorcycle={isMotorcycle} />
            )}
            {currentStep === 3 && (
              <StepPricingLocation form={form} errors={errors} tr={tr} isAr={isAr} />
            )}
            {currentStep === 4 && <StepImages images={images} setImages={setImages} tr={tr} />}
            {!isMotorcycle && currentStep === 5 && <StepRentalOptions form={form} tr={tr} />}

            {/* Error */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {submitError}
                </motion.div>
              )}
            </AnimatePresence>

            <Separator />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className={cn('h-4 w-4', isRTL && 'rotate-180')} />
                {tr('السابق', 'Previous')}
              </Button>

              {currentStep < maxStep ? (
                <Button onClick={handleNext} className="gap-2">
                  {tr('التالي', 'Next')}
                  <ChevronRight className={cn('h-4 w-4', isRTL && 'rotate-180')} />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {tr('جارٍ الإرسال...', 'Submitting...')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      {tr('إرسال الإعلان', 'Submit Listing')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
