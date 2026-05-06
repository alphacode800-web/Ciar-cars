// =============================================================================
// CIAR Cars - Admin Bookings API
// GET /api/admin/bookings - List all bookings with details
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE))));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    const status = searchParams.get("status");
    if (status) where.status = status;

    const paymentStatus = searchParams.get("paymentStatus");
    if (paymentStatus) where.paymentStatus = paymentStatus;

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
    console.error("[ADMIN_BOOKINGS_GET]", error);
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
