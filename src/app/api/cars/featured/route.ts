// =============================================================================
// CIAR Cars - Featured Cars API
// GET /api/cars/featured - Get featured cars (isFeatured=true, limit 8)
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cars = await db.car.findMany({
      where: {
        status: "active",
        isFeatured: true,
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
            rating: true,
            totalReviews: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    const formattedCars = cars.map((car) => ({
      id: car.id,
      title: car.title,
      slug: car.slug,
      brand: car.brand,
      model: car.model,
      year: car.year,
      condition: car.condition,
      price: car.price,
      currency: car.currency,
      mileage: car.mileage,
      fuelType: car.fuelType,
      transmission: car.transmission,
      bodyType: car.bodyType,
      city: car.city,
      status: car.status,
      isFeatured: car.isFeatured,
      isNegotiable: car.isNegotiable,
      isAvailableForRent: car.isAvailableForRent,
      rentalPriceDaily: car.rentalPriceDaily,
      viewsCount: car.viewsCount,
      createdAt: car.createdAt,
      primaryImage: car.images[0]?.url || null,
      ownerName: car.owner?.name || null,
      averageRating: car.owner?.rating || 0,
      reviewCount: car._count?.reviews || 0,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCars,
    });
  } catch (error) {
    console.error("[FEATURED_CARS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch featured cars" },
      { status: 500 }
    );
  }
}
