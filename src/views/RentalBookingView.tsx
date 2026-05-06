'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Star,
  Fuel,
  Settings2,
  Users,
  MessageSquare,
  ArrowRight,
  Loader2,
  Shield,
  Clock,
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format, differenceInCalendarDays, isBefore, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { CURRENCY, BOOKING } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Car, ApiResponse } from '@/types';

// ============ Types ============

interface UnavailableDate {
  date: string;
  reason: string;
}

interface AvailabilityData {
  carId: string;
  rentalPriceDaily: number | null;
  rentalPriceWeekly: number | null;
  rentalPriceMonthly: number | null;
  blockedDates: UnavailableDate[];
  bookings: { startDate: string; endDate: string; status: string }[];
}

// ============ Price Formatter ============

function formatPrice(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString('en-US')}`;
}

// ============ Car Summary Card ============

function CarSummarySkeleton() {
  return (
    <Card className="sticky top-6">
      <Skeleton className="aspect-video w-full rounded-t-xl" />
      <CardContent className="space-y-4 p-5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

function CarSummaryCard({ car, onContactOwner }: { car: Car; onContactOwner: () => void }) {
  const primaryImage = car.images?.[0]?.url;
  const weeklyPrice = car.rentalPriceWeekly
    ? formatPrice(Math.round(car.rentalPriceWeekly / 7)) + '/day'
    : null;
  const monthlyPrice = car.rentalPriceMonthly
    ? formatPrice(Math.round(car.rentalPriceMonthly / 30)) + '/day'
    : null;

  return (
    <Card className="sticky top-6 overflow-hidden">
      {/* Car Image */}
      <div className="relative aspect-video w-full bg-muted">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={car.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Settings2 className="h-12 w-12" />
          </div>
        )}
        <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
          For Rent
        </Badge>
      </div>

      <CardContent className="p-5">
        {/* Title */}
        <h2 className="text-xl font-bold text-foreground">{car.title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {car.year} &middot; {car.brand} {car.model}
        </p>

        <Separator className="my-4" />

        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-3">
          {car.fuelType && (
            <div className="flex items-center gap-2 text-sm">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{car.fuelType}</span>
            </div>
          )}
          {car.transmission && (
            <div className="flex items-center gap-2 text-sm">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{car.transmission}</span>
            </div>
          )}
          {car.bodyType && (
            <div className="flex items-center gap-2 text-sm">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{car.bodyType}</span>
            </div>
          )}
          {car.seats && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{car.seats} seats</span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Rental Rates */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Rental Rates</h4>
          <div className="space-y-2">
            {car.rentalPriceDaily && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Daily</span>
                <span className="font-semibold text-foreground">{formatPrice(car.rentalPriceDaily)}</span>
              </div>
            )}
            {car.rentalPriceWeekly && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weekly</span>
                <div className="text-right">
                  <span className="font-semibold text-foreground">{formatPrice(car.rentalPriceWeekly)}</span>
                  {weeklyPrice && (
                    <span className="ml-1 text-xs text-emerald-600">{weeklyPrice}</span>
                  )}
                </div>
              </div>
            )}
            {car.rentalPriceMonthly && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly</span>
                <div className="text-right">
                  <span className="font-semibold text-foreground">{formatPrice(car.rentalPriceMonthly)}</span>
                  {monthlyPrice && (
                    <span className="ml-1 text-xs text-emerald-600">{monthlyPrice}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Owner */}
        {car.owner && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={car.owner.avatar || '/placeholder-avatar.png'}
                alt={car.owner.name || ''}
                className="h-10 w-10 rounded-full object-cover"
              />
              {car.owner.rating > 0 && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-background px-1">
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    {car.owner.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">{car.owner.name || 'Owner'}</p>
              <p className="text-xs text-muted-foreground">
                {car.owner.city || ''}{car.owner.totalReviews > 0 ? ` · ${car.owner.totalReviews} reviews` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Contact Owner */}
        <Button
          className="mt-4 w-full gap-2"
          variant="outline"
          onClick={onContactOwner}
        >
          <MessageSquare className="h-4 w-4" />
          Contact Owner
        </Button>
      </CardContent>
    </Card>
  );
}

// ============ Main Component ============

export default function RentalBookingView() {
  const { viewParams, setView } = useAppStore();
  const { user } = useAuthStore();
  const carId = viewParams.carId as string;

  const [car, setCar] = useState<Car | null>(null);
  const [isLoadingCar, setIsLoadingCar] = useState(true);
  const [carError, setCarError] = useState<string | null>(null);

  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cod'>('wallet');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // ============ Fetch Car ============

  useEffect(() => {
    if (!carId) return;

    async function fetchCar() {
      try {
        setIsLoadingCar(true);
        setCarError(null);
        const res = await fetch(`/api/cars/${carId}`);
        const data: ApiResponse<Car> = await res.json();

        if (data.success && data.data) {
          setCar(data.data);
        } else {
          setCarError(data.error || 'Car not found');
        }
      } catch {
        setCarError('Failed to load car details');
      } finally {
        setIsLoadingCar(false);
      }
    }

    fetchCar();
  }, [carId]);

  // ============ Fetch Availability ============

  useEffect(() => {
    if (!carId) return;

    async function fetchAvailability() {
      try {
        setIsLoadingAvailability(true);
        const res = await fetch(`/api/cars/${carId}/availability`);
        const data = await res.json();

        if (data.success) {
          setAvailability(data.data);
        }
      } catch {
        // Availability is non-critical
      } finally {
        setIsLoadingAvailability(false);
      }
    }

    fetchAvailability();
  }, [carId]);

  // ============ Calculate Pricing ============

  const pricing = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to || !car) return null;

    const days = differenceInCalendarDays(dateRange.to, dateRange.from);
    if (days <= 0) return null;

    let dailyRate = car.rentalPriceDaily || 0;
    let subtotal = dailyRate * days;

    // Use weekly rate if >= 7 days
    if (days >= 7 && car.rentalPriceWeekly) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      subtotal = weeks * car.rentalPriceWeekly + remainingDays * dailyRate;
    }

    const platformFee = Math.round(subtotal * (BOOKING.platformFeePercent / 100));
    const deliveryFee = deliveryAddress.trim() ? 200 : 0;
    const total = subtotal + platformFee + deliveryFee;

    return { days, dailyRate, subtotal, platformFee, deliveryFee, total };
  }, [dateRange, car, deliveryAddress]);

  // ============ Blocked Dates for Calendar ============

  const blockedDates = useMemo(() => {
    if (!availability) return [];
    return availability.blockedDates.map((bd) => new Date(bd.date + 'T00:00:00'));
  }, [availability]);

  // ============ Date Selection Handler ============

  const handleDateSelect = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);
      setBookingError(null);
    },
    []
  );

  // ============ Submit Booking ============

  const handleSubmitBooking = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to || !carId || !pricing) return;

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId,
          startDate: format(dateRange.from, 'yyyy-MM-dd'),
          endDate: format(dateRange.to, 'yyyy-MM-dd'),
          deliveryAddress: deliveryAddress.trim() || undefined,
          notes: notes.trim() || undefined,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setBookingSuccess(true);
      } else {
        setBookingError(data.error || 'Failed to create booking');
      }
    } catch {
      setBookingError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [dateRange, carId, pricing, deliveryAddress, notes, paymentMethod]);

  // ============ Contact Owner ============

  const handleContactOwner = useCallback(() => {
    if (!car?.owner) return;
    // Create a chat room with the owner
    fetch('/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carId: car.id,
        otherUserId: car.ownerId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.id) {
          setView('chat', { roomId: data.data.id });
        }
      })
      .catch(() => {
        // Fallback: just open chat
        setView('chat');
      });
  }, [car, setView]);

  // ============ Success State ============

  if (bookingSuccess) {
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
            <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
            <p className="mt-2 text-muted-foreground">
              Your rental request has been submitted. The owner will review and confirm your booking shortly.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={() => setView('my-bookings')}
                className="w-full gap-2"
              >
                View My Bookings
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setView('home')} className="w-full">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ============ Error State (no car) ============

  if (!isLoadingCar && (carError || !car)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Car Not Available</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {carError || 'This car could not be found or is not available for rent.'}
            </p>
            <Button className="mt-4" onClick={() => setView('home')}>
              Browse Cars
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ Main Render ============

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      {/* Breadcrumb-like header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => setView('detail', { carId })}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Car Details
        </button>
        <h1 className="mt-2 text-2xl font-bold md:text-3xl">Book Your Rental</h1>
        {car && (
          <p className="mt-1 text-muted-foreground">
            Reserve the {car.year} {car.brand} {car.model} for your trip
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* ========== Left Column ========== */}
        <div className="space-y-6 lg:col-span-3">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Select Dates
                </CardTitle>
                <CardDescription>
                  Choose your pickup and return dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAvailability ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDateSelect}
                      numberOfMonths={1}
                      disabled={(date) => {
                        const today = startOfDay(new Date());
                        return (
                          isBefore(date, today) ||
                          blockedDates.some(
                            (bd) =>
                              bd.getFullYear() === date.getFullYear() &&
                              bd.getMonth() === date.getMonth() &&
                              bd.getDate() === date.getDate()
                          )
                        );
                      }}
                      className="rounded-lg border p-4"
                      classNames={{
                        day: cn(
                          'relative w-full h-full p-0 text-center select-none aspect-square',
                          'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground',
                          'data-[range-middle=true]:bg-primary/10 data-[range-middle=true]:text-primary-foreground',
                          'data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground',
                          'data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground'
                        ),
                        range_middle: 'bg-primary/10 rounded-none',
                        range_start: 'rounded-l-md bg-primary',
                        range_end: 'rounded-r-md bg-primary',
                      }}
                    />
                  </div>
                )}

                {/* Date Summary */}
                {dateRange?.from && dateRange?.to && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-lg bg-primary/5 p-3"
                  >
                    <p className="text-sm font-medium text-primary">
                      Selected: {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                      {pricing && (
                        <span className="ml-2 text-muted-foreground">
                          ({pricing.days} day{pricing.days > 1 ? 's' : ''})
                        </span>
                      )}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pricing Breakdown */}
          <AnimatePresence>
            {pricing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pricing Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatPrice(pricing.dailyRate)} x {pricing.days} day{pricing.days > 1 ? 's' : ''}
                      </span>
                      <span className="font-medium">{formatPrice(pricing.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Platform fee ({BOOKING.platformFeePercent}%)
                      </span>
                      <span className="font-medium">{formatPrice(pricing.platformFee)}</span>
                    </div>
                    {pricing.deliveryFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delivery fee</span>
                        <span className="font-medium">{formatPrice(pricing.deliveryFee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold">Total</span>
                      <span className="text-xl font-bold text-primary">{formatPrice(pricing.total)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Details</CardTitle>
                <CardDescription>Complete your rental reservation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delivery Address */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Delivery Address
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </label>
                  <Input
                    placeholder="Enter delivery address for the car"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                  {deliveryAddress.trim() && (
                    <p className="text-xs text-muted-foreground">
                      + {formatPrice(200)} delivery fee will be added
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Notes
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Any special requests or notes for the owner..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Payment Method
                  </label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'wallet' | 'cod')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wallet">CIAR Wallet</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                  {paymentMethod === 'wallet' && user && (
                    <p className="text-xs text-muted-foreground">
                      Your wallet balance: {formatPrice(user.walletBalance)}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {bookingError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {bookingError}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <Button
                  className="w-full gap-2 py-6 text-base font-semibold"
                  disabled={!pricing || isSubmitting}
                  onClick={handleSubmitBooking}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      Confirm Booking
                      {pricing && (
                        <span className="ml-1 text-primary-foreground/80">
                          &middot; {formatPrice(pricing.total)}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ========== Right Column ========== */}
        <div className="lg:col-span-2">
          {isLoadingCar ? (
            <CarSummarySkeleton />
          ) : car ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CarSummaryCard car={car} onContactOwner={handleContactOwner} />
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
