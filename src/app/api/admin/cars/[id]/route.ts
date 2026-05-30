// =============================================================================
// CIAR Cars - Admin Car Detail API
// PUT    /api/admin/cars/[id]  - Update car status (approve, reject, feature)
// DELETE /api/admin/cars/[id]  - Delete car
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

// ============ PUT: Update Car (Admin) ============

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin(request);
    const { id } = await params;

    const existing = await db.car.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Car not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      status,
      isFeatured,
      featuredUntil,
      title,
      price,
      country,
      city,
      description,
      condition,
      mileage,
      fuelType,
      transmission,
      bodyType,
      primaryImageUrl,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (price !== undefined) updateData.price = parseFloat(String(price));
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (description !== undefined) updateData.description = description;
    if (condition !== undefined) updateData.condition = condition;
    if (mileage !== undefined) updateData.mileage = parseFloat(String(mileage));
    if (fuelType !== undefined) updateData.fuelType = fuelType;
    if (transmission !== undefined) updateData.transmission = transmission;
    if (bodyType !== undefined) updateData.bodyType = bodyType;

    // Update status
    if (status !== undefined) {
      const validStatuses = ["active", "pending", "sold", "archived"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Update featured status
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
      if (isFeatured && featuredUntil) {
        updateData.featuredUntil = new Date(featuredUntil);
      } else if (!isFeatured) {
        updateData.featuredUntil = null;
      }
    }

    const car = await db.car.update({
      where: { id },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        images: { orderBy: { order: 'asc' } },
      },
    });

    if (primaryImageUrl && typeof primaryImageUrl === 'string') {
      const primary = await db.carImage.findFirst({
        where: { carId: id, isPrimary: true },
      });
      if (primary) {
        await db.carImage.update({
          where: { id: primary.id },
          data: { url: primaryImageUrl },
        });
      } else {
        await db.carImage.create({
          data: {
            carId: id,
            url: primaryImageUrl,
            isPrimary: true,
            order: 0,
            alt: car.title,
          },
        });
      }
    }

    const updated = await db.car.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        images: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Car updated successfully',
    });
  } catch (error: unknown) {
    console.error("[ADMIN_CAR_PUT]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update car" },
      { status: 500 }
    );
  }
}

// ============ DELETE: Delete Car (Admin) ============

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin(request);
    const { id } = await params;

    const existing = await db.car.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Car not found" },
        { status: 404 }
      );
    }

    // Delete car (cascade removes images, specs, blocked dates)
    await db.car.delete({ where: { id } });

    // Update owner listing count
    await db.user.update({
      where: { id: existing.ownerId },
      data: { totalListings: { decrement: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error: unknown) {
    console.error("[ADMIN_CAR_DELETE]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete car" },
      { status: 500 }
    );
  }
}
