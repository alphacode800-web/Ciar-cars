import { z } from 'zod';

export const createBookingSchema = z.object({
  carId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  deliveryAddress: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const bookingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  status: z.string().optional(),
  carId: z.string().optional(),
  userId: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;
