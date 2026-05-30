// =============================================================================
// CIAR Cars - Banners API
// GET  /api/banners - Get active banners by position
// POST /api/banners - Create banner (admin only)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

// ============ GET: Active Banners ============

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const all = searchParams.get("all") === "true";

    const where: Record<string, unknown> = {};

    if (!all) {
      where.isActive = true;
    }

    if (position) {
      where.position = position;
    }

    if (!all) {
      const now = new Date();
      where.OR = [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ];
    }

    const banners = await db.banner.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("[BANNERS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// ============ POST: Create Banner ============

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request);

    const body = await request.json();
    const { title, subtitle, imageUrl, linkUrl, position, order, isActive, startDate, endDate } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { success: false, error: "Title and imageUrl are required" },
        { status: 400 }
      );
    }

    const validPositions = ["home", "listing", "detail"];
    if (position && !validPositions.includes(position)) {
      return NextResponse.json(
        { success: false, error: `Invalid position. Must be one of: ${validPositions.join(", ")}` },
        { status: 400 }
      );
    }

    const banner = await db.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        imageUrl,
        linkUrl: linkUrl || null,
        position: position || "home",
        order: order ?? 0,
        isActive: isActive ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(
      { success: true, data: banner, message: "Banner created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[BANNERS_POST]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create banner" },
      { status: 500 }
    );
  }
}
