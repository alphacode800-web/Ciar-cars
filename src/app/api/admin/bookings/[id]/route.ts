// =============================================================================
// CIAR Cars - Admin Booking Detail API
// GET    /api/admin/bookings/[id]  - Get single booking with full relations
// PUT    /api/admin/bookings/[id]  - Update booking status
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const VALID_STATUSES = ["pending", "confirmed", "active", "completed", "cancelled"];
const VALID_PAYMENT_STATUSES = ["pending", "paid", "refunded", "failed"];

// ============ OPTIONS: CORS ============

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

// ============ GET: Booking Details ============

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request);
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
            condition: true,
            price: true,
            rentalPriceDaily: true,
            images: { where: { isPrimary: true }, take: 1 },
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
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
            city: true,
            country: true,
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

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: unknown) {
    console.error("[ADMIN_BOOKING_GET]", error);
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
    const adminUser = await requireAdmin(request);
    const { id } = await params;

    const existing = await db.rentalBooking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, paymentStatus, notes } = body;

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (paymentStatus !== undefined) {
      if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid paymentStatus. Must be one of: ${VALID_PAYMENT_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateData.paymentStatus = paymentStatus;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const booking = await db.rentalBooking.update({
      where: { id },
      data: updateData,
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
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
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

    return NextResponse.json({
      success: true,
      data: booking,
      message: "Booking updated successfully",
    });
  } catch (error: unknown) {
    console.error("[ADMIN_BOOKING_PUT]", error);
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
