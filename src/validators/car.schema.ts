import { z } from 'zod';

export const createCarSchema = z.object({
  title: z.string().min(3).max(100),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  condition: z.enum(['new', 'used']).default('used'),
  mileage: z.number().min(0).optional(),
  description: z.string().max(5000).optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  engineSize: z.string().optional(),
  horsepower: z.number().int().positive().optional(),
  drivetrain: z.string().optional(),
  bodyType: z.string().optional(),
  doors: z.number().int().positive().optional(),
  seats: z.number().int().positive().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().length(3).default('EGP'),
  isNegotiable: z.boolean().default(true),
  city: z.string().min(1),
  country: z.string().min(1).default('Egypt'),
  address: z.string().optional(),
  isAvailableForRent: z.boolean().default(false),
  rentalPriceDaily: z.number().positive().optional(),
  rentalPriceWeekly: z.number().positive().optional(),
  rentalPriceMonthly: z.number().positive().optional(),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        alt: z.string().optional(),
        isPrimary: z.boolean().optional(),
      })
    )
    .optional(),
});

export const carListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  status: z.string().optional(),
  search: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().optional(),
  condition: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  bodyType: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minMileage: z.coerce.number().optional(),
  maxMileage: z.coerce.number().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isAvailableForRent: z.coerce.boolean().optional(),
  ownerId: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateCarInput = z.infer<typeof createCarSchema>;
export type CarListQuery = z.infer<typeof carListQuerySchema>;
