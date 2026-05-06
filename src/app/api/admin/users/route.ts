// =============================================================================
// CIAR Cars - Admin Users API
// GET /api/admin/users - List all users with pagination
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE))));
    const skip = (page - 1) * limit;

    // Filters
    const where: Prisma.UserWhereInput = {};

    const role = searchParams.get("role");
    if (role) where.role = role;

    const isActive = searchParams.get("isActive");
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    const isBanned = searchParams.get("isBanned");
    if (isBanned !== null && isBanned !== undefined && isBanned !== "") {
      where.isBanned = isBanned === "true";
    }

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          isBanned: true,
          bannedReason: true,
          city: true,
          country: true,
          walletBalance: true,
          rating: true,
          totalReviews: true,
          totalListings: true,
          totalSales: true,
          createdAt: true,
          _count: {
            select: {
              cars: true,
              rentals: true,
              reviews: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
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
    console.error("[ADMIN_USERS_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
