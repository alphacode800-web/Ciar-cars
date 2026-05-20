// =============================================================================
// CIAR Cars - Admin Payments API
// GET /api/admin/payments - List all payments with pagination and filters
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

const VALID_TYPES = [
  "listing_fee",
  "boost_fee",
  "rental",
  "wallet_topup",
  "featured_fee",
];

const VALID_STATUSES = ["pending", "completed", "failed", "refunded"];

// ============ OPTIONS: CORS ============

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

// ============ GET: List All Payments ============

export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1")
    );
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE)))
    );
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    const type = searchParams.get("type");
    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      where.type = type;
    }

    const status = searchParams.get("status");
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      where.status = status;
    }

    const userId = searchParams.get("userId");
    if (userId) where.userId = userId;

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
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
      db.payment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: payments,
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
    console.error("[ADMIN_PAYMENTS_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
