// =============================================================================
// CIAR Cars - Homepage Sections API
// GET    /api/homepage - Get homepage sections (ordered, active only)
// POST   /api/homepage - Create homepage section (admin only)
// PUT    /api/homepage - Update homepage section (admin only)
// DELETE /api/homepage - Delete homepage section (admin only)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

// ============ GET: Homepage Sections ============

export async function GET() {
  try {
    const sections = await db.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error("[HOMEPAGE_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage sections" },
      { status: 500 }
    );
  }
}

// ============ POST: Create Section ============

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request);

    const body = await request.json();
    const { type, title, subtitle, content, order, isActive } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Section type is required" },
        { status: 400 }
      );
    }

    const validTypes = ["hero", "featured_cars", "categories", "banner", "testimonials", "stats", "cta"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid section type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const section = await db.homepageSection.create({
      data: {
        type,
        title: title || null,
        subtitle: subtitle || null,
        content: content ? JSON.stringify(content) : null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(
      { success: true, data: section, message: "Section created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[HOMEPAGE_POST]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create section" },
      { status: 500 }
    );
  }
}

// ============ PUT: Update Section ============

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin(request);

    const body = await request.json();
    const { id, type, title, subtitle, content, order, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Section ID is required" },
        { status: 400 }
      );
    }

    const existing = await db.homepageSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (content !== undefined) updateData.content = typeof content === "string" ? content : JSON.stringify(content);
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const section = await db.homepageSection.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: section,
      message: "Section updated successfully",
    });
  } catch (error: unknown) {
    console.error("[HOMEPAGE_PUT]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update section" },
      { status: 500 }
    );
  }
}

// ============ DELETE: Delete Section ============

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Section ID is required" },
        { status: 400 }
      );
    }

    const existing = await db.homepageSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    await db.homepageSection.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error: unknown) {
    console.error("[HOMEPAGE_DELETE]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete section" },
      { status: 500 }
    );
  }
}
