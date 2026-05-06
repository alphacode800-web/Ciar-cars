// =============================================================================
// CIAR Cars - User Profile API
// GET /api/users/profile - Get current user profile
// PUT /api/users/profile - Update current user profile
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// ============ GET: Current User Profile ============

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        bio: true,
        city: true,
        country: true,
        address: true,
        businessName: true,
        rating: true,
        totalReviews: true,
        totalListings: true,
        totalSales: true,
        walletBalance: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: unknown) {
    console.error("[PROFILE_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// ============ PUT: Update Profile ============

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const { name, phone, bio, city, country, address, avatar } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (address !== undefined) updateData.address = address;
    if (avatar !== undefined) updateData.avatar = avatar;

    const profile = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        bio: true,
        city: true,
        country: true,
        address: true,
        businessName: true,
        rating: true,
        totalReviews: true,
        totalListings: true,
        totalSales: true,
        walletBalance: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: profile,
      message: "Profile updated successfully",
    });
  } catch (error: unknown) {
    console.error("[PROFILE_PUT]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
