import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { buildPagination } from '@/lib/api-response';
import type { CarListQuery, CreateCarInput } from '@/validators/car.schema';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 0;
  while (await db.car.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

export const carService = {
  async list(query: CarListQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CarWhereInput = {};

    if (filters.status) where.status = filters.status;
    else where.status = 'active';

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { brand: { contains: filters.search } },
        { model: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters.brand) where.brand = filters.brand;
    if (filters.model) where.model = { contains: filters.model };
    if (filters.year) where.year = filters.year;
    if (filters.condition) where.condition = filters.condition;
    if (filters.fuelType) where.fuelType = filters.fuelType;
    if (filters.transmission) where.transmission = filters.transmission;
    if (filters.bodyType) where.bodyType = filters.bodyType;
    if (filters.city) where.city = { contains: filters.city };
    if (filters.country) where.country = filters.country;
    if (filters.ownerId) where.ownerId = filters.ownerId;
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
    if (filters.isAvailableForRent !== undefined) {
      where.isAvailableForRent = filters.isAvailableForRent;
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }
    if (filters.minMileage !== undefined || filters.maxMileage !== undefined) {
      where.mileage = {};
      if (filters.minMileage !== undefined) where.mileage.gte = filters.minMileage;
      if (filters.maxMileage !== undefined) where.mileage.lte = filters.maxMileage;
    }

    const validSortFields = ['price', 'createdAt', 'updatedAt', 'year', 'mileage', 'viewsCount', 'horsepower'];
    const orderBy: Prisma.CarOrderByWithRelationInput = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' };

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
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { reviews: true } },
        },
      }),
      db.car.count({ where }),
    ]);

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
      country: car.country,
      status: car.status,
      isFeatured: car.isFeatured,
      isBoosted: car.isBoosted,
      isNegotiable: car.isNegotiable,
      isAvailableForRent: car.isAvailableForRent,
      rentalPriceDaily: car.rentalPriceDaily,
      viewsCount: car.viewsCount,
      createdAt: car.createdAt,
      primaryImage: car.images[0]?.url ?? null,
      ownerName: car.owner?.name ?? null,
      averageRating: car.owner?.rating ?? 0,
      reviewCount: car._count?.reviews ?? 0,
    }));

    return {
      cars: formattedCars,
      pagination: buildPagination(page, limit, total),
    };
  },

  async create(ownerId: string, input: CreateCarInput) {
    const baseSlug = slugify(`${input.brand}-${input.model}-${input.year}`);
    const slug = await uniqueSlug(baseSlug);

    return db.car.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        brand: input.brand,
        model: input.model,
        year: input.year,
        condition: input.condition,
        mileage: input.mileage,
        fuelType: input.fuelType,
        transmission: input.transmission,
        engineSize: input.engineSize,
        horsepower: input.horsepower,
        drivetrain: input.drivetrain,
        bodyType: input.bodyType,
        doors: input.doors,
        seats: input.seats,
        exteriorColor: input.exteriorColor,
        interiorColor: input.interiorColor,
        price: input.price,
        currency: input.currency,
        isNegotiable: input.isNegotiable,
        city: input.city,
        country: input.country,
        address: input.address,
        isAvailableForRent: input.isAvailableForRent,
        rentalPriceDaily: input.rentalPriceDaily,
        rentalPriceWeekly: input.rentalPriceWeekly,
        rentalPriceMonthly: input.rentalPriceMonthly,
        ownerId,
        status: 'pending',
        images: input.images?.length
          ? {
              create: input.images.map((img, i) => ({
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary ?? i === 0,
                order: i,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });
  },

  async getStats() {
    const [total, active, featured, forRent, avgPrice] = await Promise.all([
      db.car.count(),
      db.car.count({ where: { status: 'active' } }),
      db.car.count({ where: { isFeatured: true, status: 'active' } }),
      db.car.count({ where: { isAvailableForRent: true, status: 'active' } }),
      db.car.aggregate({ _avg: { price: true }, where: { status: 'active' } }),
    ]);

    return {
      total,
      active,
      featured,
      forRent,
      averagePrice: avgPrice._avg.price ?? 0,
    };
  },
};
