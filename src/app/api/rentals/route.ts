// =============================================================================
// CIAR Cars - Rentals API (List + Create)
// GET  /api/rentals  - List bookings (admin: all, user: own)
// POST /api/rentals  - Create rental booking
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { BOOKING, DEFAULT_PAGE_SIZE } from "@/lib/constants";

// ============ GET: List Bookings ============

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE))));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    // Non-admin users see only their own bookings
    if (user.role !== "admin" && user.role !== "super_admin") {
      where.userId = user.id;
    }

    // Filters
    const status = searchParams.get("status");
    if (status) where.status = status;

    const carId = searchParams.get("carId");
    if (carId) where.carId = carId;

    const userId = searchParams.get("userId");
    if (userId) where.userId = userId;

    const [bookings, total] = await Promise.all([
      db.rentalBooking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
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
        },
      }),
      db.rentalBooking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: unknown) {
    console.error("[RENTALS_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// ============ POST: Create Booking ============

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const { carId, startDate, endDate, deliveryAddress, notes } = body;

    // Validate required fields
    if (!carId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: carId, startDate, endDate" },
        { status: 400 }
      );
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Validate dates
    if (start < now) {
      return NextResponse.json(
        { success: false, error: "Start date cannot be in the past" },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { success: false, error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays < BOOKING.minRentalDays || totalDays > BOOKING.maxRentalDays) {
      return NextResponse.json(
        { success: false, error: `Rental duration must be between ${BOOKING.minRentalDays} and ${BOOKING.maxRentalDays} days` },
        { status: 400 }
      );
    }

    // Verify car exists and is available for rent
    const car = await db.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return NextResponse.json(
        { success: false, error: "Car not found" },
        { status: 404 }
      );
    }

    if (!car.isAvailableForRent) {
      return NextResponse.json(
        { success: false, error: "This car is not available for rent" },
        { status: 400 }
      );
    }

    if (car.ownerId === user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot rent your own car" },
        { status: 400 }
      );
    }

    if (car.status !== "active") {
      return NextResponse.json(
        { success: false, error: "This car is not available (status: " + car.status + ")" },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlappingBooking = await db.rentalBooking.findFirst({
      where: {
        carId,
        status: { in: ["pending", "confirmed", "active"] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        { success: false, error: "Car is already booked for the selected dates" },
        { status: 409 }
      );
    }

    // Check blocked dates
    const blockedDatesInRange = await db.rentalBlockedDate.findMany({
      where: {
        carId,
        date: { gte: start, lte: end },
      },
    });

    if (blockedDatesInRange.length > 0) {
      return NextResponse.json(
        { success: false, error: "Car has blocked dates in the selected range" },
        { status: 409 }
      );
    }

    // Calculate pricing
    let dailyPrice = car.rentalPriceDaily || 0;

    // Use weekly rate if rental >= 7 days and weekly rate is available
    if (totalDays >= 7 && car.rentalPriceWeekly) {
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      const totalPrice =
        weeks * car.rentalPriceWeekly + remainingDays * dailyPrice;
      dailyPrice = totalPrice / totalDays;
    } else {
      dailyPrice = car.rentalPriceDaily || 0;
    }

    const subtotal = dailyPrice * totalDays;
    const platformFee = Math.round(subtotal * (BOOKING.platformFeePercent / 100));
    const totalPrice = subtotal + platformFee;
    const ownerEarnings = subtotal;

    // Create booking
    const booking = await db.rentalBooking.create({
      data: {
        carId,
        userId: user.id,
        startDate: start,
        endDate: end,
        totalDays,
        totalPrice,
        status: "pending",
        dailyPrice,
        platformFee,
        ownerEarnings,
        deliveryAddress: deliveryAddress || null,
        notes: notes || null,
      },
      include: {
        car: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            year: true,
            images: { where: { isPrimary: true }, take: 1 },
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
      },
    });

    return NextResponse.json(
      { success: true, data: booking, message: "Booking created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[RENTALS_POST]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
