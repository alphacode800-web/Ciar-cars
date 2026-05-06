// =============================================================================
// CIAR Cars - Admin User Detail API
// GET    /api/admin/users/[id]  - Get user details
// PUT    /api/admin/users/[id]  - Update user (role, isActive, isBanned)
// DELETE /api/admin/users/[id]  - Delete user
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

// ============ GET: User Details ============

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request);
    const { id } = await params;

    const targetUser = await db.user.findUnique({
      where: { id },
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
        bio: true,
        city: true,
        country: true,
        address: true,
        businessName: true,
        businessLicense: true,
        walletBalance: true,
        rating: true,
        totalReviews: true,
        totalListings: true,
        totalSales: true,
        createdAt: true,
        updatedAt: true,
        cars: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            status: true,
            price: true,
            viewsCount: true,
            createdAt: true,
          },
        },
        rentals: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            totalPrice: true,
            startDate: true,
            endDate: true,
            createdAt: true,
          },
        },
        walletTransactions: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: targetUser,
    });
  } catch (error: unknown) {
    console.error("[ADMIN_USER_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// ============ PUT: Update User ============

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin(request);
    const { id } = await params;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent self-demotion
    if (id === adminUser.id) {
      return NextResponse.json(
        { success: false, error: "You cannot modify your own account" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role, isActive, isBanned, bannedReason } = body;

    const updateData: Record<string, unknown> = {};

    if (role !== undefined) {
      const validRoles = ["user", "seller", "admin", "super_admin"];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }
      // Only super_admin can assign admin/super_admin roles
      if ((role === "admin" || role === "super_admin") && adminUser.role !== "super_admin") {
        return NextResponse.json(
          { success: false, error: "Only super admin can assign admin roles" },
          { status: 403 }
        );
      }
      updateData.role = role;
    }

    if (isActive !== undefined) updateData.isActive = isActive;
    if (isBanned !== undefined) {
      updateData.isBanned = isBanned;
      if (isBanned) {
        updateData.bannedReason = bannedReason || "Account suspended by admin";
      } else {
        updateData.bannedReason = null;
      }
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isBanned: true,
        bannedReason: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error: unknown) {
    console.error("[ADMIN_USER_PUT]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// ============ DELETE: Delete User ============

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin(request);
    const { id } = await params;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (id === adminUser.id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Only super_admin can delete admins
    if (
      (existing.role === "admin" || existing.role === "super_admin") &&
      adminUser.role !== "super_admin"
    ) {
      return NextResponse.json(
        { success: false, error: "Only super admin can delete admin accounts" },
        { status: 403 }
      );
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: unknown) {
    console.error("[ADMIN_USER_DELETE]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
