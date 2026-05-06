// =============================================================================
// CIAR Cars - Car Availability API
// GET /api/cars/[id]/availability - Get available dates for a car
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify car exists and is available for rent
    const car = await db.car.findUnique({
      where: { id },
      select: {
        id: true,
        isAvailableForRent: true,
        rentalPriceDaily: true,
        rentalPriceWeekly: true,
        rentalPriceMonthly: true,
      },
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

    // Get blocked dates
    const blockedDates = await db.rentalBlockedDate.findMany({
      where: { carId: id },
      select: { date: true, reason: true },
    });

    // Get existing bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await db.rentalBooking.findMany({
      where: {
        carId: id,
        status: { in: ["pending", "confirmed", "active"] },
        OR: [
          { startDate: { gte: today } },
          { endDate: { gte: today } },
        ],
      },
      select: { startDate: true, endDate: true, status: true },
      orderBy: { startDate: "asc" },
    });

    // Combine blocked dates and booking date ranges
    const unavailableDates: { date: string; reason: string }[] = [];

    // Add blocked dates
    for (const bd of blockedDates) {
      unavailableDates.push({
        date: bd.date.toISOString().split("T")[0],
        reason: bd.reason || "Owner blocked",
      });
    }

    // Add booking date ranges
    for (const booking of bookings) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const current = new Date(start);

      while (current <= end) {
        const dateStr = current.toISOString().split("T")[0];
        if (!unavailableDates.find((d) => d.date === dateStr)) {
          unavailableDates.push({
            date: dateStr,
            reason: `Booked (${booking.status})`,
          });
        }
        current.setDate(current.getDate() + 1);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        carId: id,
        rentalPriceDaily: car.rentalPriceDaily,
        rentalPriceWeekly: car.rentalPriceWeekly,
        rentalPriceMonthly: car.rentalPriceMonthly,
        blockedDates: unavailableDates,
        bookings: bookings.map((b) => ({
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status,
        })),
      },
    });
  } catch (error) {
    console.error("[AVAILABILITY_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
