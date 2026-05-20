// =============================================================================
// CIAR Cars - Admin Navigation API
// GET    /api/admin/navigation - List all navigation items (navbar & footer)
// POST   /api/admin/navigation - Create navigation item
// PUT    /api/admin/navigation - Update navigation item (id in body)
// DELETE /api/admin/navigation - Delete navigation item (id as query param)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const VALID_POSITIONS = ["navbar", "footer"];

// ============ OPTIONS: CORS ============

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

// ============ GET: List All Navigation Items ============

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");

    const where: Record<string, unknown> = { parentId: null };

    if (position) {
      if (!VALID_POSITIONS.includes(position)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid position. Must be one of: ${VALID_POSITIONS.join(", ")}`,
          },
          { status: 400 }
        );
      }
      where.position = position;
    }

    const items = await db.navigationItem.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        children: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("[ADMIN_NAVIGATION_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch navigation items" },
      { status: 500 }
    );
  }
}

// ============ POST: Create Navigation Item ============

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);

    const body = await request.json();
    const { label, url, icon, parentId, position, order, isActive, isOpen } = body;

    if (!label) {
      return NextResponse.json(
        { success: false, error: "Label is required" },
        { status: 400 }
      );
    }

    if (position && !VALID_POSITIONS.includes(position)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid position. Must be one of: ${VALID_POSITIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate parentId if provided
    if (parentId) {
      const parent = await db.navigationItem.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return NextResponse.json(
          { success: false, error: "Parent navigation item not found" },
          { status: 404 }
        );
      }
    }

    const item = await db.navigationItem.create({
      data: {
        label,
        url: url || null,
        icon: icon || null,
        parentId: parentId || null,
        position: position || "navbar",
        order: order ?? 0,
        isActive: isActive ?? true,
        isOpen: isOpen ?? false,
      },
    });

    return NextResponse.json(
      { success: true, data: item, message: "Navigation item created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[ADMIN_NAVIGATION_POST]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create navigation item" },
      { status: 500 }
    );
  }
}

// ============ PUT: Update Navigation Item ============

export async function PUT(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);

    const body = await request.json();
    const { id, label, url, icon, parentId, position, order, isActive, isOpen } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required in request body" },
        { status: 400 }
      );
    }

    const existing = await db.navigationItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Navigation item not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (label !== undefined) updateData.label = label;
    if (url !== undefined) updateData.url = url || null;
    if (icon !== undefined) updateData.icon = icon || null;
    if (parentId !== undefined) updateData.parentId = parentId || null;
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
    if (isOpen !== undefined) updateData.isOpen = isOpen;

    // Prevent circular reference: cannot set self as parent
    if (parentId === id) {
      return NextResponse.json(
        { success: false, error: "Cannot set item as its own parent" },
        { status: 400 }
      );
    }

    const item = await db.navigationItem.update({
      where: { id },
      data: updateData,
      include: {
        children: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: item,
      message: "Navigation item updated successfully",
    });
  } catch (error: unknown) {
    console.error("[ADMIN_NAVIGATION_PUT]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update navigation item" },
      { status: 500 }
    );
  }
}

// ============ DELETE: Delete Navigation Item ============

export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "id query parameter is required" },
        { status: 400 }
      );
    }

    const existing = await db.navigationItem.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Navigation item not found" },
        { status: 404 }
      );
    }

    // Check if item has children
    if (existing.children.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete navigation item with children. Delete or reassign children first.",
        },
        { status: 400 }
      );
    }

    await db.navigationItem.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Navigation item deleted successfully",
    });
  } catch (error: unknown) {
    console.error("[ADMIN_NAVIGATION_DELETE]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete navigation item" },
      { status: 500 }
    );
  }
}
