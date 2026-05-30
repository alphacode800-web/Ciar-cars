import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { buildPagination } from '@/lib/api-response';
import { AppError, NotFoundError } from '@/lib/errors';
import { BOOKING } from '@/lib/constants';
import type { BookingListQuery, CreateBookingInput } from '@/validators/rental.schema';
import type { AuthUser } from '@/lib/api-auth';

const bookingInclude = {
  car: {
    select: {
      id: true,
      title: true,
      slug: true,
      brand: true,
      model: true,
      year: true,
      images: { where: { isPrimary: true }, take: 1 },
      ownerId: true,
      owner: { select: { id: true, name: true } },
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
    },
  },
} satisfies Prisma.RentalBookingInclude;

export const rentalService = {
  async list(user: AuthUser, query: BookingListQuery) {
    const { page, limit, status, carId, userId } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.RentalBookingWhereInput = {};

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      where.userId = user.id;
    }
    if (status) where.status = status;
    if (carId) where.carId = carId;
    if (userId) where.userId = userId;

    const [bookings, total] = await Promise.all([
      db.rentalBooking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: bookingInclude,
      }),
      db.rentalBooking.count({ where }),
    ]);

    return { bookings, pagination: buildPagination(page, limit, total) };
  },

  async create(userId: string, input: CreateBookingInput) {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const now = new Date();

    if (start < now) throw new AppError('Start date cannot be in the past', 400);
    if (end <= start) throw new AppError('End date must be after start date', 400);

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (totalDays < BOOKING.minRentalDays || totalDays > BOOKING.maxRentalDays) {
      throw new AppError(
        `Rental duration must be between ${BOOKING.minRentalDays} and ${BOOKING.maxRentalDays} days`,
        400
      );
    }

    const car = await db.car.findUnique({ where: { id: input.carId } });
    if (!car) throw new NotFoundError('Car not found');
    if (!car.isAvailableForRent) throw new AppError('This car is not available for rent', 400);
    if (car.ownerId === userId) throw new AppError('You cannot rent your own car', 400);
    if (car.status !== 'active') throw new AppError(`Car is not available (status: ${car.status})`, 400);

    const overlapping = await db.rentalBooking.findFirst({
      where: {
        carId: input.carId,
        status: { in: ['pending', 'confirmed', 'active'] },
        OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
      },
    });
    if (overlapping) throw new AppError('Car is already booked for the selected dates', 409);

    const blocked = await db.rentalBlockedDate.count({
      where: { carId: input.carId, date: { gte: start, lte: end } },
    });
    if (blocked > 0) throw new AppError('Car has blocked dates in the selected range', 409);

    let dailyPrice = car.rentalPriceDaily || 0;
    let subtotal: number;

    if (totalDays >= 7 && car.rentalPriceWeekly) {
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      subtotal = weeks * car.rentalPriceWeekly + remainingDays * dailyPrice;
      dailyPrice = subtotal / totalDays;
    } else {
      subtotal = dailyPrice * totalDays;
    }

    const platformFee = Math.round(subtotal * (BOOKING.platformFeePercent / 100));
    const totalPrice = subtotal + platformFee;

    const booking = await db.rentalBooking.create({
      data: {
        carId: input.carId,
        userId,
        startDate: start,
        endDate: end,
        totalDays,
        totalPrice,
        status: 'pending',
        dailyPrice,
        platformFee,
        ownerEarnings: subtotal,
        deliveryAddress: input.deliveryAddress ?? null,
        notes: input.notes ?? null,
      },
      include: bookingInclude,
    });

    await db.notification.create({
      data: {
        userId: car.ownerId,
        type: 'booking',
        title: 'New rental request',
        message: `New booking request for ${car.title}`,
        data: JSON.stringify({ bookingId: booking.id, carId: car.id }),
      },
    });

    return booking;
  },
};
