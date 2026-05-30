'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  X,
  Star,
  Upload,
  DollarSign,
  Settings2,
  MapPin,
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
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  DRIVETRAIN_TYPES,
  CAR_COLORS,
  CURRENCY,
  UPLOAD_LIMITS,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { CarCondition, FuelType, TransmissionType, DrivetrainType, BodyType } from '@/types';

// ============ Schema ============

const sellCarSchema = z.object({
  // Step 1: Basic Info
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  brand: z.string().min(1, 'Select a brand'),
  model: z.string().min(1, 'Enter a model'),
  year: z.number().min(2000).max(2025),
  condition: z.enum(['new', 'used']),
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
  price: z.number().min(1, 'Price must be at least 1'),
  isNegotiable: z.boolean(),
  city: z.string().min(1, 'City is required'),
  address: z.string().optional(),

  // Step 4: Images (handled separately)
  images: z.array(z.object({ url: z.string(), alt: z.string().optional(), isPrimary: z.boolean() })).optional(),

  // Step 5: Rental Options
  isAvailableForRent: z.boolean(),
  rentalPriceDaily: z.number().optional(),
  rentalPriceWeekly: z.number().optional(),
  rentalPriceMonthly: z.number().optional(),
});

type SellCarFormData = z.infer<typeof sellCarSchema>;

// ============ Steps ============

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Car },
  { id: 2, title: 'Specifications', icon: Settings2 },
  { id: 3, title: 'Pricing & Location', icon: DollarSign },
  { id: 4, title: 'Images', icon: ImagePlus },
  { id: 5, title: 'Rental Options', icon: Star },
];

// ============ Cities ============

const CITIES = [
  'Dubai', 'London', 'Tokyo', 'New York', 'Paris', 'Berlin', 'Sydney', 'Toronto', 'Singapore', 'Mumbai', 'São Paulo', 'Seoul', 'Los Angeles', 'Zurich', 'Madrid', 'Milan', 'Amsterdam', 'Bangkok', 'Istanbul', 'Barcelona',
];

// ============ Stepper ============

