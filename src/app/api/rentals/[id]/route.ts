// =============================================================================
// CIAR Cars - Single Rental Booking API (Get + Update)
// GET /api/rentals/[id]  - Get booking details
// PUT /api/rentals/[id]  - Update booking status
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// ============ GET: Booking Details ============

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const booking = await db.rentalBooking.findUnique({
      where: { id },
      include: {
        car: {
          select: {
            id: true,
            title: true,
            slug: true,
            brand: true,
            model: true,
            year: true,
            city: true,
            images: { orderBy: { order: "asc" } },
            ownerId: true,
            owner: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
                email: true,
              },
            },
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

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check access: user must be the renter, car owner, or admin
    if (
      booking.userId !== user.id &&
      booking.car.ownerId !== user.id &&
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to view this booking" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: unknown) {
    console.error("[BOOKING_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// ============ PUT: Update Booking Status ============

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const existing = await db.rentalBooking.findUnique({
      where: { id },
      include: {
        car: { select: { ownerId: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, cancellationReason } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "confirmed", "active", "completed", "cancelled", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Permission checks based on role
    const isOwner = existing.car.ownerId === user.id;
    const isRenter = existing.userId === user.id;
    const isAdmin = user.role === "admin" || user.role === "super_admin";

    // Car owner can confirm/reject/complete
    if (isOwner && !isAdmin) {
      if (!["confirmed", "rejected", "active", "completed"].includes(status)) {
        return NextResponse.json(
          { success: false, error: "Car owner can only confirm, reject, activate, or complete bookings" },
          { status: 403 }
        );
      }
    }

    // Renter can cancel
    if (isRenter && !isAdmin && !isOwner) {
      if (status !== "cancelled") {
        return NextResponse.json(
          { success: false, error: "You can only cancel your booking" },
          { status: 403 }
        );
      }
    }

    // Status transition validation
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "rejected", "cancelled"],
      confirmed: ["active", "cancelled"],
      active: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
      rejected: [],
    };

    if (!validTransitions[existing.status]?.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Cannot transition from ${existing.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update booking
    const booking = await db.rentalBooking.update({
      where: { id },
      data: {
        status,
        cancellationReason: status === "cancelled" ? (cancellationReason || null) : existing.cancellationReason,
        paymentStatus: status === "completed" ? "paid" : existing.paymentStatus,
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

    // If booking is completed, update owner earnings
    if (status === "completed") {
      await db.user.update({
        where: { id: existing.car.ownerId },
        data: {
          walletBalance: { increment: existing.ownerEarnings },
          totalSales: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: booking,
      message: `Booking ${status} successfully`,
    });
  } catch (error: unknown) {
    console.error("[BOOKING_PUT]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
