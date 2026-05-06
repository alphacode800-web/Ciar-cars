'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Heart,
  Share2,
  Flag,
  Star,
  MapPin,
  Calendar,
  Fuel,
  Settings2,
  Users,
  DoorOpen,
  Gauge,
  Car,
  Phone,
  MessageCircle,
  Shield,
  Clock,
  Eye,
  Award,
  CheckCircle2,
  PlayCircle,
  ZoomIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CURRENCY,
  CAR_BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  SPECIFICATION_GROUPS,
} from '@/lib/constants';
import { useAppStore } from '@/store/app-store';
import { useCarStore } from '@/store/car-store';
import { useAuthStore } from '@/store/auth-store';
import { useIsMobile } from '@/hooks/use-mobile';
import type {
  Car,
  CarImage,
  CarSpecification,
  Review,
  PaginatedResponse,
} from '@/types';

// ============ Helpers ============

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(price));
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============ Skeleton ============

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back */}
        <Skeleton className="h-9 w-24 mb-6" />
        {/* Gallery + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
            <div className="flex gap-2 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-3 gap-3 mt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="h-[400px] w-full mt-8 rounded-2xl" />
      </div>
    </div>
  );
}

// ============ Image Gallery ============

function ImageGallery({ images }: { images: CarImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const allImages =
    images.length > 0
      ? images
      : [{ id: 'placeholder', url: '/placeholder-car.png', isPrimary: true, order: 0, carId: '' }];

  const navigate = (dir: -1 | 1) => {
    setCurrentIndex((prev) => {
      if (dir === 1) return (prev + 1) % allImages.length;
      return prev === 0 ? allImages.length - 1 : prev - 1;
    });
  };

  return (
    <>
      {/* Main image */}
      <div className="relative group rounded-2xl overflow-hidden bg-muted aspect-[4/3]">
        <img
          src={allImages[currentIndex].url}
          alt={allImages[currentIndex].alt || `Car image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              onClick={() => navigate(1)}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Counter + fullscreen */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-xs px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white font-medium">
            {currentIndex + 1} / {allImages.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setLightboxOpen(true)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {allImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all',
                idx === currentIndex
                  ? 'border-primary shadow-sm'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">Image Lightbox</DialogTitle>
          <div className="relative w-full aspect-[16/10] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={allImages[currentIndex].url}
                alt={allImages[currentIndex].alt || `Car image ${currentIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => navigate(1)}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70 font-medium">
              {currentIndex + 1} / {allImages.length}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============ Quick Spec Card ============

function QuickSpecCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 border border-border/40 text-center min-w-0">
      <Icon className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground truncate w-full">{label}</span>
      <span className="text-sm font-semibold text-foreground truncate w-full">
        {value ?? 'N/A'}
      </span>
    </div>
  );
}

