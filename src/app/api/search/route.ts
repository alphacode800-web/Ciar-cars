// =============================================================================
// CIAR Cars - Instant Search API
// GET /api/search?q=... - Search cars by title, brand, model, description
// Returns top 8 results
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No search query provided",
      });
    }

    const query = q.trim();

    const cars = await db.car.findMany({
      where: {
        status: "active",
        OR: [
          { title: { contains: query } },
          { brand: { contains: query } },
          { model: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 8,
      orderBy: [
        { isFeatured: "desc" },
        { viewsCount: "desc" },
      ],
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    const formattedResults = cars.map((car) => ({
      id: car.id,
      title: car.title,
      slug: car.slug,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      currency: car.currency,
      condition: car.condition,
      city: car.city,
      mileage: car.mileage,
      fuelType: car.fuelType,
      transmission: car.transmission,
      bodyType: car.bodyType,
      primaryImage: car.images[0]?.url || null,
      ownerName: car.owner?.name || null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedResults,
      meta: {
        query,
        resultCount: formattedResults.length,
      },
    });
  } catch (error) {
    console.error("[SEARCH_GET]", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
