// =============================================================================
// CIAR Cars - Admin Stats API
// GET /api/admin/stats - Get platform statistics
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request);

    const [
      totalUsers,
      activeUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalBookings,
      activeBookings,
      totalRevenue,
      recentSignups,
      carsByCondition,
      bookingsByStatus,
    ] = await Promise.all([
      // Total users
      db.user.count(),

      // Active users
      db.user.count({ where: { isActive: true, isBanned: false } }),

      // Total car listings
      db.car.count(),

      // Active car listings
      db.car.count({ where: { status: "active" } }),

      // Pending car listings
      db.car.count({ where: { status: "pending" } }),

      // Total bookings
      db.rentalBooking.count(),

      // Active bookings
      db.rentalBooking.count({ where: { status: { in: ["pending", "confirmed", "active"] } } }),

      // Total revenue from completed bookings
      db.rentalBooking.aggregate({
        where: { status: "completed" },
        _sum: { totalPrice: true },
      }),

      // Recent signups (last 30 days)
      db.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Cars by condition
      db.car.groupBy({
        by: ["condition"],
        _count: true,
      }),

      // Bookings by status
      db.rentalBooking.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          recentSignups,
        },
        listings: {
          total: totalListings,
          active: activeListings,
          pending: pendingListings,
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          byStatus: bookingsByStatus.map((b) => ({
            status: b.status,
            count: b._count,
          })),
        },
        revenue: {
          total: totalRevenue._sum.totalPrice || 0,
        },
        cars: {
          byCondition: carsByCondition.map((c) => ({
            condition: c.condition,
            count: c._count,
          })),
        },
      },
    });
  } catch (error: unknown) {
    console.error("[ADMIN_STATS_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
