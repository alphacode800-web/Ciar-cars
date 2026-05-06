// =============================================================================
// CIAR Cars - Single Car API (Get + Update + Delete)
// GET    /api/cars/[id]  - Get car with full details
// PUT    /api/cars/[id]  - Update car listing
// DELETE /api/cars/[id]  - Delete car listing
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// ============ GET: Single Car ============

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const car = await db.car.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            city: true,
            country: true,
            rating: true,
            totalReviews: true,
            totalListings: true,
            businessName: true,
            createdAt: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        specifications: {
          orderBy: { group: "asc" },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { rentalBookings: true },
        },
      },
    });

    if (!car) {
      return NextResponse.json(
        { success: false, error: "Car not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await db.car.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    // Calculate average rating from reviews
    const avgRating =
      car.reviews.length > 0
        ? car.reviews.reduce((sum, r) => sum + r.rating, 0) / car.reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...car,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: car.reviews.length,
        bookingCount: car._count.rentalBookings,
      },
    });
  } catch (error) {
    console.error("[CAR_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch car" },
      { status: 500 }
    );
  }
}

// ============ PUT: Update Car ============

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const existingCar = await db.car.findUnique({ where: { id } });

    if (!existingCar) {
      return NextResponse.json(
        { success: false, error: "Car not found" },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (existingCar.ownerId !== user.id && user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "You don't have permission to update this car" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      brand,
      model,
      year,
      condition,
      mileage,
      exteriorColor,
      interiorColor,
      fuelType,
      transmission,
      engineSize,
      horsepower,
      drivetrain,
      bodyType,
      doors,
      seats,
      city,
      country,
      address,
      latitude,
      longitude,
      price,
      isNegotiable,
      isAvailableForRent,
      rentalPriceDaily,
      rentalPriceWeekly,
      rentalPriceMonthly,
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
    }
    if (description !== undefined) updateData.description = description;
    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (year !== undefined) updateData.year = parseInt(year);
    if (condition !== undefined) updateData.condition = condition;
    if (mileage !== undefined) updateData.mileage = mileage ? parseFloat(mileage) : null;
    if (exteriorColor !== undefined) updateData.exteriorColor = exteriorColor;
    if (interiorColor !== undefined) updateData.interiorColor = interiorColor;
    if (fuelType !== undefined) updateData.fuelType = fuelType;
    if (transmission !== undefined) updateData.transmission = transmission;
    if (engineSize !== undefined) updateData.engineSize = engineSize;
    if (horsepower !== undefined) updateData.horsepower = horsepower ? parseInt(horsepower) : null;
    if (drivetrain !== undefined) updateData.drivetrain = drivetrain;
    if (bodyType !== undefined) updateData.bodyType = bodyType;
    if (doors !== undefined) updateData.doors = doors ? parseInt(doors) : null;
    if (seats !== undefined) updateData.seats = seats ? parseInt(seats) : null;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (isNegotiable !== undefined) updateData.isNegotiable = isNegotiable;
    if (isAvailableForRent !== undefined) updateData.isAvailableForRent = isAvailableForRent;
    if (rentalPriceDaily !== undefined) updateData.rentalPriceDaily = rentalPriceDaily ? parseFloat(rentalPriceDaily) : null;
    if (rentalPriceWeekly !== undefined) updateData.rentalPriceWeekly = rentalPriceWeekly ? parseFloat(rentalPriceWeekly) : null;
    if (rentalPriceMonthly !== undefined) updateData.rentalPriceMonthly = rentalPriceMonthly ? parseFloat(rentalPriceMonthly) : null;

    const car = await db.car.update({
      where: { id },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        images: { orderBy: { order: "asc" } },
        specifications: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: car,
      message: "Car updated successfully",
    });
  } catch (error: unknown) {
    console.error("[CAR_PUT]", error);
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

// ============ DELETE: Delete Car ============

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const existingCar = await db.car.findUnique({ where: { id } });

    if (!existingCar) {
      return NextResponse.json(
        { success: false, error: "Car not found" },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (existingCar.ownerId !== user.id && user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "You don't have permission to delete this car" },
        { status: 403 }
      );
    }

    // Delete car (cascade will remove images, specs, blocked dates)
    await db.car.delete({ where: { id } });

    // Update owner listing count
    await db.user.update({
      where: { id: existingCar.ownerId },
      data: { totalListings: { decrement: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error: unknown) {
    console.error("[CAR_DELETE]", error);
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