// ============ Star Rating ============

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          className={cn(
            'transition-colors',
            onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          )}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange?.(star)}
        >
          <Star
            className={cn(
              'w-5 h-5',
              (hover || rating) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ============ Review Item ============

function ReviewItem({ review }: { review: Review & { user?: { id: string; name?: string | null; avatar?: string | null } } }) {
  return (
    <div className="flex gap-3 py-4">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={review.user?.avatar || undefined} />
        <AvatarFallback className="text-xs">
          {getInitials(review.user?.name || 'User')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            {review.user?.name || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(review.createdAt)}
          </span>
        </div>
        <div className="mt-0.5">
          <StarRating rating={review.rating} />
        </div>
        {review.comment && (
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
}

// ============ Review Form ============

function ReviewForm({ carId, onSubmitted }: { carId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cars/${carId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      if (res.ok) {
        setRating(0);
        setComment('');
        onSubmitted();
      }
    } catch (err) {
      console.error('[Review] Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border/60 bg-muted/30">
      <h4 className="text-sm font-semibold text-foreground">Write a Review</h4>
      <div>
        <span className="text-xs text-muted-foreground mb-1 block">Your Rating</span>
        <StarRating rating={rating} onChange={setRating} />
      </div>
      <Textarea
        placeholder="Share your experience with this car..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="text-sm resize-none"
      />
      <Button
        size="sm"
        disabled={rating === 0 || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </div>
  );
}

// ============ Similar Car Card ============

function SimilarCarCard({ car, onClick }: { car: Record<string, unknown>; onClick: () => void }) {
  const c = car as unknown as {
    id: string;
    title: string;
    year: number;
    price: number;
    currency: string;
    primaryImage?: string | null;
    city: string;
    condition: string;
    mileage?: number | null;
  };

  const conditionColor =
    c.condition === 'new'
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
      : 'bg-amber-500/10 text-amber-600 border-amber-200';

  return (
    <Card
      className="group overflow-hidden border border-border/60 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {c.primaryImage ? (
          <img
            src={c.primaryImage}
            alt={c.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-12 h-12 text-muted-foreground/20" />
          </div>
        )}
        <Badge
          className={cn(
            'absolute top-2 left-2 text-[10px] font-medium border',
            conditionColor
          )}
        >
          {c.condition === 'new' ? 'New' : 'Used'}
        </Badge>
      </div>
      <CardContent className="p-3">
        <h4 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {c.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">{c.year}</p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
          <span className="text-sm font-bold text-foreground">
            {CURRENCY.symbol} {formatPrice(c.price)}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {c.city}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Main Component ============

export default function CarDetailView() {
  const isMobile = useIsMobile();
  const { viewParams, setView } = useAppStore();
  const { setCurrentCar } = useCarStore();
  const { isAuthenticated, user } = useAuthStore();

  const carId = viewParams.carId as string;

  const [car, setCar] = useState<(Car & { averageRating?: number; reviewCount?: number; bookingCount?: number }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [similarCars, setSimilarCars] = useState<Record<string, unknown>[]>([]);

  // Fetch car
  const fetchCar = useCallback(async () => {
    if (!carId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cars/${carId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCar(json.data);
        setCurrentCar(json.data);
      }
    } catch (err) {
      console.error('[CarDetail] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [carId, setCurrentCar]);

  // Fetch similar cars
  const fetchSimilar = useCallback(async () => {
    if (!carId) return;
    try {
      const res = await fetch(`/api/cars?limit=4&sortBy=createdAt&sortOrder=desc`);
      const json = (await res.json()) as PaginatedResponse<Record<string, unknown>>;
      if (json.data) {
        setSimilarCars(json.data.filter((c) => c.id !== carId).slice(0, 4));
      }
    } catch {
      // silently fail
    }
  }, [carId]);

  useEffect(() => {
    fetchCar();
    fetchSimilar();
  }, [fetchCar, fetchSimilar]);

  if (isLoading) return <DetailSkeleton />;
  if (!car) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Car not found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The car you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setView('listing')}>
            Browse all cars
          </Button>
        </div>
      </div>
    );
  }

  const specs = car.specifications || [];
  const reviews = car.reviews || [];
  const images = car.images || [];

  // Group specs
  const specsByGroup = specs.reduce<Record<string, CarSpecification[]>>(
    (acc, spec) => {
      const group = spec.group || 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push(spec);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="mb-5 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => setView('listing')}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to listings
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Image Gallery (3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-3"
          >
            <ImageGallery images={images} />
          </motion.div>

          {/* Right: Info (2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Condition badge */}
            <Badge
              className={cn(
                'text-xs font-medium border',
                car.condition === 'new'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                  : 'bg-amber-500/10 text-amber-600 border-amber-200'
              )}
            >
              {car.condition === 'new' ? 'Brand New' : 'Pre-Owned'}
            </Badge>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {car.title}
            </h1>

            {/* Meta row */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {car.viewsCount} views
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {car.city}, {car.country}
              </span>
              <span>·</span>
              <span>{formatDate(car.createdAt)}</span>
            </div>

            {/* Price */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/40">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {CURRENCY.symbol} {formatPrice(car.price)}
                </span>
                {car.isNegotiable && (
                  <Badge variant="secondary" className="text-xs">
                    Negotiable
                  </Badge>
                )}
              </div>
              {car.isAvailableForRent && car.rentalPriceDaily && (
                <p className="text-sm text-muted-foreground mt-1.5">
                  Rent from{' '}
                  <span className="font-semibold text-foreground">
                    {CURRENCY.symbol} {formatPrice(car.rentalPriceDaily)}
                  </span>{' '}
                  / day
                </p>
              )}
            </div>

            {/* Quick specs grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <QuickSpecCard icon={Calendar} label="Year" value={car.year} />
              <QuickSpecCard
                icon={Gauge}
                label="Mileage"
                value={car.mileage ? `${formatPrice(car.mileage)} km` : null}
              />
              <QuickSpecCard
                icon={Fuel}
                label="Fuel"
                value={car.fuelType ? getFuelTypeLabel(car.fuelType) : null}
              />
              <QuickSpecCard
                icon={Settings2}
                label="Transmission"
                value={car.transmission ? getTransmissionLabel(car.transmission) : null}
              />
              <QuickSpecCard icon={Users} label="Seats" value={car.seats} />
              <QuickSpecCard icon={DoorOpen} label="Doors" value={car.doors} />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-2 flex-1 min-w-[120px]',
                  isFavorited && 'text-red-500 border-red-200 bg-red-50'
                )}
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart
                  className={cn('w-4 h-4', isFavorited && 'fill-current')}
                />
                {isFavorited ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 flex-1 min-w-[120px]">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Flag className="w-4 h-4" />
                Report
              </Button>
            </div>

            {/* Owner card */}
            {car.owner && (
              <Card className="border border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={car.owner.avatar || undefined} />
                      <AvatarFallback>
                        {getInitials(car.owner.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {car.owner.name || 'Anonymous'}
                      </h4>
                      {car.owner.businessName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {car.owner.businessName}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium text-foreground">
                            {car.owner.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({car.owner.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2.5 mt-4">
                    <Button className="flex-1 gap-2" size="sm">
                      <Phone className="w-4 h-4" />
                      Contact Seller
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      size="sm"
                      onClick={() => setView('chat')}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Start Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rental section */}
            {car.isAvailableForRent && (
              <Card className="border border-violet-200 bg-violet-50/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-600" />
                    <h4 className="text-sm font-semibold text-foreground">
                      Available for Rental
                    </h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {car.rentalPriceDaily && (
                      <div className="text-center p-2 rounded-lg bg-background border border-border/40">
                        <p className="text-xs text-muted-foreground">Daily</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">
                          {CURRENCY.symbol} {formatPrice(car.rentalPriceDaily)}
                        </p>
                      </div>
                    )}
                    {car.rentalPriceWeekly && (
                      <div className="text-center p-2 rounded-lg bg-background border border-border/40">
                        <p className="text-xs text-muted-foreground">Weekly</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">
                          {CURRENCY.symbol} {formatPrice(car.rentalPriceWeekly)}
                        </p>
                      </div>
                    )}
                    {car.rentalPriceMonthly && (
                      <div className="text-center p-2 rounded-lg bg-background border border-border/40">
                        <p className="text-xs text-muted-foreground">Monthly</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">
                          {CURRENCY.symbol} {formatPrice(car.rentalPriceMonthly)}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={() => setView('rental', { carId: car.id })}
                  >
                    <PlayCircle className="w-4 h-4" />
                    Book This Car
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Tabs section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="mt-8"
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 h-11 p-1 rounded-xl">
              <TabsTrigger
                value="overview"
                className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Features & Specs
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Location
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Description */}
                <div className="lg:col-span-2">
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {car.description ||
                          'No description provided for this vehicle. Contact the seller for more details.'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Key specs */}
                <div>
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Key Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: 'Brand', value: car.brand },
                        { label: 'Model', value: car.model },
                        { label: 'Year', value: String(car.year) },
                        { label: 'Condition', value: car.condition === 'new' ? 'New' : 'Used' },
                        { label: 'Body Type', value: car.bodyType ? getBodyTypeLabel(car.bodyType) : 'N/A' },
                        { label: 'Engine', value: car.engineSize || 'N/A' },
                        { label: 'Horsepower', value: car.horsepower ? `${car.horsepower} HP` : 'N/A' },
                        { label: 'Drivetrain', value: car.drivetrain?.toUpperCase() || 'N/A' },
                        { label: 'Color', value: car.exteriorColor || 'N/A' },
                        { label: 'Owners', value: `${car.ownershipCount}` },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0"
                        >
                          <span className="text-xs text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Full specs table grouped */}
              {Object.keys(specsByGroup).length > 0 && (
                <Card className="border-border/60 shadow-sm mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Detailed Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(specsByGroup).map(([group, groupSpecs]) => (
                      <div key={group} className="mb-4 last:mb-0">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {group}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                          {groupSpecs.map((spec) => (
                            <div
                              key={spec.id}
                              className="flex items-center justify-between py-2 border-b border-border/30"
                            >
                              <span className="text-xs text-muted-foreground capitalize">
                                {spec.key.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs font-medium text-foreground">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Specs Tab */}
            <TabsContent value="specs" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(specsByGroup).map(([group, groupSpecs]) => (
                  <Card key={group} className="border-border/60 shadow-sm">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        {group}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-2.5">
                        {groupSpecs.map((spec) => (
                          <div key={spec.id} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs text-muted-foreground capitalize">
                                {spec.key.replace(/_/g, ' ')}
                              </span>
                              <p className="text-sm font-medium text-foreground">
                                {spec.value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {Object.keys(specsByGroup).length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-12">
                    No detailed specifications available for this car.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <div className="max-w-2xl space-y-1">
                {/* Rating summary */}
                <Card className="border-border/60 shadow-sm mb-4">
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-foreground">
                        {car.averageRating?.toFixed(1) || '0.0'}
                      </p>
                      <div className="mt-1">
                        <StarRating rating={Math.round(car.averageRating || 0)} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(car.reviewCount || 0)} review{(car.reviewCount || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Separator orientation="vertical" className="h-16" />
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter((r) => r.rating === star).length;
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-3">{star}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-amber-400 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-6 text-right">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Review list */}
                <div className="divide-y divide-border/50">
                  {reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No reviews yet. Be the first to review this car!
                    </p>
                  )}
                </div>

                {/* Add review form */}
                {isAuthenticated && (
                  <div className="pt-4">
                    <ReviewForm carId={car.id} onSubmitted={fetchCar} />
                  </div>
                )}
                {!isAuthenticated && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      <button
                        onClick={() => setView('auth')}
                        className="text-primary hover:underline font-medium"
                      >
                        Sign in
                      </button>{' '}
                      to write a review.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="mt-6">
              <div className="max-w-2xl">
                <Card className="border-border/60 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {car.city}, {car.country}
                        </h4>
                        {car.address && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {car.address}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Map placeholder */}
                    <div className="w-full aspect-[16/9] rounded-xl bg-muted border border-border/40 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Map view coming soon
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Similar cars */}
        {similarCars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="mt-10 mb-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Similar Cars</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  You might also be interested in these
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setView('listing', { brand: car.brand })}
              >
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarCars.map((sc) => (
                <SimilarCarCard
                  key={sc.id as string}
                  car={sc}
                  onClick={() => setView('detail', { carId: sc.id })}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
