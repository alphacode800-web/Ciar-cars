// =============================================================================
// CIAR Cars - User Dashboard API
// GET /api/users/dashboard - Get user dashboard stats
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Run all queries in parallel for performance
    const [
      totalListings,
      activeListings,
      totalViews,
      totalInquiries,
      pendingBookings,
      recentBookings,
      recentCars,
      unreadMessages,
    ] = await Promise.all([
      // Total listings count
      db.car.count({ where: { ownerId: user.id } }),

      // Active listings count
      db.car.count({ where: { ownerId: user.id, status: "active" } }),

      // Total views across all user's cars
      db.car.aggregate({
        where: { ownerId: user.id },
        _sum: { viewsCount: true },
      }),

      // Total inquiries across all user's cars
      db.car.aggregate({
        where: { ownerId: user.id },
        _sum: { inquiriesCount: true },
      }),

      // Pending bookings (as car owner)
      db.rentalBooking.count({
        where: {
          car: { ownerId: user.id },
          status: "pending",
        },
      }),

      // Recent bookings (as renter or owner), last 5
      db.rentalBooking.findMany({
        where: {
          OR: [
            { userId: user.id },
            { car: { ownerId: user.id } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
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
            select: { id: true, name: true, avatar: true },
          },
        },
      }),

      // Recent car listings, last 5
      db.car.findMany({
        where: { ownerId: user.id },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { reviews: true, rentalBookings: true } },
        },
      }),

      // Unread message count
      db.chatRoomUser.count({
        where: {
          userId: user.id,
          isMuted: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalListings,
          activeListings,
          totalViews: totalViews._sum.viewsCount || 0,
          totalInquiries: totalInquiries._sum.inquiriesCount || 0,
          pendingBookings,
        },
        recentBookings,
        recentCars,
        unreadMessages,
      },
    });
  } catch (error: unknown) {
    console.error("[DASHBOARD_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
