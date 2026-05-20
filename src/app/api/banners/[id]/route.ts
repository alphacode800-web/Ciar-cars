// =============================================================================
// CIAR Cars - Banner Detail API
// PUT    /api/banners/[id]  - Update banner (admin only)
// DELETE /api/banners/[id]  - Delete banner (admin only)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const VALID_POSITIONS = ["home", "listing", "detail"];

// ============ OPTIONS: CORS ============

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

// ============ PUT: Update Banner ============

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request);
    const { id } = await params;

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Banner not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      imageUrl,
      linkUrl,
      position,
      order,
      isActive,
      startDate,
      endDate,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl || null;

    if (position !== undefined) {
      if (!VALID_POSITIONS.includes(position)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid position. Must be one of: ${VALID_POSITIONS.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateData.position = position;
    }

    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }

    const banner = await db.banner.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: banner,
      message: "Banner updated successfully",
    });
  } catch (error: unknown) {
    console.error("[BANNER_PUT]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

// ============ DELETE: Delete Banner ============

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request);
    const { id } = await params;

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Banner not found" },
        { status: 404 }
      );
    }

    await db.banner.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error: unknown) {
    console.error("[BANNER_DELETE]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
