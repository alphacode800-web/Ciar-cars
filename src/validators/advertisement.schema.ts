import { z } from 'zod';
import { AD_CATEGORIES, AD_STATUSES, CLOTHING_SIZES } from '@/lib/ad-constants';

const categoryValues = AD_CATEGORIES.map((c) => c.value) as [string, ...string[]];
const statusValues = [...AD_STATUSES] as [string, ...string[]];

const mediaItemSchema = z.object({
  url: z.string().min(1),
  type: z.enum(['image', 'video']).default('image'),
  mimeType: z.string().optional().nullable(),
  alt: z.string().max(255).optional().nullable(),
  isPrimary: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const createAdvertisementSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional().nullable(),
  category: z.enum(categoryValues),
  subcategory: z.string().max(100).optional().nullable(),
  fabricType: z.string().max(100).optional().nullable(),
  colors: z.array(z.string().max(50)).max(20).optional().default([]),
  sizes: z.array(z.string().max(20)).max(30).optional().default([]),
  quantity: z.number().int().min(0).optional().nullable(),
  price: z.number().positive(),
  currency: z.string().max(10).optional().default('EGP'),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  shippingInfo: z.string().max(500).optional().nullable(),
  shippingAvailable: z.boolean().optional().default(false),
  phone: z.string().max(30).optional().nullable(),
  whatsapp: z.string().max(120).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  planId: z.string().optional().nullable(),
  media: z.array(mediaItemSchema).max(20).optional().default([]),
  submit: z.boolean().optional().default(false),
});

export const updateAdvertisementSchema = createAdvertisementSchema.partial();

export const advertisementListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  shippingAvailable: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === true || v === 'true')),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  isFeatured: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === true || v === 'true')),
  status: z.string().optional(),
  ownerId: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'price', 'viewsCount', 'endsAt', 'publishedAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  mine: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true'),
});

export const payAdvertisementSchema = z.object({
  method: z.enum(['wallet', 'bank_transfer']),
  proofUrl: z.string().min(1).optional().nullable(),
});

export const adminAdvertisementActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'pause', 'resume', 'feature', 'unfeature', 'delete']),
  rejectedReason: z.string().max(1000).optional().nullable(),
  featuredUntilDays: z.number().int().min(1).max(365).optional(),
});

export const adminUpdateAdvertisementSchema = updateAdvertisementSchema.extend({
  isFeatured: z.boolean().optional(),
  endsAt: z.string().datetime().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  rejectedReason: z.string().max(1000).optional().nullable(),
  status: z.enum(statusValues).optional(),
});

export const adPlanSchema = z.object({
  name: z.string().min(2).max(100),
  nameAr: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  descriptionAr: z.string().max(500).optional().nullable(),
  price: z.number().min(0),
  currency: z.string().max(10).optional().default('EGP'),
  durationDays: z.number().int().min(1).max(365),
  maxImages: z.number().int().min(1).max(50),
  allowVideo: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
});

export type CreateAdvertisementInput = z.infer<typeof createAdvertisementSchema>;
export type UpdateAdvertisementInput = z.infer<typeof updateAdvertisementSchema>;
export type AdvertisementListQuery = z.infer<typeof advertisementListQuerySchema>;
export type PayAdvertisementInput = z.infer<typeof payAdvertisementSchema>;
export type AdPlanInput = z.infer<typeof adPlanSchema>;

export { CLOTHING_SIZES };
