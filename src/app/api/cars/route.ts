// =============================================================================
// CIAR Cars - Cars API (List + Create)
// GET  /api/cars     - List cars with filters, pagination, sorting
// POST /api/cars     - Create a new car listing
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { Prisma } from "@prisma/client";

// ============ GET: List Cars ============

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE)))
    );
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CarWhereInput = {};

    // Status filter - default to active only for public listing
    const status = searchParams.get("status");
    if (status) {
      where.status = status;
    } else {
      where.status = "active";
    }

    // Text search
    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Brand
    const brand = searchParams.get("brand");
    if (brand) where.brand = brand;

    // Model
    const model = searchParams.get("model");
    if (model) where.model = model;

    // Year
    const year = searchParams.get("year");
    if (year) where.year = parseInt(year);

    // Condition
    const condition = searchParams.get("condition");
    if (condition) where.condition = condition;

    // Fuel type
    const fuelType = searchParams.get("fuelType");
    if (fuelType) where.fuelType = fuelType;

    // Transmission
    const transmission = searchParams.get("transmission");
    if (transmission) where.transmission = transmission;

    // Body type
    const bodyType = searchParams.get("bodyType");
    if (bodyType) where.bodyType = bodyType;

    // City
    const city = searchParams.get("city");
    if (city) where.city = { contains: city };

    // Price range
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Mileage range
    const minMileage = searchParams.get("minMileage");
    const maxMileage = searchParams.get("maxMileage");
    if (minMileage || maxMileage) {
      where.mileage = {};
      if (minMileage) where.mileage.gte = parseFloat(minMileage);
      if (maxMileage) where.mileage.lte = parseFloat(maxMileage);
    }

    // Featured
    const isFeatured = searchParams.get("isFeatured");
    if (isFeatured !== null && isFeatured !== undefined && isFeatured !== "") {
      where.isFeatured = isFeatured === "true";
    }

    // Available for rent
    const isAvailableForRent = searchParams.get("isAvailableForRent");
    if (isAvailableForRent !== null && isAvailableForRent !== undefined && isAvailableForRent !== "") {
      where.isAvailableForRent = isAvailableForRent === "true";
    }

    // Owner filter
    const ownerId = searchParams.get("ownerId");
    if (ownerId) where.ownerId = ownerId;

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const orderBy: Prisma.CarOrderByWithRelationInput = {};
    const validSortFields = ["price", "createdAt", "updatedAt", "year", "mileage", "viewsCount", "horsepower"];
    if (validSortFields.includes(sortBy)) {
      (orderBy as Record<string, string>)[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    // Fetch cars with owner info and primary image
    const [cars, total] = await Promise.all([
      db.car.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
      }),
      db.car.count({ where }),
    ]);

    // Format response
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
      isBoosted: car.isBoosted,
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[CARS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}

// ============ POST: Create Car ============

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

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
      images,
      specifications,
    } = body;

    // Validate required fields
    if (!title || !brand || !model || !year || !city || price === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, brand, model, year, city, price" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now();

    // Create car with images and specifications
    const car = await db.car.create({
      data: {
        title,
        slug,
        description: description || null,
        brand,
        model,
        year: parseInt(year),
        condition: condition || "used",
        mileage: mileage ? parseFloat(mileage) : null,
        exteriorColor: exteriorColor || null,
        interiorColor: interiorColor || null,
        fuelType: fuelType || null,
        transmission: transmission || null,
        engineSize: engineSize || null,
        horsepower: horsepower ? parseInt(horsepower) : null,
        drivetrain: drivetrain || null,
        bodyType: bodyType || null,
        doors: doors ? parseInt(doors) : null,
        seats: seats ? parseInt(seats) : null,
        city,
        country: country || "Egypt",
        address: address || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        price: parseFloat(price),
        isNegotiable: isNegotiable ?? false,
        isAvailableForRent: isAvailableForRent ?? false,
        rentalPriceDaily: rentalPriceDaily ? parseFloat(rentalPriceDaily) : null,
        rentalPriceWeekly: rentalPriceWeekly ? parseFloat(rentalPriceWeekly) : null,
        rentalPriceMonthly: rentalPriceMonthly ? parseFloat(rentalPriceMonthly) : null,
        ownerId: user.id,
        status: "pending",
        images: images
          ? {
              create: images.map((img: { url: string; alt?: string; isPrimary?: boolean }, idx: number) => ({
                url: img.url,
                alt: img.alt || `${title} - Image ${idx + 1}`,
                isPrimary: img.isPrimary ?? idx === 0,
                order: idx,
              })),
            }
          : undefined,
        specifications: specifications
          ? {
              create: specifications.map((spec: { key: string; value: string; group?: string }) => ({
                key: spec.key,
                value: spec.value,
                group: spec.group || null,
              })),
            }
          : undefined,
      },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        images: true,
        specifications: true,
      },
    });

    // Update owner listing count
    await db.user.update({
      where: { id: user.id },
      data: { totalListings: { increment: 1 } },
    });

    return NextResponse.json(
      { success: true, data: car, message: "Car listing created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[CARS_POST]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create car listing" },
      { status: 500 }
    );
  }
}
