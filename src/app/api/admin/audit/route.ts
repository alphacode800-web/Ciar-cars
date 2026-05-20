// =============================================================================
// CIAR Cars - Admin Audit Log API
// GET /api/admin/audit - List audit logs with pagination and filters
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

// ============ OPTIONS: CORS ============

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

// ============ GET: List Audit Logs ============

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

    const userId = searchParams.get("userId");
    if (userId) where.userId = userId;

    const action = searchParams.get("action");
    if (action) where.action = action;

    const entity = searchParams.get("entity");
    if (entity) where.entity = entity;

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
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
              avatar: true,
            },
          },
        },
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
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
    console.error("[ADMIN_AUDIT_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
