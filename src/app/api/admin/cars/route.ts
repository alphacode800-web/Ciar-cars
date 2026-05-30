// =============================================================================
// CIAR Cars - Admin Cars API
// GET /api/admin/cars - List all cars (including pending) with pagination
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

    // Build where clause (no status filter by default - shows all)
    const where: Prisma.CarWhereInput = {};

    const status = searchParams.get("status");
    if (status) where.status = status;

    const condition = searchParams.get("condition");
    if (condition) where.condition = condition;

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
      ];
    }

    const ownerId = searchParams.get("ownerId");
    if (ownerId) where.ownerId = ownerId;

    const [cars, total] = await Promise.all([
      db.car.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: { reviews: true, rentalBookings: true },
          },
        },
      }),
      db.car.count({ where }),
    ]);

    const formatted = cars.map((car) => ({
      ...car,
      primaryImage: car.images[0]?.url ?? null,
      owner: car.owner,
      _count: car._count,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
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
    console.error("[ADMIN_CARS_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}