function StepStepper({ currentStep, steps }: { currentStep: number; steps: typeof STEPS }) {
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
                idx < steps.length - 1 && 'pr-2 md:pr-4'
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
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
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
}: {
  form: ReturnType<typeof useForm<SellCarFormData>>;
  errors: Record<string, string | undefined>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Title */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., 2023 BMW 330i M Sport"
            {...form.register('title')}
            className={cn(errors.title && 'border-destructive')}
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <Label htmlFor="brand">Brand *</Label>
          <Select
            value={form.watch('brand')}
            onValueChange={(v) => form.setValue('brand', v, { shouldValidate: true })}
          >
            <SelectTrigger className={cn(errors.brand && 'border-destructive')}>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {CAR_BRANDS.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            placeholder="e.g., 330i"
            {...form.register('model')}
            className={cn(errors.model && 'border-destructive')}
          />
          {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
        </div>

        {/* Year */}
        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            placeholder="2024"
            min={2000}
            max={2025}
            {...form.register('year', { valueAsNumber: true })}
            className={cn(errors.year && 'border-destructive')}
          />
          {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label>Condition *</Label>
          <Select
            value={form.watch('condition')}
            onValueChange={(v) => form.setValue('condition', v as 'new' | 'used', { shouldValidate: true })}
          >
            <SelectTrigger className={cn(errors.condition && 'border-destructive')}>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
            </SelectContent>
          </Select>
          {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
        </div>

        {/* Mileage (conditional) */}
        {form.watch('condition') === 'used' && (
          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage (km)</Label>
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your car's features, history, condition, and any extras..."
            rows={5}
            {...form.register('description')}
          />
          <p className="text-xs text-muted-foreground">
            A detailed description helps sell faster
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ Step 2: Specifications ============

function StepSpecifications({
  form,
}: {
  form: ReturnType<typeof useForm<SellCarFormData>>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Fuel Type */}
        <div className="space-y-2">
          <Label>Fuel Type</Label>
          <Select
            value={form.watch('fuelType') || ''}
            onValueChange={(v) => form.setValue('fuelType', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {FUEL_TYPES.map((ft) => (
                <SelectItem key={ft.value} value={ft.value}>
                  {ft.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div className="space-y-2">
          <Label>Transmission</Label>
          <Select
            value={form.watch('transmission') || ''}
            onValueChange={(v) => form.setValue('transmission', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {TRANSMISSION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Engine Size */}
        <div className="space-y-2">
          <Label htmlFor="engineSize">Engine Size</Label>
          <Input
            id="engineSize"
            placeholder="e.g., 2.0L"
            {...form.register('engineSize')}
          />
        </div>

        {/* Horsepower */}
        <div className="space-y-2">
          <Label htmlFor="horsepower">Horsepower</Label>
          <Input
            id="horsepower"
            type="number"
            placeholder="e.g., 258"
            min={0}
            {...form.register('horsepower', { valueAsNumber: true })}
          />
        </div>

        {/* Drivetrain */}
        <div className="space-y-2">
          <Label>Drivetrain</Label>
          <Select
            value={form.watch('drivetrain') || ''}
            onValueChange={(v) => form.setValue('drivetrain', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {DRIVETRAIN_TYPES.map((dt) => (
                <SelectItem key={dt.value} value={dt.value}>
                  {dt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Type */}
        <div className="space-y-2">
          <Label>Body Type</Label>
          <Select
            value={form.watch('bodyType') || ''}
            onValueChange={(v) => form.setValue('bodyType', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {CAR_BODY_TYPES.map((bt) => (
                <SelectItem key={bt.value} value={bt.value}>
                  {bt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doors */}
        <div className="space-y-2">
          <Label htmlFor="doors">Doors</Label>
          <Input
            id="doors"
            type="number"
            placeholder="4"
            min={1}
            max={6}
            {...form.register('doors', { valueAsNumber: true })}
          />
        </div>

        {/* Seats */}
        <div className="space-y-2">
          <Label htmlFor="seats">Seats</Label>
          <Input
            id="seats"
            type="number"
            placeholder="5"
            min={1}
            max={9}
            {...form.register('seats', { valueAsNumber: true })}
          />
        </div>

        {/* Exterior Color */}
        <div className="space-y-2">
          <Label>Exterior Color</Label>
          <Select
            value={form.watch('exteriorColor') || ''}
            onValueChange={(v) => form.setValue('exteriorColor', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {CAR_COLORS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Interior Color */}
        <div className="space-y-2">
          <Label>Interior Color</Label>
          <Select
            value={form.watch('interiorColor') || ''}
            onValueChange={(v) => form.setValue('interiorColor', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {CAR_COLORS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ============ Step 3: Pricing & Location ============

function StepPricingLocation({
  form,
  errors,
}: {
  form: ReturnType<typeof useForm<SellCarFormData>>;
  errors: Record<string, string | undefined>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">
            Price ({CURRENCY.symbol}) *
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {CURRENCY.symbol}
            </span>
            <Input
              id="price"
              type="number"
              placeholder="0"
              min={1}
              className={cn('pl-8', errors.price && 'border-destructive')}
              {...form.register('price', { valueAsNumber: true })}
            />
          </div>
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>

        {/* Negotiable */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label>Price Negotiable</Label>
            <p className="text-xs text-muted-foreground">Allow buyers to make offers</p>
          </div>
          <Switch
            checked={form.watch('isNegotiable')}
            onCheckedChange={(v) => form.setValue('isNegotiable', v)}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label>City *</Label>
          <Select
            value={form.watch('city')}
            onValueChange={(v) => form.setValue('city', v, { shouldValidate: true })}
          >
            <SelectTrigger className={cn(errors.city && 'border-destructive')}>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Street address or area"
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
}: {
  images: { url: string; alt?: string; isPrimary: boolean }[];
  setImages: (imgs: { url: string; alt?: string; isPrimary: boolean }[]) => void;
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
    const placeholderUrl = `https://placehold.co/800x600/e2e8f0/64748b?text=Car+Image+${images.length + 1}`;
    setImages([
      ...images,
      { url: placeholderUrl, alt: `Car Image ${images.length + 1}`, isPrimary: images.length === 0 },
    ]);
  }, [images, setImages]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={handleAddPlaceholder}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 transition-colors hover:border-primary/50 hover:bg-primary/5"
      >
        <Upload className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">Click to add images</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Up to {UPLOAD_LIMITS.maxCarImages} images &middot; Max {UPLOAD_LIMITS.maxImageSizeMB}MB each
        </p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP, AVIF
        </p>
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
                  alt={img.alt || `Image ${idx + 1}`}
                  className="h-full w-full object-cover"
                />

                {/* Primary badge */}
                {img.isPrimary && (
                  <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground text-[10px]">
                    Primary
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
                      <Star className="mr-1 h-3 w-3" />
                      Primary
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
                    <X className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {images.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Add at least one image. The first image will be set as primary.
        </p>
      )}
    </div>
  );
}

// ============ Step 5: Rental Options ============

function StepRentalOptions({
  form,
}: {
  form: ReturnType<typeof useForm<SellCarFormData>>;
}) {
  const isRentEnabled = form.watch('isAvailableForRent');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label className="text-base font-semibold">Available for Rent</Label>
          <p className="text-xs text-muted-foreground">
            Allow users to rent this car on a daily/weekly/monthly basis
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
                  Daily Price ({CURRENCY.symbol})
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {CURRENCY.symbol}
                  </span>
                  <Input
                    id="rentalPriceDaily"
                    type="number"
                    placeholder="0"
                    min={1}
                    className="pl-8"
                    {...form.register('rentalPriceDaily', { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Weekly */}
              <div className="space-y-2">
                <Label htmlFor="rentalPriceWeekly">
                  Weekly Price ({CURRENCY.symbol})
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {CURRENCY.symbol}
                  </span>
                  <Input
                    id="rentalPriceWeekly"
                    type="number"
                    placeholder="0"
                    min={1}
                    className="pl-8"
                    {...form.register('rentalPriceWeekly', { valueAsNumber: true })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Optional discount for weekly</p>
              </div>

              {/* Monthly */}
              <div className="space-y-2">
                <Label htmlFor="rentalPriceMonthly">
                  Monthly Price ({CURRENCY.symbol})
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {CURRENCY.symbol}
                  </span>
                  <Input
                    id="rentalPriceMonthly"
                    type="number"
                    placeholder="0"
                    min={1}
                    className="pl-8"
                    {...form.register('rentalPriceMonthly', { valueAsNumber: true })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Optional discount for monthly</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ Success State ============

function SuccessState({ carId, onGoToDetail }: { carId: string; onGoToDetail: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-[60vh] items-center justify-center"
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
          <h2 className="text-2xl font-bold">Listing Submitted!</h2>
          <p className="mt-2 text-muted-foreground">
            Your car listing has been submitted for review. It will be live once approved by our team.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={onGoToDetail} className="w-full gap-2">
              View Listing
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => onGoToDetail()}
              className="w-full"
            >
              Go to My Listings
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============ Main Component ============

export default function SellCarView() {
  const { setView } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdCarId, setCreatedCarId] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; alt?: string; isPrimary: boolean }[]>([]);

  const form = useForm<SellCarFormData>({
    resolver: zodResolver(sellCarSchema),
    defaultValues: {
      title: '',
      brand: '',
      model: '',
      year: 2024,
      condition: 'used',
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
      setCurrentStep((s) => Math.min(s + 1, 5));
    }
  }, [validateStep]);

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
        setSubmitError(data.error || 'Failed to create listing');
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, images]);

  // ============ Success State ============

  if (createdCarId) {
    return (
      <SuccessState
        carId={createdCarId}
        onGoToDetail={() => setView('detail', { carId: createdCarId })}
      />
    );
  }

  // ============ Render ============

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold md:text-3xl">Sell Your Car</h1>
        <p className="mt-1 text-muted-foreground">
          Fill in the details to list your car on {process.env.NEXT_PUBLIC_PLATFORM_NAME || 'CIAR Cars'}
        </p>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <StepStepper currentStep={currentStep} steps={STEPS} />
      </motion.div>

      {/* Form Card */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {STEPS[currentStep - 1]?.title}
            </CardTitle>
            <CardDescription>
              Step {currentStep} of {STEPS.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step Content */}
            {currentStep === 1 && <StepBasicInfo form={form} errors={errors} />}
            {currentStep === 2 && <StepSpecifications form={form} />}
            {currentStep === 3 && <StepPricingLocation form={form} errors={errors} />}
            {currentStep === 4 && <StepImages images={images} setImages={setImages} />}
            {currentStep === 5 && <StepRentalOptions form={form} />}

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
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Submit Listing
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
