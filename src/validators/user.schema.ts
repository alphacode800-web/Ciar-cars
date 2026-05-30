import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  avatar: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
