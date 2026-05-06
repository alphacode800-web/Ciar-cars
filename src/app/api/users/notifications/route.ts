// =============================================================================
// CIAR Cars - User Notifications API
// GET /api/users/notifications - Get notifications for current user
// PUT /api/users/notifications - Mark notification as read (body: { id })
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

// ============ GET: List Notifications ============

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE))));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: user.id };

    // Filter: unread only
    const unreadOnly = searchParams.get("unreadOnly");
    if (unreadOnly === "true") {
      where.isRead = false;
    }

    // Filter: by type
    const type = searchParams.get("type");
    if (type) where.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.notification.count({ where }),
      db.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      meta: { unreadCount },
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
    console.error("[NOTIFICATIONS_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// ============ PUT: Mark as Read ============

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Verify the notification belongs to the user
    const notification = await db.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to update this notification" },
        { status: 403 }
      );
    }

    const updated = await db.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Notification marked as read",
    });
  } catch (error: unknown) {
    console.error("[NOTIFICATIONS_PUT]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
